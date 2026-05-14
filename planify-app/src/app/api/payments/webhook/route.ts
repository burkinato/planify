import { createClient as createSupabaseJS } from '@supabase/supabase-js';
import { verifyPayTRWebhookHash } from '@/lib/paytr';

/**
 * PayTR Webhook/Notification Handler
 * 
 * Abonelik + Kredi Hibrit Sistem:
 * - Abonelik ödemesi: 1 proje kredisi ekler + subscription aktif eder
 * - Kredi paketi ödemesi: Paket miktarı kadar proje kredisi ekler
 * 
 * PayTR ödeme sonucunu bu endpoint'e POST olarak bildirir.
 * Başarılı ödeme geldiğinde:
 * 1. Hash doğrulaması yap
 * 2. Duplicate kontrolü yap (idempotency - DB üzerinden)
 * 3. Kredi ekle + gerekiyorsa subscription aktif et (RPC ile güvenli)
 * 4. Payment history kaydını güncelle
 * 5. PayTR'ye "OK" yanıtı dön
 */

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const merchantOid = formData.get('merchant_oid') as string;
    const status = formData.get('status') as string;
    const totalAmount = formData.get('total_amount') as string;
    const hash = formData.get('hash') as string;
    const failedReason = formData.get('failed_reason') as string | null;

    if (!merchantOid || !status || !hash) {
      return new Response('INVALID_PARAMS', { status: 400 });
    }

    const merchantKey = process.env.PAYTR_MERCHANT_KEY;
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

    if (!merchantKey || !merchantSalt) {
      console.error('PayTR credentials not configured');
      return new Response('CONFIG_ERROR', { status: 500 });
    }

    // 1. Hash Verification
    const isHashValid = verifyPayTRWebhookHash({
      merchantOid,
      merchantSalt,
      status,
      totalAmount,
      merchantKey,
      receivedHash: hash,
    });

    if (!isHashValid) {
      console.warn('PayTR Webhook: Hash mismatch!', { merchantOid, receivedHash: hash });
      return new Response('PAYTR_IFRAME_FAILED REASON: bad hash', { status: 403 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not configured');
      return new Response('SERVER_CONFIG_ERROR', { status: 500 });
    }

    const supabaseAdmin = createSupabaseJS(supabaseUrl, supabaseServiceKey);

    // 2. Idempotency Check using Database
    const { error: idempotencyError } = await supabaseAdmin
      .from('processed_webhooks')
      .insert({ id: merchantOid });
      
    if (idempotencyError) {
      // If error is unique violation (code 23505), it's already processed
      if (idempotencyError.code === '23505') {
         console.log('PayTR Webhook: Duplicate detected, already processed:', merchantOid);
         return new Response('OK', { status: 200 });
      }
      console.error('Idempotency check failed:', idempotencyError);
      return new Response('ERROR', { status: 500 });
    }

    // 3. Get payment history record
    const { data: paymentRecord, error: fetchError } = await supabaseAdmin
      .from('payment_history')
      .select('*')
      .eq('merchant_oid', merchantOid)
      .single();

    if (fetchError || !paymentRecord) {
      console.error('Payment record not found:', merchantOid, fetchError);
      return new Response('RECORD_NOT_FOUND', { status: 404 });
    }

    if (status === 'success') {
      const userId = paymentRecord.user_id;
      const paymentType = paymentRecord.payment_type; // 'subscription' | 'credit_package'
      
      let creditsToAdd = 0;
      let transactionType = 'purchase';
      let transactionDescription = '';

      if (paymentType === 'subscription') {
        // Abonelik ödemesi: 1 proje kredisi + subscription aktif et
        creditsToAdd = 1;
        transactionType = 'subscription';
        transactionDescription = 'KolayTahliye Pro abonelik — 1 Proje Hakkı';

        // Subscription oluştur/güncelle
        const now = new Date();
        const periodEnd = new Date(now);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id: userId,
            plan_id: paymentRecord.plan_id,
            status: 'active',
            payment_provider: 'paytr',
            provider_subscription_id: merchantOid,
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            updated_at: now.toISOString(),
          }, {
            onConflict: 'user_id',
          });

        // user_credits tablosunda subscription durumunu güncelle
        await supabaseAdmin
          .from('user_credits')
          .update({
            has_active_subscription: true,
            subscription_started_at: now.toISOString(),
          })
          .eq('user_id', userId);

      } else {
        // Kredi paketi ödemesi: Paket miktarı kadar kredi ekle
        const { data: pkg } = await supabaseAdmin
          .from('credit_packages')
          .select('id, name, credits')
          .eq('id', paymentRecord.plan_id)
          .single();

        if (!pkg) {
          console.error('Credit package not found for payment:', merchantOid);
          return new Response('PACKAGE_NOT_FOUND', { status: 404 });
        }

        creditsToAdd = pkg.credits;
        transactionType = 'purchase';
        transactionDescription = `${pkg.name} satın alımı — ${pkg.credits} Proje Hakkı`;
      }

      // Add to credit_transactions
      const { error: txError } = await supabaseAdmin
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount: creditsToAdd,
          transaction_type: transactionType,
          description: transactionDescription,
        });

      if (txError) {
        console.error('Failed to create credit transaction:', txError);
        return new Response('TRANSACTION_ERROR', { status: 500 });
      }

      // Use Atomic RPC to safely increment balance
      const { error: subError } = await supabaseAdmin
        .rpc('increment_user_credits', {
          p_user_id: userId,
          p_amount: creditsToAdd
        });

      if (subError) {
        console.error('Failed to update user credits:', subError);
        return new Response('CREDIT_UPDATE_ERROR', { status: 500 });
      }

      // Update payment history
      const now = new Date();
      await supabaseAdmin
        .from('payment_history')
        .update({
          status: 'completed',
          completed_at: now.toISOString(),
        })
        .eq('merchant_oid', merchantOid);

      // ─── KDV ayrıştırma + Fatura kaydı (Faz 3.4) ──────────────────────
      // totalAmount PayTR'den kuruş cinsinden gelir (e.g. "24900" = ₺249.00)
      try {
        const grossTRY = Number(totalAmount) / 100;
        if (grossTRY > 0 && Number.isFinite(grossTRY)) {
          // Aktif KDV oranını çek (varsayılan %20)
          const { data: taxRow } = await supabaseAdmin
            .from('tax_rates')
            .select('rate')
            .eq('country', 'TR')
            .eq('is_default', true)
            .maybeSingle();
          const taxRate = taxRow?.rate ?? 0.20;

          const netAmount = Number((grossTRY / (1 + taxRate)).toFixed(2));
          const taxAmount = Number((grossTRY - netAmount).toFixed(2));

          // Müşteri profil bilgilerini al
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('full_name, company, phone')
            .eq('id', userId)
            .maybeSingle();

          const { data: userEmail } = await supabaseAdmin.auth.admin.getUserById(userId);

          // Fatura numarası üret (RPC)
          const { data: invoiceNoResult } = await supabaseAdmin.rpc('generate_invoice_no');
          const invoiceNo = invoiceNoResult || `KT-${now.getFullYear()}-${Date.now().toString().slice(-6)}`;

          const { error: invoiceError } = await supabaseAdmin
            .from('invoices')
            .insert({
              user_id: userId,
              invoice_no: invoiceNo,
              description: transactionDescription,
              net_amount_try: netAmount,
              tax_amount_try: taxAmount,
              total_amount_try: grossTRY,
              tax_rate: taxRate,
              currency: 'TRY',
              customer_name: profile?.full_name || 'KolayTahliye User',
              customer_email: userEmail?.user?.email || '',
              einvoice_status: 'pending',
              payment_provider: 'paytr',
              provider_payment_id: merchantOid,
            });

          if (invoiceError) {
            // Fatura oluşturulamasa bile ödeme başarılı sayılır; manuel olarak çözülür.
            console.error('Invoice creation failed (non-blocking):', invoiceError);
          } else {
            console.log('Invoice created:', invoiceNo, 'net:', netAmount, 'tax:', taxAmount);
          }
        }
      } catch (invoiceErr) {
        console.error('Invoice flow error (non-blocking):', invoiceErr);
      }

      console.log('PayTR Webhook: Payment success processed', {
        merchantOid,
        userId,
        paymentType,
        amount: totalAmount,
        addedCredits: creditsToAdd
      });

    } else {
      // Payment failed
      await supabaseAdmin
        .from('payment_history')
        .update({
          status: 'failed',
          error_message: failedReason || 'Payment failed',
        })
        .eq('merchant_oid', merchantOid);

      console.log('PayTR Webhook: Payment failed:', {
        merchantOid,
        status,
        reason: failedReason,
      });
    }

    // PayTR expects "OK" response
    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('ERROR', { status: 500 });
  }
}
