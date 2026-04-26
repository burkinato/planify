export const AUTH_SESSION_COOKIE_NAME = 'planify_auth_active';
export const ADMIN_AUTH_SESSION_COOKIE_NAME = 'planify_admin_auth_active';
export const AUTH_REMEMBERED_EMAIL_KEY = 'planify_auth_remembered_email';
export const AUTH_PERSISTENCE_KEY = 'planify_auth_persistence';
export const ADMIN_AUTH_PERSISTENCE_KEY = 'planify_admin_auth_persistence';
export const AUTH_BROWSER_SESSION_KEY = 'planify_auth_browser_session';
export const ADMIN_AUTH_BROWSER_SESSION_KEY = 'planify_admin_auth_browser_session';

export const AUTH_PERSISTENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const DEFAULT_AUTH_REDIRECT_PATH = '/dashboard';

export type AuthPersistence = 'session' | 'persistent';

export function isAuthPersistence(value: string | null | undefined): value is AuthPersistence {
  return value === 'session' || value === 'persistent';
}

export function getSafeRedirectPath(
  value: string | null | undefined,
  fallback = DEFAULT_AUTH_REDIRECT_PATH
) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return fallback;
  }

  try {
    const url = new URL(value, 'https://planify.local');
    const redirectPath = `${url.pathname}${url.search}${url.hash}`;

    if (isAuthPagePath(url.pathname)) {
      return fallback;
    }

    return redirectPath;
  } catch {
    return fallback;
  }
}

export function isAuthPagePath(pathname: string) {
  return (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname.startsWith('/auth/')
  );
}

export function activateBrowserSession(persistence: AuthPersistence, isAdmin = false) {
  if (!isBrowserRuntime()) {
    return;
  }

  const cookieName = isAdmin ? ADMIN_AUTH_SESSION_COOKIE_NAME : AUTH_SESSION_COOKIE_NAME;
  const persistenceKey = isAdmin ? ADMIN_AUTH_PERSISTENCE_KEY : AUTH_PERSISTENCE_KEY;
  const browserSessionKey = isAdmin ? ADMIN_AUTH_BROWSER_SESSION_KEY : AUTH_BROWSER_SESSION_KEY;

  setClientCookie(cookieName, persistence, {
    maxAge: persistence === 'persistent' ? AUTH_PERSISTENT_MAX_AGE_SECONDS : undefined,
  });

  try {
    window.sessionStorage.setItem(browserSessionKey, 'active');

    if (persistence === 'persistent') {
      window.localStorage.setItem(persistenceKey, persistence);
    } else {
      window.localStorage.removeItem(persistenceKey);
    }
  } catch {
    // Storage can be unavailable in strict privacy modes; the cookie marker is enough.
  }
}

export function clearBrowserSession(isAdmin = false) {
  if (!isBrowserRuntime()) {
    return;
  }

  const cookieName = isAdmin ? ADMIN_AUTH_SESSION_COOKIE_NAME : AUTH_SESSION_COOKIE_NAME;
  const persistenceKey = isAdmin ? ADMIN_AUTH_PERSISTENCE_KEY : AUTH_PERSISTENCE_KEY;
  const browserSessionKey = isAdmin ? ADMIN_AUTH_BROWSER_SESSION_KEY : AUTH_BROWSER_SESSION_KEY;

  clearClientCookie(cookieName);

  try {
    window.sessionStorage.removeItem(browserSessionKey);
    window.localStorage.removeItem(persistenceKey);
  } catch {
    // Nothing else to clear.
  }
}

export function reconcileBrowserSession(options: {
  hasSession: boolean;
  allowTemporarySession?: boolean;
  fallbackPersistence?: AuthPersistence;
  isAdmin?: boolean;
}) {
  if (!options.hasSession) {
    clearBrowserSession(options.isAdmin);
    return false;
  }

  if (ensureBrowserSessionCookie(options.isAdmin)) {
    return true;
  }

  if (options.allowTemporarySession) {
    activateBrowserSession(options.fallbackPersistence ?? 'session', options.isAdmin);
    return true;
  }

  clearBrowserSession(options.isAdmin);
  return false;
}

export function ensureBrowserSessionCookie(isAdmin = false) {
  const persistence = getStoredAuthPersistence(isAdmin);

  if (!persistence) {
    return false;
  }

  const cookieName = isAdmin ? ADMIN_AUTH_SESSION_COOKIE_NAME : AUTH_SESSION_COOKIE_NAME;

  setClientCookie(cookieName, persistence, {
    maxAge: persistence === 'persistent' ? AUTH_PERSISTENT_MAX_AGE_SECONDS : undefined,
  });

  return true;
}

export function hasBrowserSessionMarker(isAdmin = false) {
  return getStoredAuthPersistence(isAdmin) !== null;
}

export function getStoredAuthPersistence(isAdmin = false): AuthPersistence | null {
  if (!isBrowserRuntime()) {
    return null;
  }

  const cookieName = isAdmin ? ADMIN_AUTH_SESSION_COOKIE_NAME : AUTH_SESSION_COOKIE_NAME;
  const persistenceKey = isAdmin ? ADMIN_AUTH_PERSISTENCE_KEY : AUTH_PERSISTENCE_KEY;
  const browserSessionKey = isAdmin ? ADMIN_AUTH_BROWSER_SESSION_KEY : AUTH_BROWSER_SESSION_KEY;

  const cookieValue = getClientCookie(cookieName);
  if (isAuthPersistence(cookieValue)) {
    return cookieValue;
  }

  try {
    const localPersistence = window.localStorage.getItem(persistenceKey);
    if (isAuthPersistence(localPersistence)) {
      return localPersistence;
    }

    if (window.sessionStorage.getItem(browserSessionKey) === 'active') {
      return 'session';
    }
  } catch {
    return null;
  }

  return null;
}

export function setRememberedEmail(email: string, shouldRemember: boolean) {
  if (!isBrowserRuntime()) {
    return;
  }

  try {
    if (shouldRemember) {
      window.localStorage.setItem(AUTH_REMEMBERED_EMAIL_KEY, email.trim());
    } else {
      window.localStorage.removeItem(AUTH_REMEMBERED_EMAIL_KEY);
    }
  } catch {
    // Optional convenience only.
  }
}

export function getRememberedEmail() {
  if (!isBrowserRuntime()) {
    return '';
  }

  try {
    return window.localStorage.getItem(AUTH_REMEMBERED_EMAIL_KEY) ?? '';
  } catch {
    return '';
  }
}

function isBrowserRuntime() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function getClientCookie(name: string) {
  if (!isBrowserRuntime()) {
    return null;
  }

  const cookie = document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${encodeURIComponent(name)}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(cookie.indexOf('=') + 1));
}

function setClientCookie(
  name: string,
  value: string,
  options: { maxAge?: number } = {}
) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  const maxAge = typeof options.maxAge === 'number' ? `; Max-Age=${options.maxAge}` : '';

  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value
  )}; Path=/; SameSite=Lax${maxAge}${secure}`;
}

function clearClientCookie(name: string) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${encodeURIComponent(name)}=; Path=/; SameSite=Lax; Max-Age=0${secure}`;
}
