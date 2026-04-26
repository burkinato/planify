import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  AUTH_SESSION_COOKIE_NAME,
  ADMIN_AUTH_SESSION_COOKIE_NAME,
  getSafeRedirectPath,
  isAuthPersistence,
} from '@/lib/auth/session'

const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/konva-debug',
  '/pxadmin/login',
])

const AUTH_ENTRY_PATHS = new Set(['/login', '/register', '/forgot-password'])

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminPath = pathname.startsWith('/pxadmin')
  const isPublicPath =
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/debug/')

  let supabaseResponse = NextResponse.next({
    request,
  })

  // Create client based on path
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: isAdminPath ? { name: 'planify-admin-auth' } : {},
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const cookieName = isAdminPath ? ADMIN_AUTH_SESSION_COOKIE_NAME : AUTH_SESSION_COOKIE_NAME
  const hasBrowserSession = isAuthPersistence(
    request.cookies.get(cookieName)?.value
  )

  // 1. Redirect /admin (old) to /pxadmin (new/original)
  if (pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL(pathname.replace('/admin', '/pxadmin'), request.url))
  }

  // 2. Admin Path Logic
  if (isAdminPath) {
    if (pathname === '/pxadmin/login') {
      if (user) {
        // Double check role even for existing session
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role === 'admin') {
          return withNoStoreHeaders(NextResponse.redirect(new URL('/pxadmin', request.url)))
        }
      }
      return supabaseResponse
    }

    if (!user) {
      return NextResponse.redirect(new URL('/pxadmin/login', request.url))
    }

    // If we have a user but no marker cookie, set it and continue
    if (!hasBrowserSession) {
      supabaseResponse.cookies.set(cookieName, 'session', { path: '/', sameSite: 'lax' })
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
      // If they are logged into admin but aren't admin, sign them out and redirect
      return clearAuthCookies(
        withNoStoreHeaders(NextResponse.redirect(new URL('/pxadmin/login', request.url))),
        request,
        true
      )
    }
    
    return supabaseResponse
  }

  // 3. User Path Logic
  if (!isPublicPath) {
    if (!user) {
      return clearAuthCookies(
        withNoStoreHeaders(NextResponse.redirect(getLoginUrl(request))),
        request
      )
    }

    // If we have a user but no marker cookie, set it and continue
    if (!hasBrowserSession) {
      supabaseResponse.cookies.set(cookieName, 'session', { path: '/', sameSite: 'lax' })
    }

    if (AUTH_ENTRY_PATHS.has(pathname)) {
      return withNoStoreHeaders(
        NextResponse.redirect(new URL(getSafeRedirectPath(request.nextUrl.searchParams.get('next')), request.url))
      )
    }
  }

  if (!isPublicPath || AUTH_ENTRY_PATHS.has(pathname)) {
    withNoStoreHeaders(supabaseResponse)
  }

  return supabaseResponse
}

function getLoginUrl(request: NextRequest) {
  const url = request.nextUrl.clone()
  const next = `${request.nextUrl.pathname}${request.nextUrl.search}`

  url.pathname = '/login'
  url.search = ''
  url.searchParams.set('next', next)

  return url
}

function withNoStoreHeaders(response: NextResponse) {
  response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate, max-age=0')
  response.headers.set('Expires', '0')
  response.headers.set('Pragma', 'no-cache')
  return response
}

function clearAuthCookies(response: NextResponse, request: NextRequest, isAdmin = false) {
  const activeCookie = isAdmin ? ADMIN_AUTH_SESSION_COOKIE_NAME : AUTH_SESSION_COOKIE_NAME
  const authCookiePrefix = isAdmin ? 'sb-planify-admin' : getSupabaseAuthCookiePrefix()

  for (const { name } of request.cookies.getAll()) {
    if (name === activeCookie || (authCookiePrefix && name.includes(authCookiePrefix)) || (name.startsWith('sb-') && name.includes('auth-token'))) {
      response.cookies.set(name, '', { path: '/', maxAge: 0 })
    }
  }

  response.cookies.set(activeCookie, '', { path: '/', maxAge: 0 })
  return response
}

function isSupabaseAuthCookieName(name: string) {
  const prefix = getSupabaseAuthCookiePrefix()

  if (prefix) {
    return (
      name === prefix ||
      name.startsWith(`${prefix}.`) ||
      name === `${prefix}-code-verifier` ||
      name.startsWith(`${prefix}-code-verifier.`) ||
      name === `${prefix}-user` ||
      name.startsWith(`${prefix}-user.`)
    )
  }

  return name.startsWith('sb-') && (
    name.includes('-auth-token') ||
    name.includes('-code-verifier') ||
    name.includes('-auth-token-user')
  )
}

function getSupabaseAuthCookiePrefix() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!supabaseUrl) {
    return null
  }

  try {
    const host = new URL(supabaseUrl).hostname
    const projectRef = host.split('.')[0]
    return `sb-${projectRef}-auth-token`
  } catch {
    return null
  }
}
