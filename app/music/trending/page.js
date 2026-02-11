import TrendingContent from './TrendingContent';

export const metadata = {
  title: 'Trending Music – Most Played Tracks This Week',
  description: 'Discover what\'s hot right now on NovaTok Music. Browse the most played and trending tracks this week, updated in real-time.',
  keywords: ['trending music', 'popular tracks', 'most played songs', 'music charts', 'hot tracks'],
  openGraph: {
    title: 'Trending Music – Most Played Tracks This Week | NovaTok Music',
    description: 'Discover what\'s hot right now on NovaTok Music. Browse the most played tracks this week.',
  },
};

export default function TrendingPage() {
  return <TrendingContent />;
}
