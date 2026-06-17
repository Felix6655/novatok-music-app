'use client';

import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { addToRecent, incrementPlayCount } from '@/lib/data/data-service';

const PlayerContext = createContext(null);

const STORAGE_KEY = 'novatok_player_state';

const initialState = {
  currentTrack: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  volume: 0.7,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  isLoading: false,
  error: null,
  isExpanded: false,
  repeat: 'off', // 'off', 'all', 'one'
  shuffle: false,
  hasRestored: false,
};

function playerReducer(state, action) {
  switch (action.type) {
    case 'SET_TRACK':
      return {
        ...state,
        currentTrack: action.payload,
        isPlaying: true,
        currentTime: 0,
        duration: action.payload?.duration_sec || 0,
        error: null,
        isLoading: true,
      };
    case 'SET_QUEUE':
      return {
        ...state,
        queue: action.payload.queue,
        queueIndex: action.payload.index || 0,
      };
    case 'PLAY':
      return { ...state, isPlaying: true };
    case 'PAUSE':
      return { ...state, isPlaying: false };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload, isMuted: action.payload === 0 };
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };
    case 'SET_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isPlaying: false, isLoading: false };
    case 'TOGGLE_EXPANDED':
      return { ...state, isExpanded: !state.isExpanded };
    case 'SET_EXPANDED':
      return { ...state, isExpanded: action.payload };
    case 'SET_REPEAT':
      return { ...state, repeat: action.payload };
    case 'TOGGLE_SHUFFLE':
      return { ...state, shuffle: !state.shuffle };
    case 'NEXT_TRACK':
      if (state.queue.length === 0) return state;
      const nextIndex = state.shuffle 
        ? Math.floor(Math.random() * state.queue.length)
        : (state.queueIndex + 1) % state.queue.length;
      return {
        ...state,
        queueIndex: nextIndex,
        currentTrack: state.queue[nextIndex] || null,
        currentTime: 0,
        isPlaying: true,
        isLoading: true,
      };
    case 'PREV_TRACK':
      if (state.queue.length === 0) return state;
      const prevIndex = state.queueIndex > 0 
        ? state.queueIndex - 1 
        : state.queue.length - 1;
      return {
        ...state,
        queueIndex: prevIndex,
        currentTrack: state.queue[prevIndex] || null,
        currentTime: 0,
        isPlaying: true,
        isLoading: true,
      };
    case 'ADD_TO_QUEUE':
      return {
        ...state,
        queue: [...state.queue, action.payload],
      };
    case 'REMOVE_FROM_QUEUE':
      const newQueue = state.queue.filter((_, i) => i !== action.payload);
      let newIndex = state.queueIndex;
      if (action.payload < state.queueIndex) newIndex--;
      if (action.payload === state.queueIndex && newIndex >= newQueue.length) {
        newIndex = Math.max(0, newQueue.length - 1);
      }
      return {
        ...state,
        queue: newQueue,
        queueIndex: newIndex,
        currentTrack: newQueue[newIndex] || null,
      };
    case 'CLEAR_QUEUE':
      return {
        ...state,
        queue: [],
        queueIndex: 0,
        currentTrack: null,
        isPlaying: false,
      };
    case 'RESTORE_STATE':
      return {
        ...state,
        ...action.payload,
        isPlaying: false, // Don't auto-play on restore
        isLoading: false,
        hasRestored: true,
      };
    case 'MARK_RESTORED':
      return { ...state, hasRestored: true };
    default:
      return state;
  }
}

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const audioRef = useRef(null);
  const hasInitializedRef = useRef(false);
  const lastSrcRef = useRef(null);
  const lastTrackIdRef = useRef(null);
  const playAttemptRef = useRef(null);

  // Create audio element once
  useEffect(() => {
    if (!audioRef.current && typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  // Restore state from localStorage on mount
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate the restored state
        if (parsed.currentTrack && parsed.queue) {
          dispatch({ type: 'RESTORE_STATE', payload: parsed });
        } else {
          dispatch({ type: 'MARK_RESTORED' });
        }
      } else {
        dispatch({ type: 'MARK_RESTORED' });
      }
    } catch (e) {
      console.error('Failed to restore player state:', e);
      dispatch({ type: 'MARK_RESTORED' });
    }
  }, []);

  // Save state to localStorage on changes (debounced for currentTime)
  useEffect(() => {
    if (!state.hasRestored) return;
    
    const toSave = {
      currentTrack: state.currentTrack,
      queue: state.queue,
      queueIndex: state.queueIndex,
      volume: state.volume,
      isMuted: state.isMuted,
      currentTime: state.currentTime,
      repeat: state.repeat,
      shuffle: state.shuffle,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [state.currentTrack, state.queue, state.queueIndex, state.volume, state.isMuted, state.repeat, state.shuffle, state.hasRestored]);

  // Save currentTime less frequently
  useEffect(() => {
    if (!state.hasRestored || !state.currentTrack) return;
    const saveTimeout = setTimeout(() => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.currentTime = state.currentTime;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    }, 1000);
    return () => clearTimeout(saveTimeout);
  }, [state.currentTime, state.hasRestored, state.currentTrack]);

  // Audio element event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      dispatch({ type: 'SET_TIME', payload: audio.currentTime });
    };

    const handleLoadedMetadata = () => {
      dispatch({ type: 'SET_DURATION', payload: audio.duration });
      dispatch({ type: 'SET_LOADING', payload: false });
      // Restore saved position if we have one
      if (state.currentTime > 0 && audio.currentTime === 0) {
        audio.currentTime = state.currentTime;
      }
    };

    const handleEnded = () => {
      if (state.repeat === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else if (state.queue.length > 1 || state.repeat === 'all') {
        dispatch({ type: 'NEXT_TRACK' });
      } else {
        dispatch({ type: 'PAUSE' });
      }
    };

    const handleError = (e) => {
      console.error('Audio error:', e);
      dispatch({ type: 'SET_ERROR', payload: 'Audio unavailable' });
      toast.error('Audio unavailable', {
        description: 'This track cannot be played.',
      });
    };

    const handleCanPlay = () => {
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    const handleWaiting = () => {
      dispatch({ type: 'SET_LOADING', payload: true });
    };

    const handlePlaying = () => {
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
    };
  }, [state.repeat, state.queue.length, state.currentTime]);

  // Sync audio source with current track
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;

    const audioUrl = state.currentTrack.audio_url;
    
    if (!audioUrl) {
      dispatch({ type: 'SET_ERROR', payload: 'Audio unavailable' });
      toast.error('Audio unavailable', {
        description: 'This track has no audio file.',
      });
      return;
    }

    // Reload whenever the track itself changes, even if two different tracks
    // happen to share the same underlying audio file - otherwise playback
    // resumes from the previous track's leftover position (which can be at
    // or near the end, making the "new" track appear to play silently).
    if (lastSrcRef.current !== audioUrl || lastTrackIdRef.current !== state.currentTrack.id) {
      lastSrcRef.current = audioUrl;
      lastTrackIdRef.current = state.currentTrack.id;
      audio.src = audioUrl;
      audio.load();

      // Record as recent play
      addToRecent(state.currentTrack.id);
      incrementPlayCount(state.currentTrack.id);
    }
  }, [state.currentTrack]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack?.audio_url) return;

    // Cancel any pending play attempts
    if (playAttemptRef.current) {
      clearTimeout(playAttemptRef.current);
    }

    if (state.isPlaying) {
      playAttemptRef.current = setTimeout(() => {
        audio.play().catch((e) => {
          console.error('Play failed:', e);
          // Only pause if it's an actual error, not a premature abort
          if (e.name !== 'AbortError') {
            dispatch({ type: 'PAUSE' });
          }
        });
      }, 50);
    } else {
      audio.pause();
    }

    return () => {
      if (playAttemptRef.current) {
        clearTimeout(playAttemptRef.current);
      }
    };
  }, [state.isPlaying, state.currentTrack]);

  // Handle volume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = state.isMuted ? 0 : state.volume;
  }, [state.volume, state.isMuted]);

  // Actions
  const playTrack = useCallback((track, queue = null, index = 0) => {
    if (!track) return;
    
    if (queue) {
      dispatch({ type: 'SET_QUEUE', payload: { queue, index } });
    } else {
      dispatch({ type: 'SET_QUEUE', payload: { queue: [track], index: 0 } });
    }
    dispatch({ type: 'SET_TRACK', payload: track });
  }, []);

  const play = useCallback(() => dispatch({ type: 'PLAY' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const togglePlay = useCallback(() => {
    dispatch({ type: state.isPlaying ? 'PAUSE' : 'PLAY' });
  }, [state.isPlaying]);

  const next = useCallback(() => dispatch({ type: 'NEXT_TRACK' }), []);
  const previous = useCallback(() => {
    const audio = audioRef.current;
    // If more than 3 seconds in, restart the track
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      dispatch({ type: 'SET_TIME', payload: 0 });
    } else {
      dispatch({ type: 'PREV_TRACK' });
    }
  }, []);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (audio && !isNaN(time)) {
      audio.currentTime = time;
      dispatch({ type: 'SET_TIME', payload: time });
    }
  }, []);

  const setVolume = useCallback((vol) => {
    dispatch({ type: 'SET_VOLUME', payload: Math.max(0, Math.min(1, vol)) });
  }, []);

  const toggleMute = useCallback(() => dispatch({ type: 'TOGGLE_MUTE' }), []);

  const addToQueue = useCallback((track) => {
    dispatch({ type: 'ADD_TO_QUEUE', payload: track });
    toast.success('Added to queue', { description: track.title });
  }, []);

  const removeFromQueue = useCallback((index) => {
    dispatch({ type: 'REMOVE_FROM_QUEUE', payload: index });
  }, []);

  const clearQueue = useCallback(() => dispatch({ type: 'CLEAR_QUEUE' }), []);

  const toggleExpanded = useCallback(() => dispatch({ type: 'TOGGLE_EXPANDED' }), []);
  const setExpanded = useCallback((val) => dispatch({ type: 'SET_EXPANDED', payload: val }), []);

  const setRepeat = useCallback((mode) => dispatch({ type: 'SET_REPEAT', payload: mode }), []);
  const toggleShuffle = useCallback(() => dispatch({ type: 'TOGGLE_SHUFFLE' }), []);

  const value = {
    ...state,
    audioRef,
    playTrack,
    play,
    pause,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    addToQueue,
    removeFromQueue,
    clearQueue,
    toggleExpanded,
    setExpanded,
    setRepeat,
    toggleShuffle,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
