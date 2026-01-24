// Data service abstraction layer - switches between Supabase and local JSON
import { isGuestMode } from '@/lib/env';
import { getSupabaseClient } from '@/lib/supabase/client';
import { tracks, artists, albums, getTracksWithDetails, getArtistById, getAlbumById } from './seed-data';

// Storage keys for guest mode
const STORAGE_KEYS = {
  LIKES: 'novatok_likes',
  RECENTS: 'novatok_recents',
  PLAYLISTS: 'novatok_playlists',
};

// Helper for localStorage (only in browser)
const getStorage = (key, defaultValue = []) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

// TRACKS
export const getTracks = async ({ orderBy = 'created_at', limit = 50, search = '' } = {}) => {
  if (isGuestMode()) {
    let result = getTracksWithDetails();
    
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(searchLower) ||
        t.artist_name.toLowerCase().includes(searchLower)
      );
    }
    
    if (orderBy === 'play_count') {
      result.sort((a, b) => b.play_count - a.play_count);
    } else {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    return result.slice(0, limit);
  }
  
  // Supabase mode
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  
  let query = supabase
    .from('tracks')
    .select(`
      *,
      artists(name),
      albums(title)
    `)
    .order(orderBy, { ascending: false })
    .limit(limit);
  
  if (search) {
    query = query.or(`title.ilike.%${search}%,artists.name.ilike.%${search}%`);
  }
  
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching tracks:', error);
    return [];
  }
  
  return data.map(t => ({
    ...t,
    artist_name: t.artists?.name || 'Unknown Artist',
    album_title: t.albums?.title || 'Unknown Album',
  }));
};

