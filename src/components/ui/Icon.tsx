import type { SVGProps } from 'react';

/** Single-source icon set (24×24, stroke based). Add new icons here so the set stays consistent. */
const PATHS = {
  home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  film: 'M4 4h16v16H4zM8 4v16M16 4v16M4 8h4M4 12h4M4 16h4M16 8h4M16 12h4M16 16h4',
  tv: 'M3 7h18v12H3zM8 3l4 4 4-4',
  music: 'M9 18V5l11-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM20 16a3 3 0 11-6 0 3 3 0 016 0z',
  video: 'M3 6h12v12H3zM15 10l6-3v10l-6-3',
  library: 'M3 5h7v14H3zM14 5h7v6h-7zM14 15h7v4h-7z',
  users: 'M16 20v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M9.5 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM21 20v-1a4 4 0 00-3-3.8M16 4.2a3.5 3.5 0 010 6.6',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
  settings:
    'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z',
  sliders: 'M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M16 4v4M10 10v4M18 16v4',
  plus: 'M12 5v14M5 12h14',
  check: 'M4 12l5 5L20 6',
  close: 'M18 6L6 18M6 6l12 12',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  info: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 16v-5M12 8h.01',
  volume: 'M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 010 6M19 6a8 8 0 010 12',
  mute: 'M4 9v6h4l5 4V5L8 9zM17 9l5 6M22 9l-5 6',
  fullscreen: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  subtitles: 'M3 5h18v14H3zM7 12h4M13 12h4M7 15h2M12 15h5',
  globe: 'M12 22a10 10 0 100-20 10 10 0 000 20zM2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  repeat: 'M17 2l4 4-4 4M3 11V9a3 3 0 013-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 01-3 3H3',
  shuffle: 'M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5',
  heart: 'M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 000-7.8z',
  clock: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 018 0v4',
  chevronLeft: 'M15 18l-6-6 6-6',
  chevronRight: 'M9 18l6-6-6-6',
  chevronDown: 'M6 9l6 6 6-6',
  chevronUp: 'M6 15l6-6 6 6',
  arrowLeft: 'M19 12H5M12 19l-7-7 7-7',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  monitor: 'M3 4h18v12H3zM8 20h8M12 16v4',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12zM12 15a3 3 0 100-6 3 3 0 000 6z',
  eyeOff: 'M17.9 17.9A10.9 10.9 0 0112 20C5 20 1 12 1 12a18.5 18.5 0 015.1-5.9M9.9 4.2A10.9 10.9 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.2 3.2M1 1l22 22',
  alert: 'M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0zM12 9v4M12 17h.01',
  wifiOff: 'M1 1l22 22M16.7 11.1A11 11 0 0121 13.6M5 13a11 11 0 015.2-2.9M8.5 16.4a6 6 0 017 0M12 20h.01',
  ban: 'M12 22a10 10 0 100-20 10 10 0 000 20zM4.9 4.9l14.2 14.2',
  back10: 'M1 4v6h6M3.5 15a9 9 0 102.1-9.4L1 10',
  fwd10: 'M23 4v6h-6M20.5 15a9 9 0 11-2.1-9.4L23 10',
  keyboard: 'M2 6h20v12H2zM6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10',
  share: 'M18 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zM18 22a3 3 0 100-6 3 3 0 000 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
  calendar: 'M3 5h18v16H3zM8 3v4M16 3v4M3 10h18',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  sort: 'M3 6h13M3 12h9M3 18h5M17 8v12M14 17l3 3 3-3',
  disc: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 15a3 3 0 100-6 3 3 0 000 6z',
  mic: 'M12 14a3 3 0 003-3V5a3 3 0 00-6 0v6a3 3 0 003 3zM19 11a7 7 0 01-14 0M12 18v4',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z',
  logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  history: 'M3 12a9 9 0 109-9 9 9 0 00-6.7 3L3 8M3 3v5h5M12 7v5l3 2',
  folder: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  filter: 'M3 4h18l-7 8v7l-4 2v-9z',
  speaker: 'M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 010 7',
} as const;

const FILLED = new Set<IconName>(['play', 'pause', 'next', 'prev', 'star']);
const FILLED_PATHS = {
  play: 'M7 4l13 8-13 8z',
  pause: 'M6 4h4v16H6zM14 4h4v16h-4z',
  next: 'M5 4l10 8-10 8zM17 4h2v16h-2z',
  prev: 'M19 4L9 12l10 8zM5 4h2v16H5z',
  star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
} as const;

export type IconName = keyof typeof PATHS | keyof typeof FILLED_PATHS;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number | string;
}

export function Icon({ name, size = '1.25em', strokeWidth = 1.8, ...rest }: IconProps) {
  const filled = FILLED.has(name);
  const d = filled ? FILLED_PATHS[name as keyof typeof FILLED_PATHS] : PATHS[name as keyof typeof PATHS];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={d} />
    </svg>
  );
}
