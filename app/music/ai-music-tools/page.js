import Link from 'next/link';
import { Wand2, Music2, Sparkles, Brain, Mic2, AudioWaveform, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'AI Music Tools – Create, Remix & Enhance Your Sound',
  description: 'Unlock powerful AI music tools for creators. Generate beats, remix tracks, enhance audio quality, and create music like never before with NovaTok Music AI Studio.',
  keywords: ['AI music tools', 'AI music generator', 'music creator tools', 'AI audio enhancement', 'music production AI', 'beat generator'],
  openGraph: {
    title: 'AI Music Tools – Create, Remix & Enhance Your Sound | NovaTok Music',
    description: 'Unlock powerful AI music tools for creators on NovaTok Music AI Studio.',
  },
};

export default function AIMusicToolsPage() {
  const tools = [
    {
      icon: AudioWaveform,
      title: 'Beat Generation',
      description: 'Create unique beats and instrumentals using AI. Perfect for producers and content creators.',
      status: 'Available',
    },
    {
      icon: Mic2,
      title: 'Vocal Enhancement',
      description: 'Improve vocal recordings with AI-powered noise reduction and clarity enhancement.',
      status: 'Coming Soon',
    },
    {
      icon: Sparkles,
      title: 'Audio Remix',
      description: 'Transform existing tracks into new styles and genres with AI remixing.',
      status: 'Coming Soon',
    },
    {
      icon: Brain,
      title: 'Smart Mastering',
      description: 'Professional-quality mastering powered by AI, optimized for streaming platforms.',
      status: 'Coming Soon',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
          <Wand2 className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          AI Music Tools – Create, Remix & Enhance Your Sound
        </h1>
        <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
          Unleash your creativity with powerful AI-powered music tools. 
          Whether you're producing beats or enhancing vocals, NovaTok AI Studio has you covered.
        </p>
        <Button asChild size="lg" className="bg-cyan-500 hover:bg-cyan-600">
          <Link href="/music/ai-studio">
            <Wand2 className="w-5 h-5 mr-2" />
            Open AI Studio
          </Link>
        </Button>
      </section>

      {/* Tools Grid */}
      <section className="py-12">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">AI Creator Tools</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.title}
                className="p-6 bg-white/5 border border-white/10 rounded-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    tool.status === 'Available' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {tool.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{tool.title}</h3>
                <p className="text-white/60">{tool.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why AI Music Tools */}
      <section className="py-12 border-t border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Why Use AI for Music Creation?</h2>
        <div className="space-y-4 text-white/70">
          <p>
            AI music tools are revolutionizing how creators make music. Whether you're a 
            <strong className="text-white"> beginner exploring music production</strong> or a 
            <strong className="text-white"> professional looking for quick prototypes</strong>, 
            AI can accelerate your creative workflow.
          </p>
          <p>
            NovaTok's AI Studio brings professional-grade tools to your browser. No expensive software, 
            no steep learning curves – just powerful creation tools accessible to everyone.
          </p>
          <p>
            From generating unique beats to enhancing your vocal recordings, our AI tools are designed 
            to <strong className="text-white">augment your creativity</strong>, not replace it. 
            You stay in control while AI handles the technical heavy lifting.
          </p>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-12 border-t border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Who Uses AI Music Tools?</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded-lg text-center">
            <div className="text-3xl mb-2">🎬</div>
            <h3 className="text-white font-semibold mb-1">Content Creators</h3>
            <p className="text-white/60 text-sm">Generate royalty-free background music for videos and podcasts.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg text-center">
            <div className="text-3xl mb-2">🎹</div>
            <h3 className="text-white font-semibold mb-1">Music Producers</h3>
            <p className="text-white/60 text-sm">Quickly prototype ideas and explore new sounds.</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg text-center">
            <div className="text-3xl mb-2">🎤</div>
            <h3 className="text-white font-semibold mb-1">Musicians</h3>
            <p className="text-white/60 text-sm">Enhance demos and improve recording quality.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Start Creating with AI</h2>
        <p className="text-white/60 mb-6">No signup required – jump right into the AI Studio.</p>
        <Button asChild size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
          <Link href="/music/ai-studio">
            Launch AI Studio <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
