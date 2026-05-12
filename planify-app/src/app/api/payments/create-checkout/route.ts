import { NextResponse } from 'next/server';
import { createClient as createSupabaseJS } from '@supabase/supabase-js';
import { createPayTRToken, generateMerchantOid } from '@/lib/paytr';

/**
 * PayTR Checkout Session Creator
 * 
 * Abonelik + Kredi Hibrit Sistem:
 * - type: 'subscription' → KolayTahliye Pro abonelik ($5/ay, 1 proje hakkı)
 * - type: 'credit_package' → Ek kredi paketi satın alımı
 *
 * PayTR iFrame token oluşturur ve frontend'e döner.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { packageId, userId, userEmail, userName, type = 'credit_package' } = body;

    // 1. Validate required fields
    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, userEmail' },
        { status: 400 }
      );
    }

    if (type === 'credit_package' && !packageId) {
      return NextResponse.json(
        { error: 'Missing required field: packageId for credit_package purchase' },
        { status: 400 }
      );
    }

    // 2. Get PayTR credentials from env
    const merchantId = process.env.PAYTR_MERCHANT_ID;
    const merchantKey = process.env.PAYTR_MERCHANT_KEY;
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!merchantId || !merchantKey || !merchantSalt) {
      console.error('PayTR credentials not configured');
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 503 }
      );
    }

    // 3. Get Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createSupabaseJS(supabaseUrl, supabaseServiceKey);

    let priceTry: number;
    let itemName: string;
    let itemId: string;

    if (type === 'subscription') {
      // Abonelik ödemesi — Pro plan bilgisini çek
      const { data: plan, error: planError } = await supabaseAdmin
        .from('plans')
        .select('id, name, price_try')
        .eq('slug', 'pro-monthly')
        .eq('is_active', true)
        .single();

      if (planError || !plan) {
        console.error('Plan not found:', planError);
        return NextResponse.json(
          { error: 'Subscription plan not found' },
          { status: 400 }
        );
      }

      priceTry = plan.price_try;
      itemName = plan.name;
      itemId = plan.id;

    } else {
      // Kredi paketi ödemesi
      const { data: pkg, error: pkgError } = await supabaseAdmin
        .from('credit_packages')
        .select('id, name, price_try, credits')
        .eq('id', packageId)
        .eq('is_active', true)
        .single();

      if (pkgError || !pkg) {
        console.error('Package not found:', packageId, pkgError);
        return NextResponse.json(
          { error: 'Invalid package selected' },
          { status: 400 }
        );
      }

      priceTry = pkg.price_try;
      itemName = pkg.name;
      itemId = pkg.id;
    }

    // 4. Generate merchant_oid
    const merchantOid = generateMerchantOid(userId);

    // 5. Store pending payment in Supabase (for webhook to reference)
    const { error: insertError } = await supabaseAdmin
      .from('payment_history')
      .insert({
        user_id: userId,
        plan_id: itemId,
        merchant_oid: merchantOid,
        provider_transaction_id: merchantOid, 
        amount: priceTry,
        currency: 'TRY',
        status: 'pending',
        payment_type: type, // 'subscription' | 'credit_package'
      });

    if (insertError) {
      console.error('Failed to create payment record:', insertError);
      return NextResponse.json(
        { error: 'Failed to initialize payment' },
        { status: 500 }
      );
    }

    // 6. Create PayTR token
    const priceInKurus = Math.round(priceTry * 100);
    const paytrResponse = await createPayTRToken({
      merchantId,
      merchantKey,
      merchantSalt,
      merchantOid,
      price: priceInKurus,
      userName: userName || 'KolayTahliye User',
      userEmail,
      merchantOkUrl: `${appUrl}/dashboard/upgrade?status=success`,
      merchantFailUrl: `${appUrl}/dashboard/upgrade?status=failed`,
      timeoutLimit: 30,
      testMode: process.env.NODE_ENV === 'production' ? 0 : 1,
    });

    if (paytrResponse.status !== 'success' || !paytrResponse.token) {
      console.error('PayTR token creation failed:', paytrResponse);

      // Update payment history to failed
      await supabaseAdmin
        .from('payment_history')
        .update({ status: 'failed', error_message: paytrResponse.reason })
        .eq('merchant_oid', merchantOid);

      return NextResponse.json(
        { error: 'Payment initialization failed', reason: paytrResponse.reason },
        { status: 502 }
      );
    }

    // 7. Return token to frontend
    return NextResponse.json({
      status: 'success',
      token: paytrResponse.token,
      merchantOid,
      type,
      item: {
        name: itemName,
        price: priceTry,
      },
    });

  } catch (error) {
    console.error('Checkout creation error:', error);
    return NextResponse.json(
      { error: 'Checkout session could not be created' },
      { status: 500 }
    );
  }
}
