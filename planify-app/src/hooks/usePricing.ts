import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface PricingConfig {
  pro_price_usd: number;
  usd_to_try_rate: number;
  display_currency: string;
  show_both_currencies: boolean;
}

const DEFAULT_CONFIG: PricingConfig = {
  pro_price_usd: 10,
  usd_to_try_rate: 32.5,
  display_currency: 'TRY',
  show_both_currencies: true
};

export function usePricing() {
  const [config, setConfig] = useState<PricingConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPricing() {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('value')
          .eq('key', 'pricing_config')
          .single();

        if (data && !error) {
          setConfig(data.value as PricingConfig);
        }
      } catch (err) {
        console.error('Error fetching pricing:', err);
      } finally {
        setLoading(false);
      }
    }

    void fetchPricing();
  }, []);

  const priceTry = config.pro_price_usd * config.usd_to_try_rate;

  return {
    config,
    priceTry,
    loading
  };
}
