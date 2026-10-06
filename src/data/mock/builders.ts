import type { AudioTrack, AvatarSpec, ID, ISODate, SubtitleTrack } from '@/models';

/** The signed-in (mock) user. Anything with this owner is "mine". */
export const ME: ID = 'me';

/** Fixed "now" so mock data is deterministic between runs. */
export const MOCK_NOW = Date.parse('2026-10-06T12:00:00Z');

export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const daysAgo = (days: number): ISODate => new Date(MOCK_NOW - days * 86_400_000).toISOString();

export function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic usage stats so "Recently played" / "Most played" sorting has something to chew on. */
export function usage(id: string): { playCount: number; lastPlayedAt: ISODate | null } {
  const h = hash(id);
  const playCount = h % 4 === 0 ? 0 : (h >>> 3) % 14;
  return { playCount, lastPlayedAt: playCount === 0 ? null : daysAgo((h >>> 7) % 45) };
}

export function pick<T>(list: readonly T[], seed: string, count: number): T[] {
  const out: T[] = [];
  let h = hash(seed);
  const pool = [...list];
  while (out.length < count && pool.length) {
    out.push(pool.splice(h % pool.length, 1)[0]);
    h = Math.imul(h ^ (h >>> 13), 0x5bd1e995) >>> 0;
  }
  return out;
}

export function audioTracks(id: string): AudioTrack[] {
  const base: AudioTrack[] = [{ id: 'aud-en', language: 'English', label: 'English · 5.1' }];
  const extra: AudioTrack[] = [
    { id: 'aud-es', language: 'Spanish', label: 'Spanish · Stereo' },
    { id: 'aud-fr', language: 'French', label: 'French · Stereo' },
    { id: 'aud-ja', language: 'Japanese', label: 'Japanese · Stereo' },
    { id: 'aud-en-d', language: 'English', label: 'English · Descriptive' },
  ];
  return [...base, ...pick(extra, id, 1 + (hash(id) % 3))];
}

export function subtitleTracks(id: string): SubtitleTrack[] {
  const all: SubtitleTrack[] = [
    { id: 'sub-en', language: 'English', label: 'English' },
    { id: 'sub-es', language: 'Spanish', label: 'Spanish' },
    { id: 'sub-fr', language: 'French', label: 'French' },
    { id: 'sub-de', language: 'German', label: 'German' },
    { id: 'sub-pt', language: 'Portuguese', label: 'Portuguese' },
  ];
  return [all[0], ...pick(all.slice(1), id + 's', 1 + (hash(id) % 4))];
}

export const avatar = (initials: string, a: string, b: string): AvatarSpec => ({ initials, colors: [a, b] });

const CAST = [
  'Mara Ellison', 'Jonah Whitfield', 'Rin Takahashi', 'Camila Duarte', 'Elias Brandt', 'Noor Haddad',
  'Theo Lindqvist', 'Zara Okonkwo', 'Felix Moreau', 'Imani Brooks', 'Lucas Ferreira', 'Sunita Rao',
  'Callum Reid', 'Odessa Park', 'Mateo Vargas', 'Hana Kobayashi',
];
export const castFor = (id: string) => pick(CAST, id, 4);
