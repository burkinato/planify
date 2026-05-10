import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

/** 1 kredi = 1 proje oluşturma hakkı */
export const PROJECT_CREDIT_COST = 1;

/** Abonelik fiyatı (USD) */
export const SUBSCRIPTION_PRICE_USD = 5;

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_try: number;
  price_usd: number;
  is_active: boolean;
}

export interface CreditTransaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

interface CreditState {
  balance: number;
  hasActiveSubscription: boolean;
  isInitialized: boolean;
  packages: CreditPackage[];
  transactions: CreditTransaction[];
  isLoading: boolean;
  error: string | null;
  
  fetchBalance: () => Promise<void>;
  fetchPackages: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  deductCredits: (amount: number, type: string, description: string) => Promise<boolean>;
  canCreateProject: () => boolean;
}

export const useCreditStore = create<CreditState>((set, get) => ({
  balance: 0,
  hasActiveSubscription: false,
  isInitialized: false,
  packages: [],
  transactions: [],
  isLoading: false,
  error: null,

  fetchBalance: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        set({ isInitialized: true });
        return;
      }

      // maybeSingle() kullanıyoruz ki satır yoksa hata fırlatmasın
      const { data, error } = await supabase
        .from('user_credits')
        .select('balance, has_active_subscription')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        set({ 
          balance: data.balance,
          hasActiveSubscription: data.has_active_subscription ?? false
        });
      } else {
        // Eğer kullanıcı için kredi satırı yoksa oluştur (onboarding)
        const { data: newData, error: insertError } = await supabase
          .from('user_credits')
          .insert({ user_id: session.user.id, balance: 0, has_active_subscription: false })
          .select()
          .single();
        
        if (!insertError && newData) {
          set({ balance: 0, hasActiveSubscription: false });
        }
      }
    } catch (err) {
      console.error('Kredi bakiyesi alınamadı:', err);
    } finally {
      set({ isInitialized: true });
    }
  },

  fetchPackages: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('credit_packages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      if (data) {
        set({ packages: data });
      }
    } catch (err) {
      console.error('Kredi paketleri alınamadı:', err);
      set({ error: 'Paketler yüklenirken bir hata oluştu.' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTransactions: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      if (data) {
        set({ transactions: data });
      }
    } catch (err) {
      console.error('İşlem geçmişi alınamadı:', err);
    }
  },

  deductCredits: async (amount: number, type: string, description: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const currentBalance = get().balance;
      if (currentBalance < amount) {
        return false;
      }

      // 1. Transaction kaydı ekle
      const { error: txError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: session.user.id,
          amount: -amount,
          transaction_type: type,
          description
        });

      if (txError) throw txError;

      // 2. Bakiyeyi düş
      const newBalance = currentBalance - amount;
      const { error: updError } = await supabase
        .from('user_credits')
        .update({ 
          balance: newBalance,
          total_spent: get().transactions.reduce((acc, tx) => acc + (tx.amount < 0 ? Math.abs(tx.amount) : 0), 0) + amount 
        })
        .eq('user_id', session.user.id);

      if (updError) throw updError;

      // State'i güncelle
      set({ balance: newBalance });
      get().fetchTransactions();
      
      return true;
    } catch (err) {
      console.error('Kredi düşme hatası:', err);
      return false;
    }
  },

  /** Proje oluşturma hakkı var mı? (abonelik veya kredi) */
  canCreateProject: () => {
    const { balance } = get();
    return balance >= PROJECT_CREDIT_COST;
  }
}));
