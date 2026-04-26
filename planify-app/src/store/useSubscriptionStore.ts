import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

export interface Plan {
  id: string;
  name: string;
  slug: string;
  price_usd: number;
  price_try: number | null;
  billing_interval: 'month' | 'year';
  features: string[];
  is_active: boolean;
  sort_order: number;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired' | 'inactive';
  payment_provider: string;
  provider_subscription_id: string | null;
  provider_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentRecord {
  id: string;
  subscription_id: string | null;
  user_id: string;
  amount_usd: number | null;
  amount_try: number | null;
  currency: string;
  status: 'success' | 'failed' | 'refunded' | 'pending';
  description: string | null;
  created_at: string;
}

interface SubscriptionState {
  plans: Plan[];
  activeSubscription: Subscription | null;
  paymentHistory: PaymentRecord[];
  exchangeRate: number;
  isLoading: boolean;
  error: string | null;

  fetchPlans: () => Promise<void>;
  fetchSubscription: (userId: string) => Promise<void>;
  fetchPaymentHistory: (userId: string) => Promise<void>;
  fetchExchangeRate: () => Promise<void>;
  checkProAccess: () => boolean;
  getPriceInTRY: (priceUsd: number) => number;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  plans: [],
  activeSubscription: null,
  paymentHistory: [],
  exchangeRate: 45.02,
  isLoading: false,
  error: null,

  fetchPlans: async () => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      const plans: Plan[] = (data || []).map((p: Record<string, unknown>) => ({
        ...p,
        features: Array.isArray(p.features) ? p.features as string[] : JSON.parse(String(p.features || '[]')),
      })) as Plan[];

      set({ plans });
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  },

  fetchSubscription: async (userId: string) => {
    const supabase = createClient();
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['active', 'trialing', 'canceled', 'past_due'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      set({ activeSubscription: data as Subscription | null, isLoading: false, error: null });
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      set({ activeSubscription: null, isLoading: false, error: 'Abonelik bilgisi alınamadı' });
    }
  },

  fetchPaymentHistory: async (userId: string) => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      set({ paymentHistory: (data || []) as PaymentRecord[] });
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
    }
  },

  fetchExchangeRate: async () => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('rate')
        .eq('from_currency', 'USD')
        .eq('to_currency', 'TRY')
        .order('fetched_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data?.rate) {
        set({ exchangeRate: Number(data.rate) });
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
    }
  },

  checkProAccess: () => {
    const { activeSubscription } = get();
    if (!activeSubscription) return false;

    const now = new Date();

    if (activeSubscription.status === 'active') return true;

    if (activeSubscription.status === 'trialing' && activeSubscription.trial_end) {
      return new Date(activeSubscription.trial_end) > now;
    }

    // Grace period: canceled but period not ended yet
    if (activeSubscription.status === 'canceled' && activeSubscription.current_period_end) {
      return new Date(activeSubscription.current_period_end) > now;
    }

    return false;
  },

  getPriceInTRY: (priceUsd: number) => {
    const { exchangeRate } = get();
    return Math.round(priceUsd * exchangeRate);
  },
}));
