'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Music2, Coins, Settings } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import TabsNav from '@/components/TabsNav';
import { isGuestMode } from '@/lib/env';
import { usePlayer } from '@/lib/context/PlayerContext';

function MusicLayoutContent({ children }) {
  const { currentTrack } = usePlayer();
  const guestMode = isGuestMode();

  return (
    <div className={`min-h-screen ${currentTrack ? 'pb-24' : ''}`}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            {/* Logo */}
            <Link href="/music" className="flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Music2 className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-white font-bold text-lg leading-tight">NovaTok Music</h1>
                <p className="text-white/50 text-xs">Discover your sound</p>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 flex justify-center">
              <SearchBar />
            </div>

            {/* Right Side - Settings + Token Badge */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link 
                href="/music/settings" 
                className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-500 font-medium text-sm">0</span>
                <span className="text-yellow-500/60 text-xs hidden sm:inline">tokens</span>
              </div>
            </div>
          </div>

          {/* Guest Mode Banner */}
          {guestMode && (
            <Link href="/music/settings" className="block mb-4">
              <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-center hover:bg-purple-500/20 transition-colors">
                <span className="text-purple-400 text-sm">🎵 Guest Mode Active - <span className="underline">View settings</span> to connect Supabase</span>
              </div>
            </Link>
          )}

          {/* Tabs */}
          <Suspense fallback={<div className="h-10" />}>
            <TabsNav />
          </Suspense>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

export default function MusicLayout({ children }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MusicLayoutContent>{children}</MusicLayoutContent>
    </Suspense>
  );
}
