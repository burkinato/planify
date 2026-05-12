import React from 'react';

export function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "KolayTahliye",
    "operatingSystem": "Web",
    "applicationCategory": "DesignApplication",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "120"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "TRY"
    },
    "description": "Profesyonel acil durum tahliye planı çizim aracı. İSG uzmanları için ISO 7010 ve ISO 23601 uyumlu planlar.",
    "author": {
      "@type": "Organization",
      "name": "KolayTahliye"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
