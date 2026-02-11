// Robots.txt for NovaTok Music
// Controls search engine crawling behavior
// Uses ONLY NEXT_PUBLIC_SITE_URL for canonical URLs

export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://novatok.music';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/private/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
