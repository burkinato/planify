import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ChunkLoadRecovery } from "@/components/providers/ChunkLoadRecovery";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";
import { JsonLd } from "@/components/seo/JsonLd";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import "./globals.css";

// next/font: preloads with swap, self-hosted — eliminates Google Fonts render-blocking
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false, // Loaded lazily as it's only used in editor
});

export const metadata: Metadata = {
  title: {
    default: 'Planify — Acil Durum Tahliye Planı Editörü',
    template: '%s | Planify'
  },
  description: 'İş güvenliği uzmanları için profesyonel acil durum tahliye planı çizim aracı. Sürükle-bırak ile denetime hazır planlar oluşturun.',
  keywords: [
    'tahliye planı', 'acil durum', 'iş güvenliği', 'yangın', 'İSG', 'OHS', 
    'evacuation plan', 'tahliye krokisi', 'yangın planı çizim', 'ISO 7010', 'ISO 23601'
  ],
  metadataBase: new URL('https://planify.com.tr'),
  alternates: {
    canonical: '/',
    languages: {
      'tr-TR': '/tr',
      'en-US': '/en',
    },
  },
  openGraph: {
    title: 'Planify — Acil Durum Tahliye Planı Editörü',
    description: 'Sürükle-bırak ile denetime hazır ISO 7010 tahliye planları oluşturun. Profesyonel, hızlı ve standartlara uygun.',
    url: 'https://planify.com.tr',
    siteName: 'Planify',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Planify Editor',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Planify — Acil Durum Tahliye Planı Editörü',
    description: 'Profesyonel tahliye planı çizim aracı. Sürükle-bırak ile denetime hazır planlar oluşturun.',
    images: ['/og-image.png'],
    creator: '@planifytr',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </head>
      <body className="antialiased font-sans bg-white dark:bg-[#1e1e1e] text-slate-900 dark:text-[#cccccc]" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ChunkLoadRecovery />
          <AuthProvider>
            <JsonLd />
            {children}
          </AuthProvider>
          <Toaster theme="system" position="bottom-right" className="font-sans" />
        </ThemeProvider>
      </body>
    </html>
  );
}
