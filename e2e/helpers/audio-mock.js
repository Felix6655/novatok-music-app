// Audio mocking utilities for Playwright tests
// This allows us to test audio player functionality without relying on external MP3 files

/**
 * Injects audio mock into the page to simulate audio playback
 * @param {import('@playwright/test').Page} page 
 */
export async function mockAudioPlayback(page) {
  await page.addInitScript(() => {
    // Store original Audio constructor
    const OriginalAudio = window.HTMLAudioElement;
    
    // Mock Audio element behavior
    class MockAudio {
      constructor() {
        this._src = '';
        this._paused = true;
        this._currentTime = 0;
        this._duration = 180; // 3 minutes default
        this._volume = 1;
        this._muted = false;
        this._listeners = {};
        this._playable = true;
        this._preload = 'metadata';
        
        // Simulate time updates
        this._timeInterval = null;
      }
      
      get src() { return this._src; }
      set src(value) { 
        this._src = value;
        this._currentTime = 0;
        
        // Check if this is a "bad" URL that should fail
        if (value && (value.includes('fail') || value.includes('invalid') || !value)) {
          this._playable = false;
        } else {
          this._playable = true;
        }
      }
      
      get paused() { return this._paused; }
      get currentTime() { return this._currentTime; }
      set currentTime(value) { 
        this._currentTime = Math.max(0, Math.min(value, this._duration));
        this._emit('timeupdate');
      }
      
      get duration() { return this._duration; }
      get volume() { return this._volume; }
      set volume(value) { this._volume = Math.max(0, Math.min(1, value)); }
      
      get muted() { return this._muted; }
      set muted(value) { this._muted = value; }
      
      get preload() { return this._preload; }
      set preload(value) { this._preload = value; }
      
      addEventListener(event, callback) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(callback);
      }
      
      removeEventListener(event, callback) {
        if (this._listeners[event]) {
          this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
        }
      }
      
      _emit(event, data) {
        if (this._listeners[event]) {
          this._listeners[event].forEach(cb => cb(data || { target: this }));
        }
      }
      
      load() {
        // Simulate loading
        setTimeout(() => {
          if (this._playable && this._src) {
            this._duration = 180 + Math.random() * 60; // Random duration 180-240s
            this._emit('loadedmetadata');
            this._emit('canplay');
          } else if (this._src) {
            this._emit('error', { target: this, error: new Error('Audio load failed') });
          }
        }, 50);
      }
      
      play() {
        return new Promise((resolve, reject) => {
          if (!this._playable || !this._src) {
            this._emit('error', { target: this, error: new Error('Audio unavailable') });
            reject(new Error('Audio unavailable'));
            return;
          }
          
          this._paused = false;
          
          // Simulate time progression
          if (this._timeInterval) clearInterval(this._timeInterval);
          this._timeInterval = setInterval(() => {
            if (!this._paused) {
              this._currentTime += 0.25;
              this._emit('timeupdate');
              
              if (this._currentTime >= this._duration) {
                this._currentTime = this._duration;
                this._paused = true;
                clearInterval(this._timeInterval);
                this._emit('ended');
              }
            }
          }, 250);
          
          resolve();
        });
      }
      
      pause() {
        this._paused = true;
        if (this._timeInterval) {
          clearInterval(this._timeInterval);
        }
      }
    }
    
    // Replace the audio element prototype methods on existing audio elements
    window.__mockAudio = MockAudio;
    window.__audioMockEnabled = true;
  });
}

/**
 * Forces an audio error for testing error handling
 * @param {import('@playwright/test').Page} page 
 */
export async function forceAudioError(page) {
  await page.evaluate(() => {
    // Find the audio element and dispatch an error
    const audio = document.querySelector('audio');
    if (audio) {
      const errorEvent = new Event('error');
      audio.dispatchEvent(errorEvent);
    }
  });
}

/**
 * Gets the current player state from the page
 * @param {import('@playwright/test').Page} page 
 */
export async function getPlayerState(page) {
  return await page.evaluate(() => {
    const stored = localStorage.getItem('novatok_player_state');
    return stored ? JSON.parse(stored) : null;
  });
}

/**
 * Clears all localStorage data for clean test state
 * @param {import('@playwright/test').Page} page 
 */
export async function clearStorage(page) {
  await page.evaluate(() => {
    localStorage.clear();
  });
}
