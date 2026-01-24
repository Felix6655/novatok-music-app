-- Migration: 0001_novatok_music.sql
-- NovaTok Music Database Schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Albums table
CREATE TABLE IF NOT EXISTS albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracks table
CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
  duration_sec INT NOT NULL DEFAULT 0,
  cover_url TEXT,
  audio_url TEXT,
  play_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User likes table (for tracking liked songs)
CREATE TABLE IF NOT EXISTS user_likes (
  user_id UUID NOT NULL,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, track_id)
);

-- User recent plays table
CREATE TABLE IF NOT EXISTS user_recent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_recent_user_id ON user_recent(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recent_played_at ON user_recent(played_at DESC);

-- Playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlist tracks junction table
CREATE TABLE IF NOT EXISTS playlist_tracks (
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 0,
  PRIMARY KEY (playlist_id, track_id)
);

-- Enable Row Level Security
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recent ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_likes
CREATE POLICY "Users can view their own likes" ON user_likes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own likes" ON user_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON user_likes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_recent
CREATE POLICY "Users can view their own recent plays" ON user_recent
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recent plays" ON user_recent
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for playlists
CREATE POLICY "Users can view their own playlists" ON playlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists" ON playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" ON playlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" ON playlists
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for playlist_tracks
CREATE POLICY "Users can view tracks in their playlists" ON playlist_tracks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE playlists.id = playlist_tracks.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add tracks to their playlists" ON playlist_tracks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE playlists.id = playlist_tracks.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove tracks from their playlists" ON playlist_tracks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM playlists 
      WHERE playlists.id = playlist_tracks.playlist_id 
      AND playlists.user_id = auth.uid()
    )
  );

-- Function to increment play count
CREATE OR REPLACE FUNCTION increment_play_count(track_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tracks SET play_count = play_count + 1 WHERE id = track_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION increment_play_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_play_count(UUID) TO anon;

-- ============================================
-- SEED DATA
-- ============================================

-- Insert Artists
INSERT INTO artists (id, name, image_url) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'HUNTR/X', 'https://picsum.photos/seed/huntrx/200/200'),
  ('a1000000-0000-0000-0000-000000000002', 'Djo', 'https://picsum.photos/seed/djo/200/200'),
  ('a1000000-0000-0000-0000-000000000003', 'sombr', 'https://picsum.photos/seed/sombr/200/200'),
  ('a1000000-0000-0000-0000-000000000004', 'Kehlani', 'https://picsum.photos/seed/kehlani/200/200'),
  ('a1000000-0000-0000-0000-000000000005', 'Sabrina Carpenter', 'https://picsum.photos/seed/sabrina/200/200'),
  ('a1000000-0000-0000-0000-000000000006', 'Leon Thomas', 'https://picsum.photos/seed/leon/200/200')
ON CONFLICT (id) DO NOTHING;

-- Insert Albums
INSERT INTO albums (id, title, artist_id, cover_url) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'K-Pop Demon Hunters', 'a1000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/kpopdemon/400/400'),
  ('b1000000-0000-0000-0000-000000000002', 'DECIDE', 'a1000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/decide/400/400'),
  ('b1000000-0000-0000-0000-000000000003', 'Midnight Thoughts', 'a1000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/midnightthoughts/400/400'),
  ('b1000000-0000-0000-0000-000000000004', 'Blue Moon', 'a1000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/bluemoon/400/400'),
  ('b1000000-0000-0000-0000-000000000005', 'emails i cant send', 'a1000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/emails/400/400'),
  ('b1000000-0000-0000-0000-000000000006', 'Genesis', 'a1000000-0000-0000-0000-000000000006', 'https://picsum.photos/seed/genesis/400/400')
ON CONFLICT (id) DO NOTHING;

-- Insert Tracks (20 tracks)
INSERT INTO tracks (id, title, artist_id, album_id, duration_sec, cover_url, audio_url, play_count) VALUES
  ('t1000000-0000-0000-0000-000000000001', 'Golden', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 192, 'https://picsum.photos/seed/golden/400/400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 15420),
  ('t1000000-0000-0000-0000-000000000002', 'End of Beginning', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 159, 'https://picsum.photos/seed/endofbegin/400/400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 98234),
  ('t1000000-0000-0000-0000-000000000003', 'back to friends', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 199, 'https://picsum.photos/seed/friends/400/400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 45123),
  ('t1000000-0000-0000-0000-000000000004', 'Folded', 'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 238, 'https://picsum.photos/seed/folded/400/400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 67890),
  ('t1000000-0000-0000-0000-000000000005', 'Manchild', 'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000005', 213, 'https://picsum.photos/seed/manchild/400/400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 34567),
  ('t1000000-0000-0000-0000-000000000006', 'MUTT', 'a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000006', 193, 'https://picsum.photos/seed/mutt/400/400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 23456),
  ('t1000000-0000-0000-0000-000000000007', 'Ordinary', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 186, 'https://picsum.photos/seed/ordinary/400/400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 78901),
  ('t1000000-0000-0000-0000-000000000008', 'Man I Need', 'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 184, 'https://picsum.photos/seed/manneed/400/400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 56789),
  ('t1000000-0000-0000-0000-000000000009', 'Starlight', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 224, 'https://picsum.photos/seed/starlight/400/400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 12345),
  ('t1000000-0000-0000-0000-000000000010', 'Electric Dreams', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 201, 'https://picsum.photos/seed/electric/400/400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 89012),
  ('t1000000-0000-0000-0000-000000000011', 'Neon Nights', 'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000005', 178, 'https://picsum.photos/seed/dreams/400/400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 43210),
  ('t1000000-0000-0000-0000-000000000012', 'Cosmic Dance', 'a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000006', 245, 'https://picsum.photos/seed/neon/400/400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 65432),
  ('t1000000-0000-0000-0000-000000000013', 'Waves', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 167, 'https://picsum.photos/seed/cosmic/400/400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 21098),
  ('t1000000-0000-0000-0000-000000000014', 'Aurora', 'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 234, 'https://picsum.photos/seed/waves/400/400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 87654),
  ('t1000000-0000-0000-0000-000000000015', 'Pulse', 'a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 189, 'https://picsum.photos/seed/aurora/400/400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 32109),
  ('t1000000-0000-0000-0000-000000000016', 'Echo', 'a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 212, 'https://picsum.photos/seed/pulse/400/400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 54321),
  ('t1000000-0000-0000-0000-000000000017', 'Drift Away', 'a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000005', 198, 'https://picsum.photos/seed/echo/400/400', NULL, 76543),
  ('t1000000-0000-0000-0000-000000000018', 'Spark', 'a1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000006', 176, 'https://picsum.photos/seed/drift/400/400', NULL, 98765),
  ('t1000000-0000-0000-0000-000000000019', 'Bloom', 'a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 221, 'https://picsum.photos/seed/spark/400/400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 10987),
  ('t1000000-0000-0000-0000-000000000020', 'Twilight Zone', 'a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 203, 'https://picsum.photos/seed/bloom/400/400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 43218)
ON CONFLICT (id) DO NOTHING;
