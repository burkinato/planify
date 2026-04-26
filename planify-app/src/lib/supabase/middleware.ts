import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  AUTH_SESSION_COOKIE_NAME,
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
])

const AUTH_ENTRY_PATHS = new Set(['/login', '/register', '/forgot-password'])

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isPublicPath =
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/debug/')
  const hasBrowserSession = isAuthPersistence(
    request.cookies.get(AUTH_SESSION_COOKIE_NAME)?.value
  )

  if (!user && !isPublicPath) {
    return clearAuthCookies(
      withNoStoreHeaders(NextResponse.redirect(getLoginUrl(request))),
      request
    )
  }

  if (user && !hasBrowserSession && !isPublicPath) {
    return clearAuthCookies(
      withNoStoreHeaders(NextResponse.redirect(getLoginUrl(request))),
      request
    )
  }

  if (user && hasBrowserSession && AUTH_ENTRY_PATHS.has(pathname)) {
    return withNoStoreHeaders(
      NextResponse.redirect(new URL(getSafeRedirectPath(request.nextUrl.searchParams.get('next')), request.url))
    )
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

function clearAuthCookies(response: NextResponse, request: NextRequest) {
  for (const { name } of request.cookies.getAll()) {
    if (name === AUTH_SESSION_COOKIE_NAME || isSupabaseAuthCookieName(name)) {
      response.cookies.set(name, '', { path: '/', maxAge: 0 })
    }
  }

  response.cookies.set(AUTH_SESSION_COOKIE_NAME, '', { path: '/', maxAge: 0 })
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
