# NovaTok Music

A modern music streaming application built with Next.js 14, featuring a persistent global player, lyrics sync, and karaoke mode.

## Features

- 🎵 **Discover** - Browse the latest tracks with a beautiful grid UI
- 📈 **Trending** - See what's popular based on play count
- ❤️ **Liked Songs** - Save your favorite tracks
- ⏰ **Recent Plays** - Continue where you left off
- 🎤 **Lyrics Viewer** - View and sync lyrics with playback
- 🎶 **Karaoke Mode** - Sing along with auto-scrolling lyrics
- 🤖 **AI Studio** - Coming soon: AI-powered music creation

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide Icons
- **Database**: Supabase (PostgreSQL) with Guest Mode fallback
- **State Management**: React Context API
- **Audio**: Native HTML5 Audio API

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn package manager
- (Optional) Supabase account for cloud sync

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/novatok-music.git
cd novatok-music

# Install dependencies
yarn install

# Start development server
yarn dev
```

The app will be available at `http://localhost:3000`

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. (Optional) Add Supabase credentials:
   - Go to [supabase.com](https://supabase.com) and create a project
   - Copy your project URL and anon key
   - Add them to `.env`:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

### Applying Supabase Migration

If you're using Supabase:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/0001_novatok_music.sql`
4. Paste and run the SQL to create tables and seed data

Or using Supabase CLI:
```bash
supabase db push
```

## Guest Mode

The app works fully without Supabase configuration! In Guest Mode:

- Track data is loaded from local JSON seed data
- Liked songs are stored in localStorage
- Recent plays are stored in localStorage
- All features work offline

When you add Supabase credentials, the app automatically switches to cloud sync without any code changes.

## Project Structure

```
app/
├── app/
│   ├── layout.js          # Root layout with player provider
│   ├── page.js            # Redirects to /music
│   └── music/
│       ├── layout.js      # Music layout with header/tabs
│       ├── page.js        # Discover/Trending/Liked/Recent
│       ├── track/[id]/    # Track detail page
│       ├── artist/[id]/   # Artist page
│       ├── album/[id]/    # Album page
│       ├── library/       # User library
│       ├── lyrics/        # Lyrics viewer
│       ├── karaoke/       # Karaoke mode
│       └── ai-studio/     # AI features (coming soon)
├── components/
│   ├── player/           # Global player components
│   ├── ui/               # shadcn components
│   ├── TrackCard.jsx     # Track card component
│   ├── SearchBar.jsx     # Search with dropdown
│   └── TabsNav.jsx       # Navigation tabs
├── lib/
│   ├── context/          # React contexts
│   ├── data/             # Data service & seed data
│   ├── supabase/         # Supabase client
│   └── env.js            # Environment validation
└── supabase/
    └── migrations/       # Database migrations
```

## Global Player

The player is implemented as a global React context that:
- Persists across all route changes (never unmounts)
- Saves state to localStorage (queue, position, volume)
- Gracefully handles audio errors with toast notifications
- Supports queue management, shuffle, and repeat modes

## Testing

NovaTok Music includes comprehensive E2E tests using Playwright.

### Test Scripts

```bash
# Run all E2E tests (headless)
yarn test:e2e

# Run tests with UI mode (for debugging)
yarn test:e2e:ui

# Run tests in headed browser
yarn test:e2e:headed

# Run full CI test suite (lint + e2e)
yarn test
```

### Test Coverage

The test suite covers critical Guest Mode flows:

| Test File | Coverage |
|-----------|----------|
| `music-discover.spec.js` | Track grid loads, tabs work, cards have required elements |
| `player.spec.js` | Play starts, player persists across navigation, state saves to localStorage |
| `likes-recents.spec.js` | Like persists, shows in Liked tab, recent plays recorded |
| `search.spec.js` | Search returns results, click plays track, clear works |
| `pages.spec.js` | All routes render without errors (/track, /artist, /album, /library, /lyrics, /karaoke) |
| `audio-errors.spec.js` | Tracks with null audio_url show toast, app doesn't crash |

### Running Tests in CI

The tests are designed to be CI-friendly:
- Uses headless Chromium
- Auto-starts dev server via `webServer` config
- Does not rely on external MP3 availability
- Tests localStorage persistence (Guest Mode)

Example GitHub Actions workflow:
```yaml
- name: Run tests
  run: |
    yarn install
    yarn test:e2e
```

### Test Configuration

See `playwright.config.js` for configuration options:
- Base URL: `http://localhost:3000`
- Browser: Chromium only (for speed)
- Retries: 2 on CI, 0 locally
- Screenshots: On failure only

## License

MIT
