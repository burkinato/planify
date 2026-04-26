import { useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSubscriptionStore } from '@/store/useSubscriptionStore';

export interface ProAccessInfo {
  isPro: boolean;
  isTrialing: boolean;
  isCanceled: boolean;
  daysRemaining: number | null;
  subscriptionStatus: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
}

export function useProAccess(): ProAccessInfo {
  const { profile, user } = useAuthStore();
  const {
    activeSubscription,
    fetchSubscription,
    fetchPlans,
    fetchExchangeRate,
    checkProAccess,
  } = useSubscriptionStore();

  useEffect(() => {
    if (user?.id) {
      fetchSubscription(user.id);
      fetchPlans();
      fetchExchangeRate();
    }
  }, [user?.id, fetchSubscription, fetchPlans, fetchExchangeRate]);

  return useMemo(() => {
    // Check subscription store first (new system)
    const hasProViaSubscription = checkProAccess();

    // Fallback: check legacy profile field
    const hasProViaProfile = profile?.subscription_tier === 'pro';

    const isPro = hasProViaSubscription || hasProViaProfile;
    const isTrialing = activeSubscription?.status === 'trialing';
    const isCanceled = activeSubscription?.status === 'canceled';
    const cancelAtPeriodEnd = activeSubscription?.cancel_at_period_end ?? false;
    const currentPeriodEnd = activeSubscription?.current_period_end ?? null;

    let daysRemaining: number | null = null;
    if (currentPeriodEnd) {
      const end = new Date(currentPeriodEnd);
      const now = new Date();
      const diff = end.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    } else if (isTrialing && activeSubscription?.trial_end) {
      const end = new Date(activeSubscription.trial_end);
      const now = new Date();
      const diff = end.getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    return {
      isPro,
      isTrialing,
      isCanceled,
      daysRemaining,
      subscriptionStatus: activeSubscription?.status || (hasProViaProfile ? 'active' : 'inactive'),
      cancelAtPeriodEnd,
      currentPeriodEnd,
    };
  }, [activeSubscription, profile?.subscription_tier, checkProAccess]);
}
