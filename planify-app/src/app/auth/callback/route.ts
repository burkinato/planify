import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSafeRedirectPath } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = getSafeRedirectPath(searchParams.get('next'));
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('[Auth Callback] OAuth error:', error, errorDescription);
    return redirectToLogin(origin, errorDescription ?? error);
  }

  if (!code) {
    return redirectToLogin(origin, 'no_code');
  }

  let response = withNoStoreHeaders(NextResponse.redirect(new URL(next, origin)));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = withNoStoreHeaders(NextResponse.redirect(new URL(next, origin)));
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    }
  );

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('[Auth Callback] Exchange error:', exchangeError.message);
    return redirectToLogin(origin, exchangeError.message);
  }

  return response;
}

function redirectToLogin(origin: string, error: string) {
  const url = new URL('/login', origin);
  url.searchParams.set('error', error);
  return withNoStoreHeaders(NextResponse.redirect(url));
}

function withNoStoreHeaders(response: NextResponse) {
  response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate, max-age=0');
  response.headers.set('Expires', '0');
  response.headers.set('Pragma', 'no-cache');
  return response;
}
