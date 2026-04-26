import { NextResponse } from 'next/server';

/**
 * PayTR Webhook/Notification Handler
 * 
 * PayTR ödeme sonucunu bu endpoint'e POST olarak bildirir.
 * Başarılı ödeme geldiğinde:
 * 1. Hash doğrulaması yap (merchant_key + merchant_salt)
 * 2. Supabase'de subscription'ı aktif et
 * 3. Payment history kaydı oluştur
 * 4. PayTR'ye "OK" yanıtı dön
 * 
 * PayTR Docs: https://dev.paytr.com/iframe-api (Bildirim URL bölümü)
 */

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const merchantOid = formData.get('merchant_oid') as string;
    const status = formData.get('status') as string;
    const totalAmount = formData.get('total_amount') as string;
    const hash = formData.get('hash') as string;

    if (!merchantOid || !status || !hash) {
      return new Response('INVALID_PARAMS', { status: 400 });
    }

    const merchantKey = process.env.PAYTR_MERCHANT_KEY;
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

    if (!merchantKey || !merchantSalt) {
      console.error('PayTR credentials not configured');
      return new Response('CONFIG_ERROR', { status: 500 });
    }

    // TODO: Hash verification
    // const expectedHash = createHmac('sha256', merchantKey + merchantSalt)
    //   .update(merchantOid + merchantSalt + status + totalAmount)
    //   .digest('base64');
    // if (hash !== expectedHash) return new Response('HASH_MISMATCH', { status: 403 });

    // TODO: Implement based on status
    if (status === 'success') {
      // 1. Parse merchantOid to extract userId and planSlug
      // 2. Create/update subscription in Supabase
      // 3. Record payment in payment_history
      // 4. Update profiles.subscription_tier to 'pro' (legacy compat)
      console.log('Payment success:', { merchantOid, totalAmount });
    } else {
      // Payment failed
      // 1. Record failed payment in payment_history
      // 2. Optionally notify user
      console.log('Payment failed:', { merchantOid, status });
    }

    // PayTR expects "OK" response
    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('ERROR', { status: 500 });
  }
}
