import dynamic from 'next/dynamic';
import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';

// Above-fold: loaded eagerly (LandingNav + LandingHero)
// Below-fold: lazily loaded to speed up initial render / LCP
const LandingFeatures = dynamic(() => import('@/components/landing/LandingFeatures'), {
  loading: () => <div className="py-32 bg-[#FAFAFC]" />,
});

const LandingShowcase = dynamic(() => import('@/components/landing/LandingShowcase'), {
  loading: () => <div className="py-24 bg-white" />,
});

const LandingHowItWorks = dynamic(() => import('@/components/landing/LandingHowItWorks'), {
  loading: () => <div className="py-20 bg-slate-50" />,
});

const LandingTestimonials = dynamic(() => import('@/components/landing/LandingTestimonials'), {
  loading: () => <div className="py-24 bg-gradient-to-b from-slate-50 to-white" />,
});

const LandingPricing = dynamic(() => import('@/components/landing/LandingPricing'), {
  loading: () => <div className="py-24 bg-white" />,
});

const LandingBlog = dynamic(() => import('@/components/landing/LandingBlog'), {
  loading: () => <div className="py-20 bg-slate-50" />,
});

const LandingFooter = dynamic(() => import('@/components/landing/LandingFooter'), {
  loading: () => <div className="py-16 bg-slate-900" />,
});

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      <LandingNav />
      <LandingHero />
      <LandingFeatures />
      <LandingShowcase />
      <LandingHowItWorks />
      <LandingTestimonials />
      <LandingPricing />
      <LandingBlog />
      <LandingFooter />
    </div>
  );
}
