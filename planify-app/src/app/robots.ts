import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/pxadmin/', '/auth/callback'],
    },
    sitemap: 'https://kolaytahliye.com/sitemap.xml',
  };
}
