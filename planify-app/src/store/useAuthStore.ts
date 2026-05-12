import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import {
  activateBrowserSession,
  clearBrowserSession,
  reconcileBrowserSession,
} from '@/lib/auth/session';

export interface Profile {
  id: string;
  full_name: string | null;
  company: string | null;
  phone: string | null;
  gender: string | null;
  subscription_tier: 'free' | 'pro';
  subscription_status: string;
  marketing_consent: boolean;
  last_session_id: string | null;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  localSessionId: string | null;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  initialize: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<Profile | null>;
  signOut: () => Promise<void>;
  updateSessionId: (userId: string, sessionId: string) => Promise<void>;
  logLogin: () => Promise<void>;
}

interface AuthStoreRuntime {
  unsubscribe: (() => void) | null;
  profileRequests: Map<string, Promise<Profile | null>>;
}

type AuthStoreGlobal = typeof globalThis & {
  __KolayTahliyeAuthStoreRuntime?: AuthStoreRuntime;
};

let initializePromise: Promise<void> | null = null;
let hasBoundAuthSubscription = false;

function getAuthStoreRuntime() {
  const root = globalThis as AuthStoreGlobal;

  if (!root.__KolayTahliyeAuthStoreRuntime) {
    root.__KolayTahliyeAuthStoreRuntime = {
      unsubscribe: null,
      profileRequests: new Map<string, Promise<Profile | null>>(),
    };
  }

  return root.__KolayTahliyeAuthStoreRuntime;
}

function isPasswordRecoveryRoute() {
  return typeof window !== 'undefined' && window.location.pathname === '/reset-password';
}

function normalizeSession(session: Session | null) {
  const shouldKeepSession = reconcileBrowserSession({
    hasSession: Boolean(session),
    allowTemporarySession: Boolean(session) && isPasswordRecoveryRoute(),
    fallbackPersistence: 'session',
  });

  return shouldKeepSession ? session : null;
}

function syncSessionState(
  set: (partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>), replace?: false) => void,
  session: Session | null,
  error: string | null = null
) {
  const user = session?.user ?? null;

  set((state) => ({
    session,
    user,
    profile: user && state.profile?.id === user.id ? state.profile : null,
    isLoading: false,
    isInitialized: true,
    error,
  }));

  return user;
}

function scheduleProfileHydration(userId: string, fetchProfile: (userId: string) => Promise<Profile | null>) {
  queueMicrotask(() => {
    void fetchProfile(userId);
  });
}

