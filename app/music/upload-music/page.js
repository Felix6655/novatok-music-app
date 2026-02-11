import Link from 'next/link';
import { Upload, Music2, Cloud, Share2, Globe, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Upload Your Music – Share Tracks with the World',
  description: 'Upload and share your music with a global audience. NovaTok Music makes it easy to publish tracks, reach listeners, and grow your fanbase as a music creator.',
  keywords: ['upload music', 'share music online', 'music upload platform', 'upload tracks', 'creator music platform', 'music distribution'],
  openGraph: {
    title: 'Upload Your Music – Share Tracks with the World | NovaTok Music',
    description: 'Upload and share your music with a global audience on NovaTok Music.',
  },
};

export default function UploadMusicPage() {
  const benefits = [
    'Unlimited uploads for creators',
    'High-quality audio streaming',
    'Instant global distribution',
    'Track analytics and insights',
    'Direct listener engagement',
    'Keep 100% of your rights',
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
          <Upload className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Upload Your Music – Share Tracks with the World
        </h1>
        <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
          Your music deserves to be heard. Upload your tracks to NovaTok Music and 
          reach listeners worldwide. It's free, fast, and built for creators.
        </p>
        <Button asChild size="lg" className="bg-green-500 hover:bg-green-600">
          <Link href="/music/upload">
            <Upload className="w-5 h-5 mr-2" />
            Upload Now
          </Link>
        </Button>
      </section>

      {/* Benefits */}
      <section className="py-12">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Why Upload to NovaTok?</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-white">{benefit}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 border-t border-white/10">
        <h2 className="text-2xl font-bold text-white mb-8">How to Upload Your Music</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold flex-shrink-0">1</div>
            <div>
              <h3 className="text-white font-semibold mb-1">Prepare Your Track</h3>
              <p className="text-white/60">Export your track in MP3, WAV, or M4A format. Add a cover image for best results.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold flex-shrink-0">2</div>
            <div>
              <h3 className="text-white font-semibold mb-1">Fill in Track Details</h3>
              <p className="text-white/60">Add your track title, artist name, and optional cover art. Good metadata helps listeners find you.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold flex-shrink-0">3</div>
            <div>
              <h3 className="text-white font-semibold mb-1">Upload & Share</h3>
              <p className="text-white/60">Click upload and watch your track go live. Share the link with fans and promote your music.</p>
            </div>
          </div>
        </div>
      </section>

      {/* File Requirements */}
      <section className="py-12 border-t border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Upload Requirements</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <Music2 className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-white font-semibold mb-2">Audio Files</h3>
            <ul className="text-white/60 space-y-1 text-sm">
              <li>• Formats: MP3, WAV, M4A</li>
              <li>• Max size: 50MB per track</li>
              <li>• Recommended: 320kbps MP3 or lossless</li>
            </ul>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
            <Globe className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-white font-semibold mb-2">Cover Images</h3>
            <ul className="text-white/60 space-y-1 text-sm">
              <li>• Formats: JPEG, PNG, WebP</li>
              <li>• Recommended: 1400x1400px</li>
              <li>• Minimum: 500x500px</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Creator Platform */}
      <section className="py-12 border-t border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Built for Music Creators</h2>
        <div className="space-y-4 text-white/70">
          <p>
            NovaTok Music is more than a streaming platform – it's a <strong className="text-white">creator-first community</strong>. 
            We believe every artist deserves a platform to share their work without complicated contracts or revenue splits.
          </p>
          <p>
            When you upload to NovaTok, you <strong className="text-white">keep 100% of your rights</strong>. 
            Your music, your rules. We simply provide the infrastructure to help you reach listeners worldwide.
          </p>
          <p>
            Join thousands of creators already sharing their music on NovaTok. 
            From bedroom producers to professional artists, our platform welcomes all levels of talent.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Your Music Deserves to Be Heard</h2>
        <p className="text-white/60 mb-6">Start uploading today – it's free and takes just minutes.</p>
        <Button asChild size="lg" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
          <Link href="/music/upload">
            Upload Your First Track <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
