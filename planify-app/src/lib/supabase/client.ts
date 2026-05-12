import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

type SupabaseGlobal = typeof globalThis & {
  __KolayTahliyeBrowserClient?: SupabaseClient;
  __KolayTahliyeAdminBrowserClient?: SupabaseClient;
};

export function createClient(isAdmin = false) {
  const root = globalThis as SupabaseGlobal;

  if (!isAdmin && root.__KolayTahliyeBrowserClient) {
    return root.__KolayTahliyeBrowserClient;
  }
  
  if (isAdmin && root.__KolayTahliyeAdminBrowserClient) {
    return root.__KolayTahliyeAdminBrowserClient;
  }

  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    isAdmin ? {
      cookieOptions: { name: 'KolayTahliye-admin-auth' },
      auth: { 
        storageKey: 'KolayTahliye-admin-auth',
        persistSession: true,
        autoRefreshToken: true
      }
    } : {}
  );

  if (isAdmin) {
    root.__KolayTahliyeAdminBrowserClient = client;
  } else {
    root.__KolayTahliyeBrowserClient = client;
  }

  // Geliştirme ortamında React Strict Mode / Fast Refresh nedeniyle oluşan 
  // zararsız Supabase Lock uyarılarını konsolda gizle
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const originalWarn = console.warn;
    console.warn = (...args: Parameters<typeof console.warn>) => {
      if (typeof args[0] === 'string' && args[0].includes('lock:sb-') && args[0].includes('was not released within')) {
        return;
      }
      originalWarn.apply(console, args);
    };
  }

  return client;
}
