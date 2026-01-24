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
      const nextIndex = state.shuffle 
        ? Math.floor(Math.random() * state.queue.length)
        : (state.queueIndex + 1) % state.queue.length;
      return {
        ...state,
        queueIndex: nextIndex,
        currentTrack: state.queue[nextIndex] || null,
        currentTime: 0,
        isPlaying: state.queue.length > 0,
        isLoading: state.queue.length > 0,
      };
    case 'PREV_TRACK':
      const prevIndex = state.queueIndex > 0 
        ? state.queueIndex - 1 
        : state.queue.length - 1;
      return {
        ...state,
        queueIndex: prevIndex,
        currentTrack: state.queue[prevIndex] || null,
        currentTime: 0,
        isPlaying: state.queue.length > 0,
        isLoading: state.queue.length > 0,
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
      };
    default:
      return state;
  }
}

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const audioRef = useRef(null);
  const hasRestoredRef = useRef(false);

  // Restore state from localStorage on mount
  useEffect(() => {
    if (hasRestoredRef.current) return;
    hasRestoredRef.current = true;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'RESTORE_STATE', payload: parsed });
      }
    } catch (e) {
      console.error('Failed to restore player state:', e);
    }
  }, []);

  // Save state to localStorage on changes
  useEffect(() => {
    const toSave = {
      currentTrack: state.currentTrack,
      queue: state.queue,
      queueIndex: state.queueIndex,
      volume: state.volume,
      currentTime: state.currentTime,
      repeat: state.repeat,
      shuffle: state.shuffle,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [state.currentTrack, state.queue, state.queueIndex, state.volume, state.currentTime, state.repeat, state.shuffle]);

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
    };

    const handleEnded = () => {
      if (state.repeat === 'one') {
        audio.currentTime = 0;
        audio.play();
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
        description: 'This track cannot be played. Skipping...',
      });
      // Auto-skip after delay if there are more tracks
      if (state.queue.length > 1) {
        setTimeout(() => dispatch({ type: 'NEXT_TRACK' }), 2000);
      }
    };

    const handleCanPlay = () => {
      dispatch({ type: 'SET_LOADING', payload: false });
      if (state.isPlaying) {
        audio.play().catch(() => {});
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [state.isPlaying, state.repeat, state.queue.length]);

  // Sync audio element with state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.currentTrack?.audio_url) {
      if (audio.src !== state.currentTrack.audio_url) {
        audio.src = state.currentTrack.audio_url;
        audio.load();
        // Record as recent play
        addToRecent(state.currentTrack.id);
        incrementPlayCount(state.currentTrack.id);
      }
    } else if (state.currentTrack) {
      // Track has no audio URL
      dispatch({ type: 'SET_ERROR', payload: 'Audio unavailable' });
      toast.error('Audio unavailable', {
        description: 'This track has no audio file.',
      });
    }
  }, [state.currentTrack]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack?.audio_url) return;

    if (state.isPlaying) {
      audio.play().catch((e) => {
        console.error('Play failed:', e);
        dispatch({ type: 'PAUSE' });
      });
    } else {
      audio.pause();
    }
  }, [state.isPlaying, state.currentTrack]);

  // Handle volume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = state.isMuted ? 0 : state.volume;
  }, [state.volume, state.isMuted]);

  // Actions
  const playTrack = useCallback((track, queue = null, index = 0) => {
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
  const previous = useCallback(() => dispatch({ type: 'PREV_TRACK' }), []);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      dispatch({ type: 'SET_TIME', payload: time });
    }
  }, []);

  const setVolume = useCallback((vol) => {
    dispatch({ type: 'SET_VOLUME', payload: vol });
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
      <audio ref={audioRef} preload="metadata" />
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
