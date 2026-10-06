import type {
  Album, AnyMedia, AnyPlayable, Artist, Episode, Friend, ID, LibraryFilter, Movie, Playlist, ProfileActivity, ShareCategory,
  SortKey, Song, TVShow, Video, WatchProgress,
} from '@/models';
import { db } from './mock';
import { canBrowse, categoryOf, friendById, isMine } from './access';

/**
 * Pure, synchronous queries over the mock database.
 * Every query that returns media applies the access check, so a UI built on these
 * can never display something the viewer is not permitted to browse.
 */

const index = new Map<ID, AnyMedia>();
[...db.movies, ...db.shows, ...db.episodes, ...db.albums, ...db.songs, ...db.videos].forEach((m) => index.set(m.id, m));

export const getMedia = (id: ID): AnyMedia | undefined => index.get(id);
export const getMovie = (id: ID) => db.movies.find((m) => m.id === id);
export const getShow = (id: ID) => db.shows.find((s) => s.id === id);
export const getEpisode = (id: ID) => db.episodes.find((e) => e.id === id);
export const getAlbum = (id: ID) => db.albums.find((a) => a.id === id);
export const getSong = (id: ID) => db.songs.find((s) => s.id === id);
export const getArtist = (id: ID) => db.artists.find((a) => a.id === id);
export const getPlaylist = (id: ID) => db.playlists.find((p) => p.id === id);
export const getVideo = (id: ID) => db.videos.find((v) => v.id === id);
export const getProfileActivity = (profileId: ID): ProfileActivity =>
  db.activities.find((a) => a.profileId === profileId) ?? { profileId, progress: [], favoriteIds: [], historyIds: [] };

export const getPlayable = (id: ID): AnyPlayable | undefined => {
  const m = index.get(id);
  return m && (m.kind === 'movie' || m.kind === 'episode' || m.kind === 'video') ? m : undefined;
};

export const visible = <T extends { kind: AnyMedia['kind']; ownerId: ID }>(items: T[]): T[] => items.filter(canBrowse);

export const movies = () => visible(db.movies);
export const shows = () => visible(db.shows);
export const albums = () => visible(db.albums);
export const songs = () => visible(db.songs);
export const videos = () => visible(db.videos);
export const artists = (): Artist[] => db.artists.filter((a) => albums().some((al) => al.artistId === a.id));
export const myPlaylists = (): Playlist[] => db.playlists;

export const episodesOf = (showId: ID): Episode[] => db.episodes.filter((e) => e.showId === showId).sort((a, b) => a.seasonNumber - b.seasonNumber || a.episodeNumber - b.episodeNumber);

export function neighbourEpisodes(ep: Episode): { prev?: Episode; next?: Episode } {
  const all = episodesOf(ep.showId);
  const i = all.findIndex((e) => e.id === ep.id);
  return { prev: all[i - 1], next: all[i + 1] };
}

export const songsOfAlbum = (album: Album): Song[] => album.trackIds.map((id) => getSong(id)).filter((s): s is Song => !!s);

export const sharedBy = (ownerId: ID) => ({
  movies: db.movies.filter((m) => m.ownerId === ownerId),
  shows: db.shows.filter((s) => s.ownerId === ownerId),
  albums: db.albums.filter((a) => a.ownerId === ownerId),
  videos: db.videos.filter((v) => v.ownerId === ownerId),
});

/** Cards that appear in "Continue Watching": the media plus where the viewer stopped. */
export interface ContinueItem {
  media: Movie | Episode | Video;
  progress: WatchProgress;
  show?: TVShow;
}

export function continueWatching(profileId: ID): ContinueItem[] {
  return getProfileActivity(profileId)
    .progress.map<ContinueItem | null>((progress) => {
      const media = getPlayable(progress.mediaId);
      if (!media || !canBrowse(media)) return null;
      return { media, progress, show: media.kind === 'episode' ? getShow(media.showId) : undefined };
    })
    .filter((x): x is ContinueItem => !!x && x.progress.positionSec / x.progress.durationSec < 0.95)
    .sort((a, b) => Date.parse(b.progress.updatedAt) - Date.parse(a.progress.updatedAt));
}

export function lookup(ids: ID[]): AnyMedia[] {
  return ids.map((id) => index.get(id)).filter((m): m is AnyMedia => !!m && canBrowse(m));
}

export const byRecentlyAdded = <T extends { addedAt: string }>(items: T[]) => [...items].sort((a, b) => Date.parse(b.addedAt) - Date.parse(a.addedAt));

type Sortable = { title: string; addedAt: string; playCount: number; lastPlayedAt: string | null };
export function sortItems<T extends Sortable>(items: T[], sort: SortKey): T[] {
  const copy = [...items];
  switch (sort) {
    case 'alpha':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'played':
      return copy.sort((a, b) => Date.parse(b.lastPlayedAt ?? '1970') - Date.parse(a.lastPlayedAt ?? '1970'));
    case 'most-played':
      return copy.sort((a, b) => b.playCount - a.playCount);
    default:
      return byRecentlyAdded(copy);
  }
}

export function myLibrary(filter: LibraryFilter = 'all') {
  const mine = <T extends { ownerId: ID }>(l: T[]) => l.filter((x) => isMine(x.ownerId));
  const result = {
    movies: mine(db.movies),
    shows: mine(db.shows),
    albums: mine(db.albums),
    videos: mine(db.videos),
  };
  return filter === 'all' ? result : { movies: filter === 'movies' ? result.movies : [], shows: filter === 'shows' ? result.shows : [], albums: filter === 'music' ? result.albums : [], videos: filter === 'videos' ? result.videos : [] };
}

export function genresOf(items: { genres: string[] }[]): string[] {
  return [...new Set(items.flatMap((i) => i.genres))].sort();
}

export interface SearchResults {
  movies: Movie[];
  shows: TVShow[];
  music: (Album | Song)[];
  videos: Video[];
  friends: Friend[];
}

export function search(query: string): SearchResults {
  const q = query.trim().toLowerCase();
  const empty: SearchResults = { movies: [], shows: [], music: [], videos: [], friends: [] };
  if (!q) return empty;
  const hit = (...fields: (string | undefined)[]) => fields.some((f) => f?.toLowerCase().includes(q));
  return {
    movies: movies().filter((m) => hit(m.title, m.genres.join(' '), m.director, m.cast.join(' '))),
    shows: shows().filter((s) => hit(s.title, s.genres.join(' '), s.creator)),
    music: [
      ...albums().filter((a) => hit(a.title, a.artistName, a.genres.join(' '))),
      ...songs().filter((s) => hit(s.title, s.artistName, s.albumTitle)),
    ].slice(0, 18),
    videos: videos().filter((v) => hit(v.title, v.category, v.description)),
    friends: db.friends.filter((f) => hit(f.name, `${f.name}'s library`)),
  };
}

export function categoryCount(ownerId: ID, category: ShareCategory): number {
  const s = sharedBy(ownerId);
  return { movies: s.movies, shows: s.shows, music: s.albums, videos: s.videos }[category].length;
}

export { categoryOf, friendById };
