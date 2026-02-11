import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { PlayerProvider } from '@/lib/context/PlayerContext';
import GlobalPlayer from '@/components/player/GlobalPlayer';

const inter = Inter({ subsets: ['latin'] });

// SEO Configuration
const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://novatok.music';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'NovaTok Music – Discover, Play, Upload & Create',
    template: '%s | NovaTok Music',
  },
  description: 'Stream tracks, explore trending music, like songs, upload your own, and unlock AI creator tools with NovaTok Music. The ultimate web music player for creators.',
  keywords: [
    'music player web app',
    'AI music tools',
    'karaoke lyrics app',
    'creator music platform',
    'upload and share tracks',
    'stream music online',
    'trending music player',
    'music discovery app',
    'web audio player',
    'music streaming platform',
  ],
  authors: [{ name: 'NovaTok Music' }],
  creator: 'NovaTok Music',
  publisher: 'NovaTok Music',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'NovaTok Music',
    title: 'NovaTok Music – Discover, Play, Upload & Create',
    description: 'Stream tracks, explore trending music, like songs, upload your own, and unlock AI creator tools with NovaTok Music.',
    images: [
      {
        url: '/og-music.png',
        width: 1200,
        height: 630,
        alt: 'NovaTok Music - Your Ultimate Music Discovery Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NovaTok Music – Discover, Play, Upload & Create',
    description: 'Stream tracks, explore trending music, like songs, upload your own, and unlock AI creator tools.',
    images: ['/og-music.png'],
    creator: '@novatok',
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
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    // Add verification codes when available
    // google: 'google-site-verification-code',
    // yandex: 'yandex-verification-code',
  },
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'NovaTok Music',
  applicationCategory: 'MusicApplication',
  operatingSystem: 'Web',
  description: 'Stream tracks, explore trending music, like songs, upload your own, and unlock AI creator tools with NovaTok Music.',
  url: siteUrl,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free music streaming and discovery',
  },
  featureList: [
    'Music streaming',
    'Track discovery',
    'Trending charts',
    'Liked songs library',
    'Recent plays history',
    'Track upload',
    'AI music tools',
    'Karaoke mode',
    'Lyrics viewer',
  ],
  screenshot: `${siteUrl}/og-music.png`,
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250',
    bestRating: '5',
    worstRating: '1',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-[#0a0a0f] min-h-screen`}>
        <PlayerProvider>
          {/* Cosmic Background */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {/* Stars */}
            <div className="absolute inset-0" style={{
              backgroundImage: `
                radial-gradient(2px 2px at 20px 30px, white, transparent),
                radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
                radial-gradient(1px 1px at 90px 40px, white, transparent),
                radial-gradient(2px 2px at 160px 120px, rgba(255,255,255,0.6), transparent),
                radial-gradient(1px 1px at 230px 80px, white, transparent),
                radial-gradient(2px 2px at 300px 150px, rgba(255,255,255,0.7), transparent),
                radial-gradient(1px 1px at 380px 60px, white, transparent),
                radial-gradient(2px 2px at 450px 200px, rgba(255,255,255,0.5), transparent),
                radial-gradient(1px 1px at 520px 100px, white, transparent),
                radial-gradient(2px 2px at 600px 180px, rgba(255,255,255,0.8), transparent)
              `,
              backgroundSize: '650px 250px',
            }} />
            {/* Constellation lines */}
            <svg className="absolute inset-0 w-full h-full opacity-20">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <line x1="10%" y1="20%" x2="25%" y2="35%" stroke="url(#lineGrad)" strokeWidth="1" />
              <line x1="25%" y1="35%" x2="15%" y2="50%" stroke="url(#lineGrad)" strokeWidth="1" />
              <line x1="70%" y1="15%" x2="85%" y2="30%" stroke="url(#lineGrad)" strokeWidth="1" />
              <line x1="85%" y1="30%" x2="75%" y2="45%" stroke="url(#lineGrad)" strokeWidth="1" />
              <line x1="75%" y1="45%" x2="90%" y2="60%" stroke="url(#lineGrad)" strokeWidth="1" />
              <line x1="40%" y1="70%" x2="55%" y2="85%" stroke="url(#lineGrad)" strokeWidth="1" />
              <line x1="55%" y1="85%" x2="45%" y2="95%" stroke="url(#lineGrad)" strokeWidth="1" />
            </svg>
            {/* Purple glow */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            {children}
          </div>
          
          <GlobalPlayer />
          <Toaster 
            position="top-center" 
            toastOptions={{
              style: {
                background: 'rgba(15, 15, 20, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
              },
            }}
          />
        </PlayerProvider>
      </body>
    </html>
  );
}
