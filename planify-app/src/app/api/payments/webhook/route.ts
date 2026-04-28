import { createHmac } from 'node:crypto';

/**
 * PayTR Webhook/Notification Handler
 * 
 * PayTR ödeme sonucunu bu endpoint'e POST olarak bildirir.
 * Başarılı ödeme geldiğinde:
 * 1. Hash doğrulaması yap (merchant_key + merchant_salt)
 * 2. Supabase'de subscription'ı aktif et (İş mantığı eklenmeli)
 * 3. Payment history kaydı oluştur (İş mantığı eklenmeli)
 * 4. PayTR'ye "OK" yanıtı dön
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

    // Hash Verification
    // PayTR Algorithm: base64_encode(hmac_sha256(merchant_oid + merchant_salt + status + total_amount, merchant_key))
    const hashStr = merchantOid + merchantSalt + status + totalAmount;
    const expectedHash = createHmac('sha256', merchantKey)
      .update(hashStr)
      .digest('base64');

    if (hash !== expectedHash) {
      console.warn('PayTR Webhook: Hash mismatch!', { merchantOid, receivedHash: hash, expectedHash });
      return new Response('PAYTR_IFRAME_FAILED. REASON: bad hash', { status: 403 });
    }

    if (status === 'success') {
      // TODO: Implement subscription activation in Supabase
      console.log('Payment success:', { merchantOid, totalAmount });
    } else {
      // Payment failed
      console.log('Payment failed:', { merchantOid, status });
    }

    // PayTR expects "OK" response
    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response('ERROR', { status: 500 });
  }
}
