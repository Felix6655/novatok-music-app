import RecentContent from './RecentContent';

export const metadata = {
  title: 'Recently Played – Your Listening History',
  description: 'Continue where you left off with your recently played tracks on NovaTok Music. Quick access to your listening history.',
  keywords: ['recently played', 'listening history', 'play history', 'recent tracks', 'continue listening'],
  openGraph: {
    title: 'Recently Played – Your Listening History | NovaTok Music',
    description: 'Continue where you left off with your recently played tracks on NovaTok Music.',
  },
};

export default function RecentPage() {
  return <RecentContent />;
}