export const useAuthStore = create<AuthState>((set, get) => {
  const ensureAuthSubscription = () => {
    const runtime = getAuthStoreRuntime();

    if (hasBoundAuthSubscription && runtime.unsubscribe) {
      return;
    }

    if (runtime.unsubscribe) {
      runtime.unsubscribe();
      runtime.unsubscribe = null;
    }

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      try {
        if (event === 'INITIAL_SESSION') {
          return;
        }

        if (event === 'SIGNED_OUT') {
          clearBrowserSession();
          syncSessionState(set, null);
          return;
        }

        if (event === 'PASSWORD_RECOVERY' && nextSession) {
          activateBrowserSession('session');
        }

        const normalizedSession = normalizeSession(nextSession);
        const user = syncSessionState(set, normalizedSession);

        if (user && nextSession) {
          const sid = nextSession.access_token.slice(-10);
          void get().updateSessionId(user.id, sid);
          
          // Giriş yapıldığında logla
          if (event === 'SIGNED_IN') {
            void get().logLogin();
          }

          scheduleProfileHydration(user.id, get().fetchProfile);
        }
      } catch (error) {
        console.error('Auth state sync error:', error);
      }
    });

    runtime.unsubscribe = () => subscription.unsubscribe();
    hasBoundAuthSubscription = true;
  };

  return {
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    isInitialized: false,
    error: null,
    localSessionId: null,
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),
    setProfile: (profile) => set({ profile }),

    updateSessionId: async (userId: string, sessionId: string) => {
      const supabase = createClient();
      try {
        await supabase
          .from('profiles')
          .update({ last_session_id: sessionId })
          .eq('id', userId);
        
        set({ localSessionId: sessionId });
      } catch (err) {
        console.error('Session update error:', err);
      }
    },

    logLogin: async () => {
      try {
        await fetch('/api/auth/log-login', { method: 'POST' });
      } catch (err) {
        console.error('Login log call failed:', err);
      }
    },

    fetchProfile: async (userId: string) => {
      const currentProfile = get().profile;
      
      // Session hijacking check: If we have a profile, check if session is still valid
      if (currentProfile?.id === userId && get().localSessionId) {
        const supabase = createClient();
        const { data } = await supabase
          .from('profiles')
          .select('last_session_id')
          .eq('id', userId)
          .single();
        
        if (data && data.last_session_id !== get().localSessionId) {
          console.warn('Başka bir cihazdan giriş yapıldı. Oturum sonlandırılıyor.');
          await get().signOut();
          return null;
        }
      }

      const runtime = getAuthStoreRuntime();
      const existingRequest = runtime.profileRequests.get(userId);
      if (existingRequest) {
        return existingRequest;
      }

      const request = (async () => {
        const supabase = createClient();

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (error) {
            throw error;
          }

          const profile = data as Profile;

          if (get().user?.id === userId) {
            set({ profile, error: null });
          }

          return profile;
        } catch (error: unknown) {
          if (isPostgrestError(error) && error.code === 'PGRST116') {
            console.warn('Profile not found, creating fallback...');
            try {
              const currentUser = get().user;
              const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert([{ 
                  id: userId, 
                  full_name: currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Kullanıcı' 
                }])
                .select()
                .single();

              if (!insertError && newProfile) {
                const profile = newProfile as Profile;
                if (get().user?.id === userId) {
                  set({ profile, error: null });
                }
                return profile;
              }
            } catch (insertCatchError) {
              console.error('Failed to create fallback profile:', insertCatchError);
            }
          }

          console.error('Error fetching profile:', error);

          if (get().user?.id === userId) {
            set({ profile: null });
          }

          return null;
        } finally {
          runtime.profileRequests.delete(userId);
        }
      })();

      runtime.profileRequests.set(userId, request);
      return request;
    },

    initialize: async () => {
      ensureAuthSubscription();

      if (get().isInitialized) {
        const userId = get().user?.id;
        if (userId && !get().profile) {
          await get().fetchProfile(userId);
        }
        return;
      }

      if (initializePromise) {
        return initializePromise;
      }

      initializePromise = (async () => {
        const supabase = createClient();

        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            throw error;
          }

          const normalizedSession = normalizeSession(session);
          const user = syncSessionState(set, normalizedSession);

          if (user && session) {
            const sid = session.access_token.slice(-10);
            set({ localSessionId: sid });
            
            // App ilk yüklendiğinde de logla (session hala aktifse)
            void get().logLogin();
            
            await get().fetchProfile(user.id);
          }
        } catch (error) {
          console.error('Auth init error:', error);
          set({
            user: null,
            profile: null,
            session: null,
            isLoading: false,
            isInitialized: true,
            error: error instanceof Error ? error.message : 'Auth init error',
          });
        } finally {
          initializePromise = null;
        }
      })();

      return initializePromise;
    },

    signOut: async () => {
      const supabase = createClient();

      clearBrowserSession();
      await supabase.auth.signOut();

      set({
        user: null,
        profile: null,
        session: null,
        isLoading: false,
        isInitialized: true,
        error: null,
        localSessionId: null
      });
    },
  };
});

export function getAuthenticatedUserId(
  fallbackMessage = 'Oturum açılmamış.'
) {
  const state = useAuthStore.getState();
  const userId = state.user?.id ?? state.session?.user.id;

  if (!userId) {
    throw new Error(fallbackMessage);
  }

  return userId;
}

function isPostgrestError(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error;
}
