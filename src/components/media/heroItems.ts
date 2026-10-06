import type { Movie, TVShow, Video } from '@/models';
import { formatRuntime, plural } from '@/lib';
import { friendById, isMine } from '@/data/access';
import { detailPath } from '@/routes';
import type { HeroItem } from './HeroBanner';

const owner = (ownerId: string) => (isMine(ownerId) ? undefined : friendById(ownerId)?.name);

export function heroFromMovie(m: Movie, onPlay: () => void, eyebrow?: string): HeroItem {
  return {
    id: m.id,
    eyebrow,
    title: m.title,
    description: m.description,
    backdrop: m.artwork.backdrop!,
    meta: [String(m.year), formatRuntime(m.durationSec), m.contentRating],
    genres: m.genres,
    quality: m.hdr ? [m.resolution, 'HDR'] : [m.resolution],
    score: m.score,
    sharedBy: owner(m.ownerId),
    detailsTo: detailPath(m),
    onPlay,
  };
}

export function heroFromShow(s: TVShow, onPlay: () => void, eyebrow?: string): HeroItem {
  return {
    id: s.id,
    eyebrow,
    title: s.title,
    description: s.description,
    backdrop: s.artwork.backdrop!,
    meta: [String(s.year), plural(s.seasons.length, 'Season'), s.contentRating],
    genres: s.genres,
    quality: [s.resolution],
    score: s.score,
    sharedBy: owner(s.ownerId),
    detailsTo: detailPath(s),
    onPlay,
  };
}

export function heroFromVideo(v: Video, onPlay: () => void, eyebrow?: string): HeroItem {
  return {
    id: v.id,
    eyebrow,
    title: v.title,
    description: v.description,
    backdrop: v.artwork.backdrop!,
    meta: [v.category, String(v.year), formatRuntime(v.durationSec)],
    genres: [],
    quality: [v.resolution],
    sharedBy: owner(v.ownerId),
    detailsTo: detailPath(v),
    onPlay,
  };
}
