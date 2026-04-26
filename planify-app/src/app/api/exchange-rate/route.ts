import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const EXCHANGE_API_URL = 'https://open.er-api.com/v6/latest/USD';

export async function GET() {
  try {
    // Fetch live exchange rate
    const response = await fetch(EXCHANGE_API_URL, { next: { revalidate: 3600 } });
    const data = await response.json();

    if (data.result !== 'success' || !data.rates?.TRY) {
      return NextResponse.json(
        { error: 'Exchange rate service unavailable', fallback: 38.50 },
        { status: 502 }
      );
    }

    const rate = data.rates.TRY;

    // Update Supabase cache
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase
        .from('exchange_rates')
        .insert({
          from_currency: 'USD',
          to_currency: 'TRY',
          rate: rate,
          source: 'open.er-api.com',
          fetched_at: new Date().toISOString(),
        });

      // Update plan prices
      const { data: plans } = await supabase
        .from('plans')
        .select('id, price_usd')
        .eq('is_active', true);

      if (plans) {
        for (const plan of plans) {
          await supabase
            .from('plans')
            .update({ price_try: Math.round(plan.price_usd * rate) })
            .eq('id', plan.id);
        }
      }
    }

    return NextResponse.json({
      rate,
      currency: 'TRY',
      source: 'open.er-api.com',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exchange rate', fallback: 38.50 },
      { status: 500 }
    );
  }
}
