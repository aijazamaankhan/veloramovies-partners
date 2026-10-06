/**
 * Procedural placeholder artwork.
 * Everything is generated in-memory as SVG data-URIs — no files, no network, safe to use.
 */

export type ArtKind = 'poster' | 'backdrop' | 'thumb' | 'square';

type Palette = [string, string, string];

const PALETTES: Palette[] = [
  ['#1b1464', '#7c5cff', '#ff7ac6'],
  ['#0b3d4a', '#18b3a5', '#f9e27d'],
  ['#3a0d2e', '#d6336c', '#ffb84d'],
  ['#10223f', '#3b82f6', '#9be7ff'],
  ['#2a1a0b', '#e8833a', '#ffe08a'],
  ['#0e2a1c', '#2fbf71', '#d4f57a'],
  ['#2b0f3a', '#a24bff', '#4de1ff'],
  ['#3b0d0d', '#ff4d4d', '#ffcf6e'],
  ['#14233a', '#4f6dff', '#ffd1f5'],
  ['#1a1a2e', '#e94560', '#f5a962'],
  ['#0f2e2e', '#3dd6c6', '#b9ff66'],
  ['#241a3a', '#8d6bff', '#ffb86b'],
];

const SIZES: Record<ArtKind, [number, number]> = {
  poster: [400, 600],
  backdrop: [1280, 720],
  thumb: [480, 270],
  square: [500, 500],
};

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n = (v: number) => Math.round(v * 10) / 10;

function mountains(w: number, h: number, r: () => number, c: Palette): string {
  let s = `<circle cx="${n(w * (0.3 + r() * 0.4))}" cy="${n(h * 0.36)}" r="${n(h * 0.15)}" fill="${c[2]}" opacity=".92"/>`;
  for (let i = 0; i < 4; i++) {
    const base = h * (0.56 + i * 0.09);
    let d = `M0 ${h} L0 ${n(base)}`;
    const steps = 7;
    for (let k = 1; k <= steps; k++) d += ` L${n((w / steps) * k)} ${n(base - r() * h * 0.17)}`;
    d += ` L${w} ${h}Z`;
    s += `<path d="${d}" fill="${i % 2 ? c[0] : c[1]}" opacity="${n(0.35 + i * 0.18)}"/>`;
  }
  return s;
}

function skyline(w: number, h: number, r: () => number, c: Palette): string {
  let s = `<rect x="0" y="${n(h * 0.45)}" width="${w}" height="${n(h * 0.1)}" fill="${c[2]}" opacity=".35"/>`;
  s += `<circle cx="${n(w * 0.7)}" cy="${n(h * 0.3)}" r="${n(h * 0.12)}" fill="${c[2]}" opacity=".85"/>`;
  const count = 14;
  const bw = w / count;
  for (let i = 0; i < count; i++) {
    const bh = h * (0.18 + r() * 0.34);
    s += `<rect x="${n(i * bw)}" y="${n(h - bh)}" width="${n(bw - 3)}" height="${n(bh)}" fill="${i % 3 ? c[0] : c[1]}" opacity="${n(0.55 + r() * 0.4)}"/>`;
  }
  return s;
}

function orbit(w: number, h: number, r: () => number, c: Palette): string {
  const cx = w * 0.5;
  const cy = h * 0.45;
  let s = `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(h * 0.1)}" fill="${c[2]}"/>`;
  for (let i = 1; i <= 5; i++) {
    const rr = h * (0.1 + i * 0.09);
    s += `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rr * 1.5)}" ry="${n(rr * 0.6)}" fill="none" stroke="${c[i % 2 ? 1 : 2]}" stroke-width="${n(h * 0.004 + 1)}" opacity="${n(0.7 - i * 0.09)}" transform="rotate(${n(-18 + r() * 8)} ${n(cx)} ${n(cy)})"/>`;
    const a = r() * Math.PI * 2;
    s += `<circle cx="${n(cx + Math.cos(a) * rr * 1.5)}" cy="${n(cy + Math.sin(a) * rr * 0.6)}" r="${n(h * 0.015 + 2)}" fill="${c[2]}"/>`;
  }
  return s;
}

