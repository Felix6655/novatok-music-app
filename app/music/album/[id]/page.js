'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import TrackCard from '@/components/TrackCard';
import { usePlayer } from '@/lib/context/PlayerContext';
import { getAlbumByIdWithTracks } from '@/lib/data/data-service';
import { Play, ArrowLeft, Loader2, Disc, User } from 'lucide-react';

export default function AlbumPage() {
  const params = useParams();
  const router = useRouter();
  const { playTrack } = usePlayer();
  
  const [album, setAlbum] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlbum = async () => {
      setIsLoading(true);
      const data = await getAlbumByIdWithTracks(params.id);
      setAlbum(data);
      setIsLoading(false);
    };
    fetchAlbum();
  }, [params.id]);

  const handlePlayAll = () => {
    if (album?.tracks?.length > 0) {
      playTrack(album.tracks[0], album.tracks, 0);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
        <p className="text-white/60">Loading album...</p>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
          <Disc className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-white text-xl font-semibold mb-2">Album not found</h2>
        <p className="text-white/60 mb-4">This album doesn&apos;t exist.</p>
        <Button onClick={() => router.push('/music')} variant="outline" className="border-white/20 text-white hover:bg-white/10">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Discover
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="text-white/60 hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Album Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="w-full md:w-64 aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20 flex-shrink-0">
          {album.cover_url ? (
            <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
              <Disc className="w-20 h-20 text-white/40" />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-end">
          <p className="text-white/60 text-sm mb-1">Album</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{album.title}</h1>
          {album.artist && (
            <Link 
              href={`/music/artist/${album.artist.id}`}
              className="text-purple-400 hover:text-purple-300 transition-colors mb-2 inline-flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              {album.artist.name}
            </Link>
          )}
          <p className="text-white/60 mb-4">{album.tracks?.length || 0} tracks</p>
          <Button
            onClick={handlePlayAll}
            size="lg"
            className="bg-purple-500 hover:bg-purple-600 text-white rounded-full px-8 w-fit"
            disabled={!album.tracks?.length}
          >
            <Play className="w-5 h-5 mr-2" />
            Play All
          </Button>
        </div>
      </div>

      {/* Tracks */}
      {album.tracks?.length > 0 ? (
        <>
          <h2 className="text-xl font-semibold text-white mb-4">Tracks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {album.tracks.map((track) => (
              <TrackCard key={track.id} track={track} allTracks={album.tracks} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-10">
          <p className="text-white/60">No tracks available for this album.</p>
        </div>
      )}
    </div>
  );
}
