import MusicContent from './MusicContent';

export const metadata = {
  title: 'Discover New Music – Stream Tracks & Find Your Sound',
  description: 'Explore the latest music releases on NovaTok Music. Stream high-quality tracks, discover new artists, and build your personal music library.',
  keywords: ['discover music', 'stream music', 'new releases', 'music player', 'find new music'],
  openGraph: {
    title: 'Discover New Music – Stream Tracks & Find Your Sound | NovaTok Music',
    description: 'Explore the latest music releases on NovaTok Music. Stream high-quality tracks and discover new artists.',
  },
};

export default function MusicPage() {
  return <MusicContent />;
}
