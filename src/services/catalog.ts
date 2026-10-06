import type { Album, AnyPlayable, Episode, Friend, ID, Library, Movie, Permission, Playlist, ShareCategory, Song, TVShow, Video } from '@/models';
import { db } from '@/data/mock';
import * as q from '@/data/queries';
import { checkBrowse, checkStream, friendById, incomingPermission, isExpired, libraryByOwner } from '@/data/access';
import { simulateLatency } from './latency';

/**
 * The only module pages call for data.
 * It is deliberately async + typed like a network client: in later phases the bodies are replaced by
 * calls to the local media engine / remote media servers and the pages do not change.
 */

export type CatalogErrorCode = 'not-found' | 'library-error' | 'owner-offline' | 'revoked';
export class CatalogError extends Error {
  constructor(public code: CatalogErrorCode, message: string) {
    super(message);
  }
}

/* ------------------------------- home ------------------------------- */

export interface FriendLibrarySummary {
  friend: Friend;
  library: Library;
  sharedCount: number;
  covers: string[];
}

export function summariseFriend(friend: Friend): FriendLibrarySummary {
  const library = libraryByOwner(friend.id)!;
  const perm = incomingPermission(friend.id);
  const allowed = (Object.keys(library.counts) as ShareCategory[]).filter((c) => perm?.status === 'active' && perm.categories[c] && !isExpired(perm));
  const sharedCount = allowed.reduce((sum, c) => sum + library.counts[c], 0);
  const s = q.sharedBy(friend.id);
  const covers = [...s.movies, ...s.shows].filter((m) => checkBrowse(m).ok).slice(0, 3).map((m) => m.artwork.poster!);
  return { friend, library, sharedCount, covers };
}

export interface HomeData {
  hero: (Movie | TVShow)[];
  continueWatching: q.ContinueItem[];
  recentlyAdded: (Movie | TVShow)[];
  recommended: Movie[];
  myMovies: Movie[];
  myShows: TVShow[];
  albums: Album[];
  friendLibraries: FriendLibrarySummary[];
  recentlyPlayed: (Album | Song)[];
}

export async function getHome(profileId: ID): Promise<HomeData> {
  await simulateLatency();
  const mine = q.myLibrary();
  const featuredIds = ['mov-orbit-of-echoes', 'show-breaking-example', 'mov-a-thousand-small-suns', 'mov-neon-meridian', 'mov-lanternfall'];
  return {
    hero: q.lookup(featuredIds) as (Movie | TVShow)[],
    continueWatching: q.continueWatching(profileId),
    recentlyAdded: q.byRecentlyAdded([...q.movies(), ...q.shows()]).slice(0, 14),
    recommended: [...q.movies()].sort((a, b) => b.score - a.score).slice(0, 12),
    myMovies: mine.movies,
    myShows: mine.shows,
    albums: mine.albums,
    friendLibraries: db.friends.map(summariseFriend),
    recentlyPlayed: [...q.albums(), ...q.songs()]
      .filter((x) => x.lastPlayedAt)
      .sort((a, b) => Date.parse(b.lastPlayedAt!) - Date.parse(a.lastPlayedAt!))
      .slice(0, 12),
  };
}

/* ------------------------------ browsing ------------------------------ */

export async function listMovies(): Promise<{ movies: Movie[]; featured: Movie[] }> {
  await simulateLatency();
  const movies = q.movies();
  return { movies, featured: q.lookup(['mov-orbit-of-echoes', 'mov-lanternfall', 'mov-iron-orchard']) as Movie[] };
}

export async function listShows(): Promise<{ shows: TVShow[]; featured: TVShow[] }> {
  await simulateLatency();
  return { shows: q.shows(), featured: q.lookup(['show-breaking-example', 'show-ashfall', 'show-kingdom-of-moss']) as TVShow[] };
}

export async function getMovieDetails(id: ID): Promise<{ movie: Movie; owner?: Friend; similar: Movie[] }> {
  await simulateLatency();
  const movie = q.getMovie(id);
  if (!movie) throw new CatalogError('not-found', 'This title could not be found.');
  const access = checkBrowse(movie);
  if (!access.ok) throw new CatalogError('revoked', 'Access to this media has been revoked.');
  const similar = q.movies().filter((m) => m.id !== id && m.genres.some((g) => movie.genres.includes(g))).slice(0, 10);
  return { movie, owner: friendById(movie.ownerId), similar };
}

export async function getShowDetails(id: ID): Promise<{ show: TVShow; episodes: Episode[]; owner?: Friend; similar: TVShow[] }> {
  await simulateLatency();
  const show = q.getShow(id);
  if (!show) throw new CatalogError('not-found', 'This title could not be found.');
  if (!checkBrowse(show).ok) throw new CatalogError('revoked', 'Access to this media has been revoked.');
  return {
    show,
    episodes: q.episodesOf(id),
    owner: friendById(show.ownerId),
    similar: q.shows().filter((s) => s.id !== id && s.genres.some((g) => show.genres.includes(g))).slice(0, 8),
  };
}

