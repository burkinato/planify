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
  role: string;
}

interface AdminAuthState {
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

let initializePromise: Promise<void> | null = null;
let hasBoundAuthSubscription = false;

function syncSessionState(
  set: (partial: Partial<AdminAuthState> | ((state: AdminAuthState) => Partial<AdminAuthState>), replace?: false) => void,
  session: Session | null,
  error: string | null = null,
  keepLoading: boolean = false
) {
  const user = session?.user ?? null;

  set((state) => ({
    session,
    user,
    profile: user && state.profile?.id === user.id ? state.profile : null,
    isLoading: keepLoading,
    isInitialized: !keepLoading || state.isInitialized,
    error,
  }));

  return user;
}

export const useAdminAuthStore = create<AdminAuthState>((set, get) => {
  const ensureAuthSubscription = () => {
    if (hasBoundAuthSubscription) return;

    const supabase = createClient(true);
    supabase.auth.onAuthStateChange((event, nextSession) => {
      try {
        if (event === 'INITIAL_SESSION') return;

        if (event === 'SIGNED_OUT') {
          clearBrowserSession(true);
          syncSessionState(set, null);
          return;
        }

        const user = syncSessionState(set, nextSession, null, !!nextSession);
        if (user) {
          void get().fetchProfile(user.id).then(() => {
            set({ isLoading: false, isInitialized: true });
          });
        } else {
          set({ isLoading: false, isInitialized: true });
        }
      } catch (error) {
        console.error('Admin Auth state sync error:', error);
        set({ isLoading: false, isInitialized: true });
      }
    });

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
      const supabase = createClient(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;

        const profile = data as Profile;
        if (profile.role !== 'admin') {
            throw new Error('Unauthorized');
        }

        set({ profile, error: null });
        return profile;
      } catch (error: any) {
        console.error('Error fetching admin profile:', error);
        return null;
      }
    },

    initialize: async () => {
      ensureAuthSubscription();

      if (get().isInitialized) return;
      if (initializePromise) return initializePromise;

      initializePromise = (async () => {
        const supabase = createClient(true);
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;

          const user = syncSessionState(set, session, null, !!session);
          if (user) {
            await get().fetchProfile(user.id);
          }
          set({ isLoading: false, isInitialized: true });
        } catch (error) {
          console.error('Admin Auth init error:', error);
          set({
            user: null,
            profile: null,
            session: null,
            isLoading: false,
            isInitialized: true,
            error: 'Auth init error',
          });
        } finally {
          initializePromise = null;
        }
      })();

      return initializePromise;
    },

    signOut: async () => {
      const supabase = createClient(true);
      clearBrowserSession(true);
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