export const getTrackById = async (id) => {
  if (isGuestMode()) {
    const track = tracks.find(t => t.id === id);
    if (!track) return null;
    const artist = getArtistById(track.artist_id);
    const album = getAlbumById(track.album_id);
    return {
      ...track,
      artist_name: artist?.name || 'Unknown Artist',
      album_title: album?.title || 'Unknown Album',
      artist,
      album,
    };
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('tracks')
    .select(`
      *,
      artists(*),
      albums(*)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching track:', error);
    return null;
  }
  
  return {
    ...data,
    artist_name: data.artists?.name || 'Unknown Artist',
    album_title: data.albums?.title || 'Unknown Album',
    artist: data.artists,
    album: data.albums,
  };
};

// LIKES
export const getLikedTracks = async (userId = 'guest') => {
  if (isGuestMode()) {
    const likes = getStorage(STORAGE_KEYS.LIKES, []);
    return getTracksWithDetails().filter(t => likes.includes(t.id));
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('user_likes')
    .select(`
      track_id,
      tracks(*,
        artists(name),
        albums(title)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching likes:', error);
    return [];
  }
  
  return data.map(l => ({
    ...l.tracks,
    artist_name: l.tracks.artists?.name || 'Unknown Artist',
    album_title: l.tracks.albums?.title || 'Unknown Album',
  }));
};

export const isTrackLiked = async (trackId, userId = 'guest') => {
  if (isGuestMode()) {
    const likes = getStorage(STORAGE_KEYS.LIKES, []);
    return likes.includes(trackId);
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  
  const { data } = await supabase
    .from('user_likes')
    .select('track_id')
    .eq('user_id', userId)
    .eq('track_id', trackId)
    .single();
  
  return !!data;
};

export const toggleLike = async (trackId, userId = 'guest') => {
  if (isGuestMode()) {
    const likes = getStorage(STORAGE_KEYS.LIKES, []);
    const isLiked = likes.includes(trackId);
    
    if (isLiked) {
      setStorage(STORAGE_KEYS.LIKES, likes.filter(id => id !== trackId));
    } else {
      setStorage(STORAGE_KEYS.LIKES, [...likes, trackId]);
    }
    
    return !isLiked;
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  
  const isLiked = await isTrackLiked(trackId, userId);
  
  if (isLiked) {
    await supabase
      .from('user_likes')
      .delete()
      .eq('user_id', userId)
      .eq('track_id', trackId);
    return false;
  } else {
    await supabase
      .from('user_likes')
      .insert({ user_id: userId, track_id: trackId });
    return true;
  }
};

// RECENTS
export const getRecentTracks = async (userId = 'guest', limit = 20) => {
  if (isGuestMode()) {
    const recents = getStorage(STORAGE_KEYS.RECENTS, []);
    const recentTrackIds = recents.slice(0, limit);
    return getTracksWithDetails().filter(t => recentTrackIds.includes(t.id))
      .sort((a, b) => recentTrackIds.indexOf(a.id) - recentTrackIds.indexOf(b.id));
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('user_recent')
    .select(`
      track_id,
      played_at,
      tracks(*,
        artists(name),
        albums(title)
      )
    `)
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching recents:', error);
    return [];
  }
  
  return data.map(r => ({
    ...r.tracks,
    artist_name: r.tracks.artists?.name || 'Unknown Artist',
    album_title: r.tracks.albums?.title || 'Unknown Album',
    played_at: r.played_at,
  }));
};

export const addToRecent = async (trackId, userId = 'guest') => {
  if (isGuestMode()) {
    const recents = getStorage(STORAGE_KEYS.RECENTS, []);
    // Remove if exists, add to front
    const filtered = recents.filter(id => id !== trackId);
    setStorage(STORAGE_KEYS.RECENTS, [trackId, ...filtered].slice(0, 50));
    return true;
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  
  // Upsert to update played_at if exists
  const { error } = await supabase
    .from('user_recent')
    .upsert({ user_id: userId, track_id: trackId, played_at: new Date().toISOString() });
  
  return !error;
};

// PLAY COUNT
export const incrementPlayCount = async (trackId) => {
  if (isGuestMode()) {
    // In guest mode, we don't persist play counts
    return true;
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  
  const { error } = await supabase.rpc('increment_play_count', { track_id: trackId });
  return !error;
};

// ARTISTS
export const getArtists = async () => {
  if (isGuestMode()) {
    return artists;
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching artists:', error);
    return [];
  }
  
  return data;
};

export const getArtistByIdWithTracks = async (id) => {
  if (isGuestMode()) {
    const artist = getArtistById(id);
    if (!artist) return null;
    const artistTracks = getTracksWithDetails().filter(t => t.artist_id === id);
    const artistAlbums = albums.filter(a => a.artist_id === id);
    return { ...artist, tracks: artistTracks, albums: artistAlbums };
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('artists')
    .select(`
      *,
      tracks(*),
      albums(*)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching artist:', error);
    return null;
  }
  
  return data;
};

// ALBUMS
export const getAlbumByIdWithTracks = async (id) => {
  if (isGuestMode()) {
    const album = getAlbumById(id);
    if (!album) return null;
    const artist = getArtistById(album.artist_id);
    const albumTracks = getTracksWithDetails().filter(t => t.album_id === id);
    return { ...album, artist, tracks: albumTracks };
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('albums')
    .select(`
      *,
      artists(*),
      tracks(*)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching album:', error);
    return null;
  }
  
  return {
    ...data,
    artist: data.artists,
  };
};

// SEARCH
export const searchAll = async (query) => {
  if (!query) return { tracks: [], artists: [], albums: [] };
  
  const searchLower = query.toLowerCase();
  
  if (isGuestMode()) {
    return {
      tracks: getTracksWithDetails().filter(t => 
        t.title.toLowerCase().includes(searchLower) ||
        t.artist_name.toLowerCase().includes(searchLower)
      ).slice(0, 10),
      artists: artists.filter(a => 
        a.name.toLowerCase().includes(searchLower)
      ).slice(0, 5),
      albums: albums.filter(a => 
        a.title.toLowerCase().includes(searchLower)
      ).slice(0, 5),
    };
  }
  
  const supabase = getSupabaseClient();
  if (!supabase) return { tracks: [], artists: [], albums: [] };
  
  const [tracksResult, artistsResult, albumsResult] = await Promise.all([
    supabase
      .from('tracks')
      .select('*, artists(name), albums(title)')
      .ilike('title', `%${query}%`)
      .limit(10),
    supabase
      .from('artists')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(5),
    supabase
      .from('albums')
      .select('*')
      .ilike('title', `%${query}%`)
      .limit(5),
  ]);
  
  return {
    tracks: (tracksResult.data || []).map(t => ({
      ...t,
      artist_name: t.artists?.name || 'Unknown Artist',
      album_title: t.albums?.title || 'Unknown Album',
    })),
    artists: artistsResult.data || [],
    albums: albumsResult.data || [],
  };
};
