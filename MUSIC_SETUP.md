# NovaTok Music - Setup Guide

## Overview

NovaTok Music is a full-featured music streaming application with:
- Global persistent audio player
- Track discovery and search
- Liked songs and listening history
- Lyrics viewer and Karaoke mode
- Track upload functionality (with Supabase)
- Guest Mode for demo/local usage

## Quick Start

### 1. Install Dependencies

```bash
yarn install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env.local
```

### 3. Choose Your Mode

#### Guest Mode (Default - No Setup Required)

The app works out of the box in Guest Mode:
- Uses 20 demo tracks with real audio
- Data stored in browser localStorage
- No cloud sync, no uploads

Just run:
```bash
yarn dev
```

#### Production Mode (With Supabase)

For full functionality including uploads and cloud sync:

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Get your credentials from **Project Settings > API**:
   - Project URL
   - Anon/Public Key

3. Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. Run the migration in Supabase SQL Editor:
   - Copy contents of `supabase/migrations/0001_novatok_music.sql`
   - Paste and run in Supabase SQL Editor

5. Create storage buckets:
   - Go to **Storage** in Supabase dashboard
   - Create bucket: `music-audio`
   - Create bucket: `music-covers`
   - Set both to **Public** or configure policies

6. Start the app:
```bash
yarn dev
```

## Database Schema

### Tables

```sql
-- Artists
artists (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ
)

-- Albums
albums (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  artist_id UUID REFERENCES artists(id),
  cover_url TEXT,
  created_at TIMESTAMPTZ
)

-- Tracks
tracks (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  artist_id UUID REFERENCES artists(id),
  album_id UUID REFERENCES albums(id),
  duration_sec INT,
  cover_url TEXT,
  audio_url TEXT,
  play_count INT DEFAULT 0,
  created_at TIMESTAMPTZ
)

-- User Likes
user_likes (
  user_id UUID,
  track_id UUID REFERENCES tracks(id),
  created_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, track_id)
)

-- User Recent Plays
user_recent (
  id UUID PRIMARY KEY,
  user_id UUID,
  track_id UUID REFERENCES tracks(id),
  played_at TIMESTAMPTZ
)
```

### Storage Buckets

| Bucket | Purpose | Access |
|--------|---------|--------|
| `music-audio` | Audio files (.mp3, .m4a, .wav) | Public read, Auth write |
| `music-covers` | Cover images (.jpg, .png, .webp) | Public read, Auth write |

### Row Level Security (RLS)

- `artists`, `albums`, `tracks`: Public read access
- `user_likes`, `user_recent`: Users can only access their own data

## Features

### Global Player

The player persists across all navigation:
- Stores state in localStorage
- Restores on page refresh
- Supports queue management
- Shuffle and repeat modes

### Audio Playback

Single HTML5 `<audio>` instance to prevent:
- Memory leaks
- Double playback
- Interrupted audio on navigation

### Data Service

Abstraction layer (`lib/data/data-service.js`) that:
- Checks for Supabase configuration
- Falls back to local seed data in Guest Mode
- Provides consistent API regardless of backend

## Routes

| Route | Description |
|-------|-------------|
| `/music` | Discover - Latest tracks |
| `/music/trending` | Trending - Most played |
| `/music/liked` | User's liked tracks |
| `/music/recent` | Recently played |
| `/music/upload` | Upload new tracks |
| `/music/lyrics` | Lyrics viewer |
| `/music/karaoke` | Karaoke mode |
| `/music/ai-studio` | AI features (coming soon) |
| `/music/track/[id]` | Track detail page |
| `/music/artist/[id]` | Artist page |
| `/music/album/[id]` | Album page |
| `/music/settings` | Connection status |

## Local Storage Keys

| Key | Purpose |
|-----|----------|
| `novatok_player_state` | Player state (track, queue, position, volume) |
| `novatok_likes` | Liked track IDs |
| `novatok_recents` | Recent track IDs |
| `novatok_play_counts` | Local play count increments |

## Troubleshooting

### Audio doesn't play
- Check browser autoplay policies
- Verify audio URL is accessible
- Check browser console for errors

### Supabase connection fails
- Verify environment variables are correct
- Check Supabase project is active
- Verify API keys have correct permissions

### Upload fails
- Check storage bucket exists
- Verify bucket policies allow uploads
- Check file size limits in Supabase

### Data not persisting
- Check localStorage is enabled
- Verify no private browsing mode
- Check browser storage quota

## Development

```bash
# Start dev server
yarn dev

# Build for production
yarn build

# Run production server
yarn start

# Run linting
yarn lint
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **State**: React Context + useReducer
- **Audio**: HTML5 Audio API
