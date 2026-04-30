import { NextResponse } from 'next/server';
import { createClient as createSupabaseJS } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { createPayTRToken, generateMerchantOid } from '@/lib/paytr';

/**
 * PayTR Checkout Session Creator (Samet - P0 Fix)
 *
 * Bu endpoint, PayTR iFrame token oluşturur ve frontend'e döner.
 * Frontend bu token ile PayTR iFrame'ini açar.
 *
 * PayTR Docs: https://dev.paytr.com/iframe-api
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planSlug, userId, userEmail, userName } = body;

    // 1. Validate required fields
    if (!planSlug || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: planSlug, userId, userEmail' },
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

    // 3. Get plan details from Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createSupabaseJS(supabaseUrl, supabaseServiceKey);

    const { data: plan, error: planError } = await supabaseAdmin
      .from('plans')
      .select('id, name, price_try, price_usd')
      .eq('slug', planSlug)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      console.error('Plan not found:', planSlug, planError);
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // 4. Generate merchant_oid
    const merchantOid = generateMerchantOid(userId);

    // 5. Store pending payment in Supabase (for webhook to reference)
    const { error: insertError } = await supabaseAdmin
      .from('payment_history')
      .insert({
        user_id: userId,
        plan_id: plan.id,
        merchant_oid: merchantOid,
        provider_transaction_id: merchantOid, // Also store in standard column
        amount: plan.price_try,
        currency: 'TRY',
        status: 'pending',
      });

    if (insertError) {
      console.error('Failed to create payment record:', insertError);
      return NextResponse.json(
        { error: 'Failed to initialize payment' },
        { status: 500 }
      );
    }

    // 6. Create PayTR token
    const priceInKurus = Math.round(plan.price_try * 100); // Convert TRY to kurus
    const paytrResponse = await createPayTRToken({
      merchantId,
      merchantKey,
      merchantSalt,
      merchantOid,
      price: priceInKurus,
      userName: userName || 'Planify User',
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

    // 7. Return token to frontend (frontend will open PayTR iframe with this token)
    return NextResponse.json({
      status: 'success',
      token: paytrResponse.token,
      merchantOid,
      plan: {
        name: plan.name,
        price: plan.price_try,
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
