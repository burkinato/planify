import { NextResponse } from 'next/server';
import { createClient as createSupabaseJS } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

const EXCHANGE_API_URL = 'https://open.er-api.com/v6/latest/USD';

export async function GET(request: Request) {
  try {
    // 1. Security Check
    const authHeader = request.headers.get('x-system-key');
    const isSystemKeyValid = authHeader && authHeader === process.env.PLANIFY_SYSTEM_KEY;
    
    let isAdmin = false;
    if (!isSystemKeyValid) {
      const supabase = await createClient(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        isAdmin = profile?.role === 'admin';
      }
    }

    // In development, allow access for testing, otherwise require system key or admin
    const canExecute = isSystemKeyValid || isAdmin || process.env.NODE_ENV === 'development';

    if (!canExecute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch live exchange rate
    const response = await fetch(EXCHANGE_API_URL, { next: { revalidate: 3600 } });
    const data = await response.json();

    if (data.result !== 'success' || !data.rates?.TRY) {
      return NextResponse.json(
        { error: 'Exchange rate service unavailable', fallback: 38.50 },
        { status: 502 }
      );
    }

    const rate = data.rates.TRY;

    // 3. Update Supabase cache (Only if authorized and not just a dev test)
    if (isSystemKeyValid || isAdmin) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        const supabaseAdmin = createSupabaseJS(supabaseUrl, supabaseServiceKey);

        // Update exchange rate history
        await supabaseAdmin
          .from('exchange_rates')
          .insert({
            from_currency: 'USD',
            to_currency: 'TRY',
            rate: rate,
            source: 'open.er-api.com',
            fetched_at: new Date().toISOString(),
          });

        // Update plan prices
        const { data: plans } = await supabaseAdmin
          .from('plans')
          .select('id, price_usd')
          .eq('is_active', true);

        if (plans) {
          for (const plan of plans) {
            await supabaseAdmin
              .from('plans')
              .update({ price_try: Math.round(plan.price_usd * rate) })
              .eq('id', plan.id);
          }
        }
      }
    }

    return NextResponse.json({
      rate,
      currency: 'TRY',
      source: 'open.er-api.com',
      timestamp: new Date().toISOString(),
      updated: isSystemKeyValid || isAdmin
    });
  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exchange rate', fallback: 38.50 },
      { status: 500 }
    );
  }
}
