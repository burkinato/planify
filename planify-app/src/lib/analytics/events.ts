export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
};

export const TRACKING_EVENTS = {
  EXPORT_START: 'export_start',
  EXPORT_COMPLETE: 'export_complete',
  REGISTER_CLICK: 'register_click',
  UPGRADE_CLICK: 'upgrade_click',
  ONBOARDING_START: 'onboarding_start',
  ONBOARDING_COMPLETE: 'onboarding_complete',
};
