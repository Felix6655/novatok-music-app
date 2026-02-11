'use client';

import MiniPlayer from './MiniPlayer';
import ExpandedPlayer from './ExpandedPlayer';
import { usePlayer } from '@/lib/context/PlayerContext';

export default function GlobalPlayer() {
  const { hasRestored } = usePlayer();
  
  // Don't render until state is restored from localStorage
  if (!hasRestored) return null;
  
  return (
    <>
      <MiniPlayer />
      <ExpandedPlayer />
    </>
  );
}
