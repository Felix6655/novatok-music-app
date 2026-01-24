# NovaTok Music

A modern music streaming application built with Next.js 14, featuring a persistent global player, lyrics sync, karaoke mode, and seamless Guest/Supabase switching.

## Features

- 🎵 **Discover** - Browse the latest tracks with a beautiful responsive grid
- 📈 **Trending** - See what's popular based on play count
- ❤️ **Liked Songs** - Save your favorite tracks (persists in localStorage or Supabase)
- ⏰ **Recent Plays** - Continue where you left off
- 🎤 **Lyrics Viewer** - View and sync lyrics with LRC timestamp support
- 🎶 **Karaoke Mode** - Sing along with auto-scrolling, timed lyrics
- 🤖 **AI Studio** - Coming soon: AI-powered music creation
- 🔄 **Persistent Player** - Music never stops when navigating between pages

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide Icons
- **Database**: Supabase (PostgreSQL) with Guest Mode fallback
- **State Management**: React Context API
- **Audio**: Native HTML5 Audio API
- **Testing**: Playwright E2E tests

---

## Getting Started

### Prerequisites

- Node.js 18+ (20.x recommended)
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

### Available Scripts

| Script | Description |
|--------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Build for production |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
| `yarn typecheck` | Run type checking (JS project - passes through) |
| `yarn test:e2e` | Run Playwright E2E tests (headless) |
| `yarn test:e2e:ui` | Run tests with interactive UI |
| `yarn test:e2e:headed` | Run tests in visible browser |
| `yarn test` | Run full test suite (lint + typecheck + e2e) |

---

## Guest Mode vs Supabase Mode

### Guest Mode (Default)

The app works fully **with zero environment variables**:

- ✅ All features functional
- ✅ 20 demo tracks, 6 artists, 6 albums
- ✅ Likes and recent plays saved to localStorage
- ✅ Player state persists across sessions
- ⚠️ Data doesn't sync across devices/browsers

### Supabase Mode

When you add Supabase credentials, the app automatically switches to cloud sync:

- ✅ All Guest Mode features
- ✅ Data syncs to PostgreSQL database
- ✅ Ready for user authentication
- ✅ Data available across all devices

### How to Enable Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Add to `.env`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Apply the database migration (see below)
5. Restart the dev server

### Applying Supabase Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy contents of `supabase/migrations/0001_novatok_music.sql`
4. Run the SQL to create tables and seed data

---

## Testing

### Running Tests

```bash
# Run all E2E tests (headless)
yarn test:e2e

# Run tests with interactive UI (for debugging)
yarn test:e2e:ui

# Run tests in visible browser
yarn test:e2e:headed

# Run full CI test suite
yarn test
```

### Test Coverage

| Test Suite | Tests | Coverage |
|------------|-------|----------|
| `music-discover.spec.js` | 5 | Track grid, header, tabs, guest mode, cards |
| `player.spec.js` | 6 | Play, pause, persistence across navigation, localStorage |
| `likes-recents.spec.js` | 5 | Like/unlike, persistence, recent plays |
| `search.spec.js` | 6 | Search dropdown, results, artists, clear |
| `pages.spec.js` | 8 | All routes render without errors |
| `audio-errors.spec.js` | 3 | Error handling for missing audio |

### CI Configuration

Tests are designed to be CI-friendly:
- Uses headless Chromium
- Auto-starts dev server
- Does not rely on external MP3 availability
- Proper caching for node_modules and Playwright browsers

See `.github/workflows/ci.yml` for GitHub Actions configuration.

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import to [vercel.com/new](https://vercel.com/new)
3. Use default Next.js settings
4. Deploy

**No environment variables required** - app runs in Guest Mode by default.

See [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) for detailed instructions.

### Other Platforms

The app is a standard Next.js application and can be deployed anywhere:
- Docker
- Railway
- Render
- Self-hosted

---

## Project Structure

```
novatok-music/
├── app/
│   ├── layout.js          # Root layout with PlayerProvider
│   ├── page.js            # Redirects to /music
│   └── music/
│       ├── layout.js      # Music layout with header/tabs
│       ├── page.js        # Discover/Trending/Liked/Recent
│       ├── settings/      # Connection status page
│       ├── track/[id]/    # Track detail page
│       ├── artist/[id]/   # Artist page
│       ├── album/[id]/    # Album page
│       ├── library/       # User library
│       ├── lyrics/        # Lyrics viewer
│       ├── karaoke/       # Karaoke mode
│       └── ai-studio/     # AI features (coming soon)
├── components/
│   ├── player/            # Global player components
│   ├── ui/                # shadcn components
│   ├── TrackCard.jsx      # Track card component
│   ├── SearchBar.jsx      # Search with dropdown
│   └── TabsNav.jsx        # Navigation tabs
├── lib/
│   ├── context/           # React contexts (PlayerContext)
│   ├── data/              # Data service & seed data
│   ├── supabase/          # Supabase client
│   └── env.js             # Environment validation
├── e2e/                   # Playwright tests
├── supabase/
│   └── migrations/        # Database migrations
└── .github/
    └── workflows/         # CI configuration
```

---

## Troubleshooting

### Audio Not Playing

**Symptoms**: Tracks don't play, no sound, stuck in loading

**Solutions**:
1. Check browser console for errors
2. Some demo tracks use SoundHelix MP3s which may have CORS issues
3. Tracks with `audio_url: null` will show "Audio unavailable" toast - this is expected
4. Try a different track - some tracks are intentionally without audio for testing

### CORS Errors

**Symptoms**: Console shows CORS errors when loading audio

**Solutions**:
1. This is expected for some external MP3 URLs in demo mode
2. The app gracefully handles this with toast notifications
3. For production, use your own audio hosting with proper CORS headers

### Supabase Connection Issues

**Symptoms**: App shows Guest Mode despite setting env vars

**Solutions**:
1. Verify env vars are set correctly (check `/music/settings`)
2. Env vars must be prefixed with `NEXT_PUBLIC_` to be available client-side
3. Restart the dev server after adding env vars
4. Check Supabase dashboard for connection issues

### Playwright Browser Install Issues

**Symptoms**: Tests fail with "browser not found" errors

**Solutions**:
```bash
# Install browsers manually
npx playwright install chromium

# Install with system dependencies (Linux)
npx playwright install chromium --with-deps

# Clear cache and reinstall
rm -rf ~/.cache/ms-playwright
npx playwright install chromium
```

### Build Fails

**Symptoms**: `yarn build` fails

**Solutions**:
1. Ensure `yarn.lock` is committed
2. Use Node.js 18+ (20.x recommended)
3. Build should work with zero env vars
4. Check for TypeScript/ESLint errors

### Data Not Persisting (Guest Mode)

**Symptoms**: Likes and recent plays disappear

**Solutions**:
1. Check if localStorage is enabled/not blocked
2. Private/incognito mode may clear localStorage on close
3. Check browser storage quota (rare)

---

## License

MIT

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `yarn test`
5. Commit: `git commit -m 'Add my feature'`
6. Push: `git push origin feature/my-feature`
7. Open a Pull Request