function waves(w: number, h: number, r: () => number, c: Palette): string {
  let s = '';
  for (let i = 0; i < 6; i++) {
    const y = h * (0.35 + i * 0.1);
    const amp = h * (0.03 + r() * 0.06);
    let d = `M0 ${h} L0 ${n(y)}`;
    for (let k = 0; k < 4; k++) {
      d += ` Q${n(w * (k + 0.25) / 4)} ${n(y - amp)} ${n(w * (k + 0.5) / 4)} ${n(y)} T${n(w * (k + 1) / 4)} ${n(y)}`;
    }
    d += ` L${w} ${h}Z`;
    s += `<path d="${d}" fill="${i % 2 ? c[0] : c[1]}" opacity="${n(0.25 + i * 0.12)}"/>`;
  }
  s += `<circle cx="${n(w * 0.25)}" cy="${n(h * 0.25)}" r="${n(h * 0.09)}" fill="${c[2]}" opacity=".9"/>`;
  return s;
}

function beams(w: number, h: number, r: () => number, c: Palette): string {
  let s = '';
  for (let i = 0; i < 6; i++) {
    const x = r() * w;
    const bw = w * (0.08 + r() * 0.16);
    s += `<polygon points="${n(x)},0 ${n(x + bw)},0 ${n(x + bw - w * 0.4)},${h} ${n(x - w * 0.4)},${h}" fill="${c[i % 3]}" opacity="${n(0.1 + r() * 0.22)}"/>`;
  }
  s += `<circle cx="${n(w * 0.5)}" cy="${n(h * 0.42)}" r="${n(h * 0.2)}" fill="none" stroke="${c[2]}" stroke-width="${n(h * 0.01 + 1)}" opacity=".8"/>`;
  s += `<circle cx="${n(w * 0.5)}" cy="${n(h * 0.42)}" r="${n(h * 0.1)}" fill="${c[2]}" opacity=".85"/>`;
  return s;
}

const SCENES = [mountains, skyline, orbit, waves, beams];

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wrapTitle(title: string, max: number): string[] {
  const words = title.toUpperCase().split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const word of words) {
    if ((cur + ' ' + word).trim().length > max && cur) {
      lines.push(cur);
      cur = word;
    } else cur = (cur + ' ' + word).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4);
}

export interface ArtOptions {
  /** Draw the title onto the artwork (posters and covers). */
  label?: boolean;
  /** Force a scene/palette variant. */
  variant?: number;
}

/** Build a deterministic placeholder image for any `seed`. */
export function makeArt(kind: ArtKind, seed: string, title: string, opts: ArtOptions = {}): string {
  const h0 = hash(seed);
  const palette = PALETTES[(opts.variant ?? h0) % PALETTES.length];
  const scene = SCENES[(h0 >>> 5) % SCENES.length];
  const [w, h] = SIZES[kind];
  const r = rng(h0 ^ 0x9e3779b9);
  const label = opts.label ?? (kind === 'poster' || kind === 'square');

  let text = '';
  if (label) {
    const size = kind === 'poster' ? 46 : 42;
    const lines = wrapTitle(title, kind === 'poster' ? 11 : 13);
    const startY = h - 40 - (lines.length - 1) * (size + 4);
    text =
      `<rect x="0" y="${n(h * 0.55)}" width="${w}" height="${n(h * 0.45)}" fill="url(#shade)"/>` +
      lines
        .map(
          (l, i) =>
            `<text x="${kind === 'poster' ? 28 : 26}" y="${n(startY + i * (size + 4))}" font-family="Inter,Helvetica,Arial,sans-serif" font-weight="800" font-size="${size}" letter-spacing="1" fill="#fff" fill-opacity=".96">${esc(l)}</text>`,
        )
        .join('');
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">` +
    `<defs>` +
    `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${palette[1]}"/><stop offset="1" stop-color="${palette[0]}"/></linearGradient>` +
    `<radialGradient id="glow" cx="${n(0.2 + r() * 0.6)}" cy="${n(0.2 + r() * 0.3)}" r=".8"><stop offset="0" stop-color="${palette[2]}" stop-opacity=".55"/><stop offset="1" stop-color="${palette[2]}" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".78"/></linearGradient>` +
    `</defs>` +
    `<rect width="${w}" height="${h}" fill="url(#bg)"/>` +
    `<rect width="${w}" height="${h}" fill="url(#glow)"/>` +
    scene(w, h, r, palette) +
    text +
    `</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
