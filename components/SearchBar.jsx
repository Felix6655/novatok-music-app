'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Music2, User, Disc, X, Loader2 } from 'lucide-react';
import { searchAll } from '@/lib/data/data-service';
import { usePlayer } from '@/lib/context/PlayerContext';

export default function SearchBar({ onSearch }) {
  const router = useRouter();
  const { playTrack } = usePlayer();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const debounce = setTimeout(async () => {
      if (query.trim()) {
        setIsLoading(true);
        const searchResults = await searchAll(query);
        setResults(searchResults);
        setIsOpen(true);
        setIsLoading(false);
        
        // Also trigger parent search callback if provided
        if (onSearch) {
          onSearch(query);
        }
      } else {
        setResults(null);
        setIsOpen(false);
        if (onSearch) {
          onSearch('');
        }
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, onSearch]);

  const handleTrackClick = (track, allTracks) => {
    const index = allTracks.findIndex(t => t.id === track.id);
    playTrack(track, allTracks, index >= 0 ? index : 0);
    setIsOpen(false);
    setQuery('');
  };

  const hasResults = results && (results.tracks.length > 0 || results.artists.length > 0 || results.albums.length > 0);

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search tracks, artists, albums..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results && setIsOpen(true)}
          className="w-full pl-12 pr-10 py-3 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-full"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults(null);
              setIsOpen(false);
              if (onSearch) onSearch('');
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
          {isLoading ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
            </div>
          ) : !hasResults ? (
            <div className="p-8 text-center text-white/60">
              No results found for "{query}"
            </div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="p-2">
                {/* Tracks */}
                {results.tracks.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-white/40 text-xs font-medium uppercase px-3 py-2">Tracks</h4>
                    {results.tracks.map((track) => (
                      <div
                        key={track.id}
                        onClick={() => handleTrackClick(track, results.tracks)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded bg-purple-500/20 overflow-hidden flex-shrink-0">
                          {track.cover_url ? (
                            <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music2 className="w-5 h-5 text-purple-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white truncate">{track.title}</p>
                          <p className="text-white/60 text-sm truncate">{track.artist_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Artists */}
                {results.artists.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-white/40 text-xs font-medium uppercase px-3 py-2">Artists</h4>
                    {results.artists.map((artist) => (
                      <div
                        key={artist.id}
                        onClick={() => {
                          router.push(`/music/artist/${artist.id}`);
                          setIsOpen(false);
                          setQuery('');
                        }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 overflow-hidden flex-shrink-0">
                          {artist.image_url ? (
                            <img src={artist.image_url} alt={artist.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-5 h-5 text-purple-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white truncate">{artist.name}</p>
                          <p className="text-white/60 text-sm">Artist</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Albums */}
                {results.albums.length > 0 && (
                  <div>
                    <h4 className="text-white/40 text-xs font-medium uppercase px-3 py-2">Albums</h4>
                    {results.albums.map((album) => (
                      <div
                        key={album.id}
                        onClick={() => {
                          router.push(`/music/album/${album.id}`);
                          setIsOpen(false);
                          setQuery('');
                        }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded bg-purple-500/20 overflow-hidden flex-shrink-0">
                          {album.cover_url ? (
                            <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Disc className="w-5 h-5 text-purple-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white truncate">{album.title}</p>
                          <p className="text-white/60 text-sm">Album</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
}
