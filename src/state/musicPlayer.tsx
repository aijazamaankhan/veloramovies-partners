import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { Song } from '@/models';
import { db } from '@/data/mock';

export type RepeatMode = 'off' | 'all' | 'one';

interface State {
  queue: Song[];
  index: number;
  playing: boolean;
  position: number;
  volume: number;
  muted: boolean;
  repeat: RepeatMode;
  shuffle: boolean;
}

type Action =
  | { type: 'play'; queue: Song[]; index: number }
  | { type: 'toggle' }
  | { type: 'pause' }
  | { type: 'tick'; dt: number }
  | { type: 'next'; auto?: boolean }
  | { type: 'prev' }
  | { type: 'seek'; position: number }
  | { type: 'volume'; volume: number }
  | { type: 'mute' }
  | { type: 'repeat' }
  | { type: 'shuffle' }
  | { type: 'jump'; index: number }
  | { type: 'enqueue'; song: Song; next: boolean }
  | { type: 'remove'; index: number }
  | { type: 'clear' };

const seedQueue = db.songs.filter((s) => s.ownerId === db.me.id).slice(0, 12);

const initial: State = { queue: seedQueue, index: 0, playing: false, position: 48, volume: 0.7, muted: false, repeat: 'off', shuffle: false };

function advance(s: State, auto: boolean): State {
  if (!s.queue.length) return s;
  if (auto && s.repeat === 'one') return { ...s, position: 0 };
  let next = s.index + 1;
  if (s.shuffle && s.queue.length > 1) {
    do next = Math.floor(Math.random() * s.queue.length);
    while (next === s.index);
  }
  if (next >= s.queue.length) {
    if (s.repeat === 'all' || !auto) next = 0;
    else return { ...s, playing: false, position: 0 };
  }
  return { ...s, index: next, position: 0 };
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'play':
      return { ...s, queue: a.queue, index: a.index, position: 0, playing: true };
    case 'toggle':
      return s.queue.length ? { ...s, playing: !s.playing } : s;
    case 'pause':
      return { ...s, playing: false };
    case 'tick': {
      const cur = s.queue[s.index];
      if (!cur) return s;
      const position = s.position + a.dt;
      return position >= cur.durationSec ? advance(s, true) : { ...s, position };
    }
    case 'next':
      return advance(s, false);
    case 'prev':
      return s.position > 3 || s.index === 0 ? { ...s, position: 0 } : { ...s, index: s.index - 1, position: 0 };
    case 'seek':
      return { ...s, position: a.position };
    case 'volume':
      return { ...s, volume: a.volume, muted: a.volume === 0 };
    case 'mute':
      return { ...s, muted: !s.muted };
    case 'repeat':
      return { ...s, repeat: s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off' };
    case 'shuffle':
      return { ...s, shuffle: !s.shuffle };
    case 'jump':
      return { ...s, index: a.index, position: 0, playing: true };
    case 'enqueue': {
      if (!s.queue.length) return { ...s, queue: [a.song], index: 0, position: 0 };
      const queue = [...s.queue];
      queue.splice(a.next ? s.index + 1 : queue.length, 0, a.song);
      return { ...s, queue };
    }
    case 'remove': {
      if (a.index === s.index) return s;
      const queue = s.queue.filter((_, i) => i !== a.index);
      return { ...s, queue, index: a.index < s.index ? s.index - 1 : s.index };
    }
    case 'clear':
      return { ...s, queue: s.queue[s.index] ? [s.queue[s.index]] : [], index: 0 };
  }
}

interface MusicPlayerApi extends State {
  current: Song | null;
  play: (songs: Song[], startIndex?: number) => void;
  toggle: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  seek: (sec: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  cycleRepeat: () => void;
  toggleShuffle: () => void;
  jumpTo: (index: number) => void;
  enqueue: (song: Song, playNext?: boolean) => void;
  removeFromQueue: (index: number) => void;
  clearUpcoming: () => void;
}

const Ctx = createContext<MusicPlayerApi | null>(null);

/**
 * Mock music playback: a timer advances the position. No audio element, no files, no network.
 */
export function MusicPlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    if (!state.playing) return;
    const id = window.setInterval(() => dispatch({ type: 'tick', dt: 0.5 }), 500);
    return () => window.clearInterval(id);
  }, [state.playing]);

  const play = useCallback((songs: Song[], startIndex = 0) => songs.length && dispatch({ type: 'play', queue: songs, index: startIndex }), []);

  const api = useMemo<MusicPlayerApi>(
    () => ({
      ...state,
      current: state.queue[state.index] ?? null,
      play: (songs, startIndex) => void play(songs, startIndex),
      toggle: () => dispatch({ type: 'toggle' }),
      pause: () => dispatch({ type: 'pause' }),
      next: () => dispatch({ type: 'next' }),
      prev: () => dispatch({ type: 'prev' }),
      seek: (position) => dispatch({ type: 'seek', position }),
      setVolume: (volume) => dispatch({ type: 'volume', volume }),
      toggleMute: () => dispatch({ type: 'mute' }),
      cycleRepeat: () => dispatch({ type: 'repeat' }),
      toggleShuffle: () => dispatch({ type: 'shuffle' }),
      jumpTo: (index) => dispatch({ type: 'jump', index }),
      enqueue: (song, next = false) => dispatch({ type: 'enqueue', song, next }),
      removeFromQueue: (index) => dispatch({ type: 'remove', index }),
      clearUpcoming: () => dispatch({ type: 'clear' }),
    }),
    [state, play],
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useMusicPlayer(): MusicPlayerApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useMusicPlayer must be used inside <MusicPlayerProvider>');
  return v;
}
