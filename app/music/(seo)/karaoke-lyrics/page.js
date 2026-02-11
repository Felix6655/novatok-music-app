import Link from 'next/link';
import { Mic, Music2, Play, FileText, Sparkles, ArrowRight, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Karaoke & Lyrics – Sing Along to Your Favorite Songs',
  description: 'Turn any track into a karaoke experience. View synchronized lyrics, sing along, and enjoy your favorite music like never before with NovaTok Music karaoke mode.',
  keywords: ['karaoke app', 'karaoke lyrics app', 'sing along app', 'lyrics viewer', 'karaoke web app', 'music lyrics'],
  openGraph: {
    title: 'Karaoke & Lyrics – Sing Along to Your Favorite Songs | NovaTok Music',
    description: 'Turn any track into a karaoke experience with synchronized lyrics on NovaTok Music.',
  },
};

export default function KaraokeLandingPage() {
  const features = [
    {
      icon: FileText,
      title: 'Synchronized Lyrics',
      description: 'Follow along with perfectly timed lyrics that highlight as the song plays.',
    },
    {
      icon: Volume2,
      title: 'Vocal Control',
      description: 'Adjust vocal levels to practice singing or enjoy instrumental versions.',
    },
    {
      icon: Sparkles,
      title: 'AI-Enhanced',
      description: 'Our AI automatically generates and syncs lyrics for tracks without them.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
          <Mic className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Karaoke & Lyrics – Sing Along to Your Favorite Songs
        </h1>
        <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
          Transform any track into a karaoke experience. View lyrics in real-time, 
          practice your favorite songs, and unleash your inner performer.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-pink-500 hover:bg-pink-600">
            <Link href="/music/karaoke">
              <Mic className="w-5 h-5 mr-2" />
              Start Karaoke
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Link href="/music/lyrics">
              <FileText className="w-5 h-5 mr-2" />
              View Lyrics
            </Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-12">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Karaoke Features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-6 bg-white/5 border border-white/10 rounded-xl text-center"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 border-t border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">How Karaoke Mode Works</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">1</div>
            <div>
              <h3 className="text-white font-semibold mb-1">Choose a Track</h3>
              <p className="text-white/60">Browse our library or search for your favorite song. Most tracks have lyrics available.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">2</div>
            <div>
              <h3 className="text-white font-semibold mb-1">Enable Karaoke Mode</h3>
              <p className="text-white/60">Switch to karaoke view to see synchronized lyrics that scroll as the music plays.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">3</div>
            <div>
              <h3 className="text-white font-semibold mb-1">Sing Along!</h3>
              <p className="text-white/60">Follow the highlighted lyrics and enjoy performing your favorite songs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-12 border-t border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Perfect For</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="text-white font-semibold mb-2">🎤 Vocal Practice</h3>
            <p className="text-white/60 text-sm">Learn new songs, practice pronunciation, and improve your singing skills.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="text-white font-semibold mb-2">🎉 Party Entertainment</h3>
            <p className="text-white/60 text-sm">Host karaoke nights with friends using just your browser – no extra apps needed.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="text-white font-semibold mb-2">📚 Language Learning</h3>
            <p className="text-white/60 text-sm">Use lyrics to learn vocabulary and pronunciation in multiple languages.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <h3 className="text-white font-semibold mb-2">🎵 Music Appreciation</h3>
            <p className="text-white/60 text-sm">Understand the lyrics you've been singing wrong for years!</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to Sing?</h2>
        <p className="text-white/60 mb-6">Jump into karaoke mode – it's free and fun!</p>
        <Button asChild size="lg" className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600">
          <Link href="/music/karaoke">
            Enter Karaoke Mode <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
