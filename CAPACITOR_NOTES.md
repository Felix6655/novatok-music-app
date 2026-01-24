# Capacitor Integration Notes

This document outlines how to wrap NovaTok Music as a native mobile app using Capacitor.

## Prerequisites

- Node.js 18+
- Android Studio (for Android)
- Xcode (for iOS, macOS only)

## Setup Steps

### 1. Install Capacitor

```bash
yarn add @capacitor/core @capacitor/cli
yarn add @capacitor/android @capacitor/ios
npx cap init "NovaTok Music" "com.novatok.music"
```

### 2. Configure capacitor.config.json

```json
{
  "appId": "com.novatok.music",
  "appName": "NovaTok Music",
  "webDir": "out",
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#0a0a0f",
      "showSpinner": false
    }
  }
}
```

### 3. Update next.config.js for Static Export

```javascript
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
```

### 4. Build and Add Platforms

```bash
# Build static export
yarn build

# Add platforms
npx cap add android
npx cap add ios

# Sync web assets
npx cap sync
```

### 5. Open in IDE

```bash
# Android
npx cap open android

# iOS
npx cap open ios
```

## App-Specific Considerations

### Audio Playback

- The HTML5 Audio API works well in Capacitor WebView
- For background audio, consider adding `@capacitor-community/background-music` plugin
- Test audio playback on both platforms

### Navigation

- All internal links use Next.js routing (no `window.open`)
- Back navigation works with browser history
- Consider adding `@capacitor/app` for handling back button on Android

### Offline Support

- Guest mode works offline with localStorage
- Consider adding service worker for asset caching
- Audio files would need to be cached for true offline playback

### Status Bar & Safe Areas

```bash
yarn add @capacitor/status-bar
```

```javascript
import { StatusBar, Style } from '@capacitor/status-bar';

// Dark theme compatible
await StatusBar.setStyle({ style: Style.Dark });
await StatusBar.setBackgroundColor({ color: '#0a0a0f' });
```

### Bottom Safe Area

The mini-player is already positioned with `fixed bottom-0`. For iOS notch devices:

```css
.mini-player {
  padding-bottom: env(safe-area-inset-bottom);
}
```

## Recommended Plugins

```bash
# Core functionality
yarn add @capacitor/app          # App state, back button
yarn add @capacitor/status-bar   # Status bar control
yarn add @capacitor/splash-screen # Splash screen
yarn add @capacitor/haptics      # Haptic feedback

# Optional enhancements
yarn add @capacitor/share        # Native share sheet
yarn add @capacitor/filesystem   # File access for audio caching
```

## Build Commands

```bash
# Development cycle
yarn build && npx cap sync && npx cap run android

# Production builds
npx cap build android --release
npx cap build ios --release
```

## Testing

1. Test audio playback (play, pause, seek)
2. Test queue persistence after app restart
3. Test navigation between all routes
4. Test search functionality
5. Test like/recent localStorage persistence
6. Test lyrics sync with playback
7. Test karaoke timing mode

## Known Issues & Solutions

### Audio Autoplay

Browsers/WebViews may block autoplay. The app handles this by:
- Requiring user interaction before first play
- Catching play() promise rejections gracefully

### Keyboard Input (Karaoke)

The karaoke timing mode uses keyboard events which work in WebView.
Consider adding touch-based timing as an alternative.

### Deep Linking

To support deep links (e.g., `novatok://track/123`):

```bash
yarn add @capacitor/app
```

Configure URL schemes in native projects and handle in app.
