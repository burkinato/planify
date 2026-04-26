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
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  initialize: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<Profile | null>;
  signOut: () => Promise<void>;
}

interface AuthStoreRuntime {
  unsubscribe: (() => void) | null;
  profileRequests: Map<string, Promise<Profile | null>>;
}

type AuthStoreGlobal = typeof globalThis & {
  __planifyAuthStoreRuntime?: AuthStoreRuntime;
};

let initializePromise: Promise<void> | null = null;
let hasBoundAuthSubscription = false;

function getAuthStoreRuntime() {
  const root = globalThis as AuthStoreGlobal;

  if (!root.__planifyAuthStoreRuntime) {
    root.__planifyAuthStoreRuntime = {
      unsubscribe: null,
      profileRequests: new Map<string, Promise<Profile | null>>(),
    };
  }

  return root.__planifyAuthStoreRuntime;
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

        if (user) {
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
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),
    setProfile: (profile) => set({ profile }),

    fetchProfile: async (userId: string) => {
      const currentProfile = get().profile;
      if (currentProfile?.id === userId) {
        return currentProfile;
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
        } catch (error: any) {
          // PGRST116 means no rows found. If profile is missing, try to create a fallback one.
          if (error?.code === 'PGRST116') {
            console.warn('Profile not found for user, attempting to create fallback profile...');
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

          if (user) {
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
