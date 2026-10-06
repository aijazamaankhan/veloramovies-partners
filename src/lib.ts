export function formatDuration(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
}

/** "2h 8m" / "48m" */
export function formatRuntime(totalSec: number): string {
  const m = Math.round(totalSec / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

export const sortOptions = [
  { value: 'recent', label: 'Recently Added' },
  { value: 'alpha', label: 'Alphabetical' },
  { value: 'played', label: 'Recently Played' },
  { value: 'most-played', label: 'Most Played' },
] as const;
