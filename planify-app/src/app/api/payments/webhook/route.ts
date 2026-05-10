import { createClient as createSupabaseJS } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { verifyPayTRWebhookHash, generateMerchantOid } from '@/lib/paytr';

/**
 * PayTR Webhook/Notification Handler (Samet - P0 Fix)
 *
 * PayTR ödeme sonucunu bu endpoint'e POST olarak bildirir.
 * Başarılı ödeme geldiğinde:
 * 1. Hash doğrulaması yap (merchant_key + merchant_salt)
 * 2. Duplicate kontrolü yap (idempotency)
 * 3. Supabase'de subscription'ı aktif et
 * 4. Payment history kaydını güncelle
 * 5. PayTR'ye "OK" yanıtı dön
 */

// In-memory cache for processed webhooks (for idempotency)
// In production, use Redis or a database table
const processedWebhooks = new Set<string>();

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

    // 2. Idempotency Check (Samet: Bora'nın P0 sorununu çöz)
    if (processedWebhooks.has(merchantOid)) {
      console.log('PayTR Webhook: Duplicate detected, already processed:', merchantOid);
      return new Response('OK', { status: 200 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not configured');
      return new Response('SERVER_CONFIG_ERROR', { status: 500 });
    }

    const supabaseAdmin = createSupabaseJS(supabaseUrl, supabaseServiceKey);

    // 3. Get payment history record and related credit package
    const { data: paymentRecord, error: fetchError } = await supabaseAdmin
      .from('payment_history')
      .select('*, credit_packages:plan_id(id, name, price_try, credits)')
      .eq('merchant_oid', merchantOid)
      .single();

    if (fetchError || !paymentRecord) {
      console.error('Payment record not found:', merchantOid, fetchError);
      return new Response('RECORD_NOT_FOUND', { status: 404 });
    }

    if (status === 'success') {
      // 4. Add credits to user's account
      const pkg = paymentRecord.credit_packages;
      const userId = paymentRecord.user_id;

      if (!pkg) {
        console.error('Credit package not found for payment:', merchantOid);
        return new Response('PACKAGE_NOT_FOUND', { status: 404 });
      }

      // Add to credit_transactions
      const { error: txError } = await supabaseAdmin
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount: pkg.credits,
          transaction_type: 'purchase',
          description: `${pkg.name} satın alımı`,
        });

      if (txError) {
        console.error('Failed to create credit transaction:', txError);
        return new Response('TRANSACTION_ERROR', { status: 500 });
      }

      // Read current balance
      const { data: creditData } = await supabaseAdmin
        .from('user_credits')
        .select('balance, total_purchased')
        .eq('user_id', userId)
        .single();

      // Upsert balance
      const currentBalance = creditData?.balance || 0;
      const currentTotal = creditData?.total_purchased || 0;
      
      const { error: subError } = await supabaseAdmin
        .from('user_credits')
        .upsert({
          user_id: userId,
          balance: currentBalance + pkg.credits,
          total_purchased: currentTotal + pkg.credits,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',
        });

      if (subError) {
        console.error('Failed to update user credits:', subError);
        return new Response('CREDIT_UPDATE_ERROR', { status: 500 });
      }

      // 6. Update payment history
      const now = new Date();
      await supabaseAdmin
        .from('payment_history')
        .update({
          status: 'completed',
          completed_at: now.toISOString(),
        })
        .eq('merchant_oid', merchantOid);

      // Mark as processed (idempotency)
      processedWebhooks.add(merchantOid);

      console.log('PayTR Webhook: Payment success processed', {
        merchantOid,
        userId,
        package: pkg.name,
        amount: totalAmount,
        addedCredits: pkg.credits
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

    // 7. PayTR expects "OK" response
    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('ERROR', { status: 500 });
  }
}
