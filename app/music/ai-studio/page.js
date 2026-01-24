'use client';

import { Button } from '@/components/ui/button';
import { Wand2, Sparkles, Music2, Mic2, Sliders } from 'lucide-react';

export default function AIStudioPage() {
  return (
    <div className="max-w-4xl mx-auto text-center py-12">
      {/* Hero */}
      <div className="mb-12">
        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30">
          <Wand2 className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">AI Studio</h1>
        <p className="text-xl text-white/60 max-w-xl mx-auto">
          Create, remix, and transform music with the power of AI
        </p>
      </div>

      {/* Coming Soon Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full mb-12">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <span className="text-purple-400 font-medium">Coming Soon</span>
      </div>

      {/* Features Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Music2 className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">AI Music Generation</h3>
          <p className="text-white/60 text-sm">Generate original tracks from text descriptions</p>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-pink-500/20 flex items-center justify-center">
            <Mic2 className="w-6 h-6 text-pink-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">Voice Cloning</h3>
          <p className="text-white/60 text-sm">Create AI covers with your favorite artist voices</p>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Sliders className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">Smart Remixing</h3>
          <p className="text-white/60 text-sm">Transform tracks with AI-powered effects and styles</p>
        </div>
      </div>

      {/* CTA */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/20">
        <h3 className="text-white font-semibold mb-2">Get Early Access</h3>
        <p className="text-white/60 mb-4">Be the first to know when AI Studio launches</p>
        <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-full px-8" disabled>
          <Sparkles className="w-4 h-4 mr-2" />
          Join Waitlist
        </Button>
      </div>
    </div>
  );
}
