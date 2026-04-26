import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

type SupabaseGlobal = typeof globalThis & {
  __planifyBrowserClient?: SupabaseClient;
};

export function createClient() {
  const root = globalThis as SupabaseGlobal;

  if (root.__planifyBrowserClient) {
    return root.__planifyBrowserClient;
  }

  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  root.__planifyBrowserClient = client;

  // Geliştirme ortamında React Strict Mode / Fast Refresh nedeniyle oluşan 
  // zararsız Supabase Lock uyarılarını konsolda gizle
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
      if (typeof args[0] === 'string' && args[0].includes('lock:sb-') && args[0].includes('was not released within')) {
        return;
      }
      originalWarn.apply(console, args);
    };
  }

  return client;
}
