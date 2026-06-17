import CreateWithAIContent from './CreateWithAIContent';

export const metadata = {
  title: 'Create Music with AI – AI Song Generator',
  description: 'Generate original music with AI on NovaTok Music. Describe a vibe, pick a mood and genre, and get a track in seconds.',
  keywords: ['AI music generator', 'create music with AI', 'MusicGen', 'generate music', 'AI song maker'],
  openGraph: {
    title: 'Create Music with AI | NovaTok Music',
    description: 'Generate original music with AI on NovaTok Music.',
  },
};

export default function AIStudioPage() {
  return <CreateWithAIContent />;
}
