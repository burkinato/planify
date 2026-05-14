import React from 'react';

export function JsonLd() {
  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "KolayTahliye",
    "operatingSystem": "Web",
    "applicationCategory": "DesignApplication",
    "url": "https://kolaytahliye.com",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "120",
    },
    "offers": [
      { "@type": "Offer", "name": "Ücretsiz", "price": "0", "priceCurrency": "TRY" },
      { "@type": "Offer", "name": "Pro", "price": "249", "priceCurrency": "TRY" },
      { "@type": "Offer", "name": "Takım", "price": "549", "priceCurrency": "TRY" },
    ],
    "description": "Profesyonel acil durum tahliye planı çizim aracı. İSG uzmanları için ISO 7010 ve ISO 23601 uyumlu planlar.",
    "author": { "@type": "Organization", "name": "KolayTahliye" },
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "KolayTahliye",
    "url": "https://kolaytahliye.com",
    "logo": "https://kolaytahliye.com/favicon.svg",
    "sameAs": [
      "https://www.linkedin.com/company/kolaytahliye",
      "https://twitter.com/kolaytahliye",
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "destek@kolaytahliye.com.tr",
      "availableLanguage": ["Turkish", "English"],
      "areaServed": "TR",
    },
  };

  // LocalBusiness — Türk Vergi Numarası ve adres
  // (Adres ve VKN production'da gerçek değerlere değişecek; örnek değerler)
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "KolayTahliye",
    "image": "https://kolaytahliye.com/og-image.png",
    "url": "https://kolaytahliye.com",
    "telephone": "+90-XXX-XXX-XXXX",
    "priceRange": "₺",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "İstanbul",
      "addressRegion": "İstanbul",
      "addressCountry": "TR",
    },
    "areaServed": "TR",
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Fiyatlara KDV dahil mi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet. Tüm fiyatlar KDV (%20) dahil olarak gösterilir. Kurumsal müşterilerimize istek üzerine KDV ayrıştırılmış e-Arşiv faturası gönderilir.",
        },
      },
      {
        "@type": "Question",
        "name": "Taksit imkanı var mı?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet, tüm kredi kartlarında 9 taksite kadar bölme imkanı PayTR güvenli ödeme sayfasında sunulur.",
        },
      },
      {
        "@type": "Question",
        "name": "Aboneliği istediğim zaman iptal edebilir miyim?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet. Hesap ayarlarından tek tıkla iptal edilebilir; ödediğiniz dönem sonuna kadar Pro özellikler aktif kalır.",
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
    </>
  );
}
