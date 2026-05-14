import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://kolaytahliye.com';
  const now = new Date();

  // Landing anchor sections (single-page navigation targets)
  const landingAnchors = [
    '#features',
    '#showcase',
    '#how-it-works',
    '#testimonials',
    '#pricing',
    '#blog',
  ].map((anchor) => ({
    url: `${baseUrl}/${anchor}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Blog posts (statik MDX placeholder, ileride dinamik)
  const blogPosts = [
    'iso-23601-nedir',
    'acil-durum-tahliye-plani-nasil-hazirlanir',
    'isg-uzmanlari-icin-dijital-araclar',
  ].map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'yearly' as const,
    priority: 0.5,
  }));

  return [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    ...landingAnchors,
    { url: `${baseUrl}/register`, lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    ...blogPosts,
    { url: `${baseUrl}/legal/kvkk`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/legal/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/legal/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/legal/cookies`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/legal/pre-contract`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
