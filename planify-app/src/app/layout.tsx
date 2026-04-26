import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "sonner";
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
  title: 'Planify — Acil Durum Tahliye Planı Editörü',
  description: 'İş güvenliği uzmanları için profesyonel acil durum tahliye planı çizim aracı. Sürükle-bırak ile denetime hazır planlar oluşturun.',
  keywords: 'tahliye planı, acil durum, iş güvenliği, yangın, ISG, OHS, evacuation plan',
  metadataBase: new URL('https://planify.com.tr'),
  openGraph: {
    title: 'Planify — Acil Durum Tahliye Planı Editörü',
    description: 'Sürükle-bırak ile denetime hazır ISO 7010 tahliye planları oluşturun.',
    type: 'website',
    locale: 'tr_TR',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="antialiased font-sans bg-white text-slate-900" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  );
}
