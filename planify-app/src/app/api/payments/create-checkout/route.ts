import { NextResponse } from 'next/server';

/**
 * PayTR Checkout Session Creator
 * 
 * Bu endpoint, PayTR iFrame token oluşturma API'sine istek atar.
 * Gerçek entegrasyon için PayTR Merchant Panel'den:
 * - MERCHANT_ID
 * - MERCHANT_KEY
 * - MERCHANT_SALT
 * credential'larının .env'ye eklenmesi gerekir.
 * 
 * PayTR Docs: https://dev.paytr.com/iframe-api
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planSlug, userId, userEmail } = body;

    if (!planSlug || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: planSlug, userId, userEmail' },
        { status: 400 }
      );
    }

    // TODO: PayTR entegrasyonu aktif edildiğinde:
    // 1. Plan bilgisini Supabase'den çek
    // 2. PayTR token hash oluştur (merchant_id + merchant_key + merchant_salt)
    // 3. PayTR iFrame API'ye POST at
    // 4. Token'ı frontend'e dön, iFrame içinde göster

    const merchantId = process.env.PAYTR_MERCHANT_ID;
    const merchantKey = process.env.PAYTR_MERCHANT_KEY;
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

    if (!merchantId || !merchantKey || !merchantSalt) {
      return NextResponse.json({
        status: 'not_configured',
        message: 'Ödeme sistemi henüz yapılandırılmamış. PayTR credential bilgileri gerekli.',
        debug: {
          planSlug,
          userId,
          requiredEnvVars: ['PAYTR_MERCHANT_ID', 'PAYTR_MERCHANT_KEY', 'PAYTR_MERCHANT_SALT'],
        },
      }, { status: 503 });
    }

    // PayTR implementation will go here
    return NextResponse.json({
      status: 'pending_implementation',
      message: 'PayTR checkout session will be created here',
    });

  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json(
      { error: 'Checkout oturumu oluşturulamadı' },
      { status: 500 }
    );
  }
}