export interface MusicData {
  albums: Album[];
  artists: ReturnType<typeof q.artists>;
  songs: Song[];
  playlists: Playlist[];
}
export async function getMusic(): Promise<MusicData> {
  await simulateLatency();
  return { albums: q.albums(), artists: q.artists(), songs: q.songs(), playlists: q.myPlaylists() };
}

export async function getAlbumDetails(id: ID) {
  await simulateLatency();
  const album = q.getAlbum(id);
  if (!album || !checkBrowse(album).ok) throw new CatalogError('not-found', 'This album could not be found.');
  return { album, songs: q.songsOfAlbum(album), owner: friendById(album.ownerId) };
}

export async function getArtistDetails(id: ID) {
  await simulateLatency();
  const artist = q.getArtist(id);
  if (!artist) throw new CatalogError('not-found', 'This artist could not be found.');
  const albums = artist.albumIds.map((a) => q.getAlbum(a)!).filter((a) => checkBrowse(a).ok);
  const songs = albums.flatMap((a) => q.songsOfAlbum(a));
  return { artist, albums, songs, owner: friendById(artist.ownerId) };
}

export async function getPlaylistDetails(id: ID) {
  await simulateLatency();
  const playlist = q.getPlaylist(id);
  if (!playlist) throw new CatalogError('not-found', 'This playlist could not be found.');
  return { playlist, songs: playlist.songIds.map((s) => q.getSong(s)!).filter(Boolean) };
}

export async function listVideos(): Promise<{ videos: Video[] }> {
  await simulateLatency();
  return { videos: q.videos() };
}

export async function getVideoDetails(id: ID): Promise<{ video: Video; owner?: Friend; related: Video[] }> {
  await simulateLatency();
  const video = q.getVideo(id);
  if (!video || !checkBrowse(video).ok) throw new CatalogError('not-found', 'This video could not be found.');
  return { video, owner: friendById(video.ownerId), related: q.videos().filter((v) => v.id !== id && v.category === video.category && v.ownerId === video.ownerId).slice(0, 8) };
}

export async function getMyLibrary() {
  await simulateLatency();
  return q.myLibrary();
}

/* ------------------------------- friends ------------------------------ */

export async function listFriends(): Promise<FriendLibrarySummary[]> {
  await simulateLatency();
  return db.friends.map(summariseFriend);
}

/** Libraries that have been "retried" successfully (John's library fails once, then loads). */
const recovered = new Set<ID>();
export const retryLibrary = (libraryId: ID) => recovered.add(libraryId);

export interface FriendLibraryData {
  friend: Friend;
  library: Library;
  permission: Permission;
  movies: Movie[];
  shows: TVShow[];
  albums: Album[];
  videos: Video[];
  /** Categories the owner has NOT shared with the viewer (rendered as locked sections). */
  locked: ShareCategory[];
  ownerOffline: boolean;
}

export async function getFriendLibrary(friendId: ID): Promise<FriendLibraryData> {
  await simulateLatency(420);
  const friend = friendById(friendId);
  if (!friend) throw new CatalogError('not-found', 'This library could not be found.');
  const library = libraryByOwner(friendId)!;
  const permission = incomingPermission(friendId)!;
  if (library.status === 'revoked' || permission.status === 'revoked' || isExpired(permission)) throw new CatalogError('revoked', 'Access to this media has been revoked.');
  if (library.status === 'error' && !recovered.has(library.id)) throw new CatalogError('library-error', 'Unable to load this library.');
  const all = q.sharedBy(friendId);
  const locked = (['movies', 'shows', 'music', 'videos'] as ShareCategory[]).filter((c) => !permission.categories[c]);
  return {
    friend,
    library,
    permission,
    movies: q.visible(all.movies),
    shows: q.visible(all.shows),
    albums: q.visible(all.albums),
    videos: q.visible(all.videos),
    locked,
    ownerOffline: friend.presence === 'offline' || library.status === 'owner-offline',
  };
}

/* ------------------------------- search ------------------------------- */

export async function searchAll(query: string) {
  await simulateLatency(240);
  return q.search(query);
}

/* ------------------------------- player ------------------------------- */

export interface PlayableContext {
  media: AnyPlayable;
  show?: TVShow;
  prev?: Episode;
  next?: Episode;
  ownerName?: string;
  stream: ReturnType<typeof checkStream>;
}

/**
 * Mirrors the future "create stream session" call: access is checked BEFORE a session exists.
 * Phase 1 returns an access verdict only — there is no stream, URL or file.
 */
export async function openPlayable(id: ID): Promise<PlayableContext> {
  await simulateLatency(240);
  const media = q.getPlayable(id);
  if (!media) throw new CatalogError('not-found', 'This media is currently unavailable.');
  const ep = media.kind === 'episode' ? media : undefined;
  return {
    media,
    show: ep ? q.getShow(ep.showId) : undefined,
    ...(ep ? q.neighbourEpisodes(ep) : {}),
    ownerName: friendById(media.ownerId)?.name,
    stream: checkStream(media),
  };
}
