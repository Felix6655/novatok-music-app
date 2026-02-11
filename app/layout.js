import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { PlayerProvider } from '@/lib/context/PlayerContext';
import { AuthProvider } from '@/lib/context/AuthContext';
import GlobalPlayer from '@/components/player/GlobalPlayer';

const inter = Inter({ subsets: ['latin'] });

// ⚠️ IMPORTANT: Set NEXT_PUBLIC_SITE_URL in Vercel for production.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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
  ],
  authors: [{ name: 'NovaTok Music' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'NovaTok Music',
    title: 'NovaTok Music – Discover, Play, Upload & Create',
    description: 'Stream tracks, explore trending music, like songs, upload your own, and unlock AI creator tools.',
    images: [{ url: '/og-music.png', width: 1200, height: 630, alt: 'NovaTok Music' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NovaTok Music – Discover, Play, Upload & Create',
    description: 'Stream tracks, explore trending music, like songs, upload your own.',
    images: ['/og-music.png'],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
  manifest: '/manifest.json',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'NovaTok Music',
  applicationCategory: 'MusicApplication',
  operatingSystem: 'Web',
  description: 'Stream tracks, explore trending music, upload your own, and unlock AI creator tools.',
  url: siteUrl,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${inter.className} bg-[#0a0a0f] min-h-screen`}>
        <AuthProvider>
          <PlayerProvider>
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  radial-gradient(2px 2px at 20px 30px, white, transparent),
                  radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
                  radial-gradient(1px 1px at 90px 40px, white, transparent),
                  radial-gradient(2px 2px at 160px 120px, rgba(255,255,255,0.6), transparent),
                  radial-gradient(1px 1px at 230px 80px, white, transparent),
                  radial-gradient(2px 2px at 300px 150px, rgba(255,255,255,0.7), transparent)
                `,
                backgroundSize: '650px 250px',
              }} />
              <svg className="absolute inset-0 w-full h-full opacity-20">
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                <line x1="10%" y1="20%" x2="25%" y2="35%" stroke="url(#lineGrad)" strokeWidth="1" />
                <line x1="70%" y1="15%" x2="85%" y2="30%" stroke="url(#lineGrad)" strokeWidth="1" />
              </svg>
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">{children}</div>
            <GlobalPlayer />
            <Toaster position="top-center" toastOptions={{
              style: { background: 'rgba(15, 15, 20, 0.95)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' },
            }} />
          </PlayerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
