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

    // 3. Get payment history record
    const { data: paymentRecord, error: fetchError } = await supabaseAdmin
      .from('payment_history')
      .select('*, plans:plan_id(id, name, price_try, price_usd)')
      .eq('merchant_oid', merchantOid)
      .single();

    if (fetchError || !paymentRecord) {
      console.error('Payment record not found:', merchantOid, fetchError);
      return new Response('RECORD_NOT_FOUND', { status: 404 });
    }

    if (status === 'success') {
      // 4. Activate subscription in Supabase
      const plan = paymentRecord.plans;
      const userId = paymentRecord.user_id;

      // Calculate subscription end date (e.g., 1 month from now for monthly plans)
      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 1);

      // Upsert subscription (activate or update existing)
      const { error: subError } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan_id: plan.id,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: endDate.toISOString(),
          cancel_at_period_end: false,
        }, {
          onConflict: 'user_id',
        });

      if (subError) {
        console.error('Failed to activate subscription:', subError);
        return new Response('SUBSCRIPTION_ERROR', { status: 500 });
      }

      // 5. Update user's profile to pro tier
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          subscription_tier: 'pro',
          subscription_status: 'active',
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Failed to update profile:', profileError);
        // Don't fail the webhook, subscription is more important
      }

      // 6. Update payment history
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
        plan: plan.name,
        amount: totalAmount,
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
