import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setLatencyMultiplier } from '@/services/latency';

export type UiMode = 'desktop' | 'tv';
export type Theme = 'cinematic' | 'midnight' | 'oled';

export const ACCENTS = [
  { id: 'violet', label: 'Violet', value: '#7c5cff' },
  { id: 'azure', label: 'Azure', value: '#3b82f6' },
  { id: 'teal', label: 'Teal', value: '#18b3a5' },
  { id: 'rose', label: 'Rose', value: '#ff4d7d' },
  { id: 'amber', label: 'Amber', value: '#ffb020' },
  { id: 'lime', label: 'Lime', value: '#7ed957' },
] as const;

export interface Settings {
  mode: UiMode;
  theme: Theme;
  accent: string;
  density: 'comfortable' | 'compact';
  // account
  displayName: string;
  // playback
  autoplayNext: boolean;
  autoplayPreviews: boolean;
  videoQuality: 'Auto' | '4K' | '1080p' | '720p';
  defaultAudio: string;
  defaultSubtitles: string;
  skipIntros: boolean;
  // subtitles
  subtitleSize: 'Small' | 'Medium' | 'Large';
  subtitleBackground: boolean;
  subtitleColor: 'White' | 'Yellow' | 'Cyan';
  // audio
  normalizeVolume: boolean;
  crossfade: number;
  audioOutput: string;
  equalizer: string;
  // privacy
  profileVisibility: 'Everyone' | 'Friends only' | 'Only me';
  activityVisibility: boolean;
  showOnlineStatus: boolean;
  // friends
  friendRequests: 'Everyone' | 'Friends of friends' | 'Nobody';
  newFriendAccess: 'No access' | 'Movies & TV Shows' | 'Everything';
  // devices
  deviceName: string;
  // dev preview
  slowLoading: boolean;
}

const DEFAULTS: Settings = {
  mode: 'desktop',
  theme: 'cinematic',
  accent: '#7c5cff',
  density: 'comfortable',
  displayName: 'Sam Rivera',
  autoplayNext: true,
  autoplayPreviews: true,
  videoQuality: 'Auto',
  defaultAudio: 'English',
  defaultSubtitles: 'Off',
  skipIntros: true,
  subtitleSize: 'Medium',
  subtitleBackground: true,
  subtitleColor: 'White',
  normalizeVolume: true,
  crossfade: 4,
  audioOutput: 'Stereo',
  equalizer: 'Flat',
  profileVisibility: 'Friends only',
  activityVisibility: true,
  showOnlineStatus: true,
  friendRequests: 'Friends of friends',
  newFriendAccess: 'No access',
  deviceName: "Sam's Desktop",
  slowLoading: false,
};

interface SettingsApi {
  settings: Settings;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  toggleMode: () => void;
}

const Ctx = createContext<SettingsApi | null>(null);

function hexToRgb(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  const update = useCallback<SettingsApi['update']>((key, value) => setSettings((s) => ({ ...s, [key]: value })), []);
  const toggleMode = useCallback(() => setSettings((s) => ({ ...s, mode: s.mode === 'tv' ? 'desktop' : 'tv' })), []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.mode = settings.mode;
    root.dataset.theme = settings.theme;
    root.dataset.density = settings.density;
    root.style.setProperty('--accent', settings.accent);
    root.style.setProperty('--accent-rgb', hexToRgb(settings.accent));
    setLatencyMultiplier(settings.slowLoading ? 6 : 1);
  }, [settings.mode, settings.theme, settings.density, settings.accent, settings.slowLoading]);

  const api = useMemo(() => ({ settings, update, toggleMode }), [settings, update, toggleMode]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useSettings(): SettingsApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSettings must be used inside <SettingsProvider>');
  return v;
}
