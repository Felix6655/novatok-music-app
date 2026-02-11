import LikedContent from './LikedContent';

export const metadata = {
  title: 'Liked Songs – Your Saved Music Library',
  description: 'Access your liked tracks on NovaTok Music. Build your personal music library by saving your favorite songs.',
  keywords: ['liked songs', 'saved music', 'music library', 'favorite tracks', 'saved tracks'],
  openGraph: {
    title: 'Liked Songs – Your Saved Music Library | NovaTok Music',
    description: 'Access your liked tracks and build your personal music library on NovaTok Music.',
  },
};

export default function LikedPage() {
  return <LikedContent />;
}
