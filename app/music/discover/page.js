import Link from 'next/link';
import { Sparkles, TrendingUp, Heart, Mic, Wand2, Upload, Music2, Play, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Discover New Music and Creator Tracks Daily',
  description: 'Explore the latest music releases, trending tracks, and creator uploads. Stream high-quality audio, build playlists, and discover your next favorite song on NovaTok Music.',
  keywords: ['discover music', 'new music releases', 'trending tracks', 'music discovery platform', 'stream music free'],
  openGraph: {
    title: 'Discover New Music and Creator Tracks Daily | NovaTok Music',
    description: 'Explore the latest music releases, trending tracks, and creator uploads on NovaTok Music.',
  },
};

export default function DiscoverPage() {
  const features = [
    {
      icon: Sparkles,
      title: 'Fresh Releases',
      description: 'New tracks added daily from independent creators and trending artists.',
      href: '/music',
    },
    {
      icon: TrendingUp,
      title: 'Trending Charts',
      description: 'See what\'s hot right now with real-time trending music charts.',
      href: '/music/trending',
    },
    {
      icon: Heart,
      title: 'Save Favorites',
      description: 'Like tracks to build your personal music library.',
      href: '/music/liked',
    },
    {
      icon: Mic,
      title: 'Karaoke Mode',
      description: 'Sing along with synchronized lyrics and karaoke features.',
      href: '/music/karaoke',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Music2 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Discover New Music and Creator Tracks Daily
        </h1>
        <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
          Your gateway to fresh sounds, trending hits, and undiscovered gems. 
          Stream unlimited music from creators worldwide.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="bg-purple-500 hover:bg-purple-600">
            <Link href="/music">
              <Play className="w-5 h-5 mr-2" />
              Start Listening
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <Link href="/music/trending">
              <TrendingUp className="w-5 h-5 mr-2" />
              View Trending
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">How Discovery Works</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className="group p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-purple-500/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
                  <Icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60">{feature.description}</p>
                <div className="mt-4 flex items-center text-purple-400 text-sm font-medium">
                  Explore <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Why NovaTok Section */}
      <section className="py-12 border-t border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Why Choose NovaTok Music?</h2>
        <div className="space-y-4 text-white/70">
          <p>
            NovaTok Music is built for music lovers and creators alike. Unlike traditional streaming platforms, 
            we focus on <strong className="text-white">discovery</strong> – helping you find tracks you'll actually love, 
            not just what algorithms think you should hear.
          </p>
          <p>
            Our platform features a <strong className="text-white">persistent global player</strong> that keeps your music 
            playing as you browse. Like a track? Save it instantly. Want to sing along? Jump into karaoke mode. 
            Ready to share your own music? Upload in seconds.
          </p>
          <p>
            Whether you're here to discover new artists, revisit trending hits, or share your own creations, 
            NovaTok Music has everything you need in one beautiful, fast web app.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to Explore?</h2>
        <p className="text-white/60 mb-6">Jump into the music – no signup required.</p>
        <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          <Link href="/music">
            Start Discovering <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
