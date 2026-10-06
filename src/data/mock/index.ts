import type {
  Album, Artist, Collection, Episode, Friend, Library, Movie, Permission, Playlist, Profile, ProfileActivity,
  ShareCategory, Song, TVShow, User, Video, WatchProgress,
} from '@/models';
import { daysAgo, ME } from './builders';
import { FRIEND_MOVIES, MY_MOVIES, buildMovies } from './movies';
import { FRIEND_SHOWS, MY_SHOWS, buildShows } from './shows';
import { FRIEND_ALBUMS, MY_ALBUMS, buildMusic, buildPlaylists } from './music';
import { FRIEND_VIDEOS, MY_VIDEOS, buildVideos } from './videos';
import { FRIENDS, INCOMING_PERMISSIONS, LIBRARY_STATUS, ME_USER, OUTGOING_PERMISSIONS, PROFILES } from './people';

/**
 * The in-memory "database". In Phase 2+ this module is replaced by real data sources;
 * everything above `src/data` only talks to `data/queries` and `services/*`.
 */

const movies: Movie[] = [...buildMovies(ME, MY_MOVIES, 'mov', 2, ['Zero Hour Lullaby'])];
const tvShows: TVShow[] = [];
const episodes: Episode[] = [];
const albums: Album[] = [];
const songs: Song[] = [];
const artists: Artist[] = [];
const videos: Video[] = [...buildVideos(ME, MY_VIDEOS, 'vid', 1)];

{
  const mine = buildShows(ME, MY_SHOWS, 'show', 4);
  tvShows.push(...mine.shows);
  episodes.push(...mine.episodes);
  const music = buildMusic(ME, MY_ALBUMS, 'alb', 0, 3);
  albums.push(...music.albums);
  songs.push(...music.songs);
  artists.push(...music.artists);
}

let epOffset = 7;
let songOffset = 50;
FRIENDS.forEach((f, idx) => {
  movies.push(...buildMovies(f.id, FRIEND_MOVIES[f.id] ?? [], `${f.id}-mov`, 1 + idx * 2));
  const sh = buildShows(f.id, FRIEND_SHOWS[f.id] ?? [], `${f.id}-show`, 2 + idx * 3, epOffset);
  tvShows.push(...sh.shows);
  episodes.push(...sh.episodes);
  epOffset += 5;
  const mu = buildMusic(f.id, FRIEND_ALBUMS[f.id] ?? [], `${f.id}-alb`, songOffset, 2 + idx * 2);
  songOffset += mu.songs.length;
  albums.push(...mu.albums);
  songs.push(...mu.songs);
  artists.push(...mu.artists);
  videos.push(...buildVideos(f.id, FRIEND_VIDEOS[f.id] ?? [], `${f.id}-vid`, 2 + idx * 3));
});

const playlists: Playlist[] = buildPlaylists(
  ME,
  songs.filter((s) => s.ownerId === ME),
);

const collections: Collection[] = [
  { id: 'col-scifi', name: 'Sci-Fi Night', itemIds: movies.filter((m) => m.ownerId === ME && m.genres.includes('Sci-Fi')).map((m) => m.id) },
  { id: 'col-family', name: 'Family Favorites', itemIds: movies.filter((m) => m.ownerId === ME && m.genres.some((g) => ['Family', 'Animation', 'Adventure'].includes(g))).map((m) => m.id) },
  { id: 'col-thrill', name: 'Weekend Thrillers', itemIds: movies.filter((m) => m.ownerId === ME && m.genres.some((g) => ['Thriller', 'Crime', 'Mystery'].includes(g))).map((m) => m.id) },
  { id: 'col-docs', name: 'Documentaries', itemIds: [...movies.filter((m) => m.ownerId === ME && m.genres.includes('Documentary')).map((m) => m.id), 'show-deep-field'] },
];
movies.forEach((m) => {
  m.collectionIds = collections.filter((c) => c.itemIds.includes(m.id)).map((c) => c.id);
});

const countsFor = (ownerId: string): Record<ShareCategory, number> => ({
  movies: movies.filter((m) => m.ownerId === ownerId).length,
  shows: tvShows.filter((s) => s.ownerId === ownerId).length,
  music: albums.filter((a) => a.ownerId === ownerId).length,
  videos: videos.filter((v) => v.ownerId === ownerId).length,
});

const libraries: Library[] = [
  { id: 'lib-me', ownerId: ME, name: 'My Library', status: 'available', lastSyncedLabel: 'Just now', counts: countsFor(ME) },
  ...FRIENDS.map<Library>((f) => ({
    id: f.libraryId,
    ownerId: f.id,
    name: `${f.name}'s Library`,
    ...LIBRARY_STATUS[f.libraryId],
    counts: countsFor(f.id),
  })),
];

/* --------------------------- profile activity --------------------------- */

const prog = (mediaId: string, fraction: number, durationSec: number, daysBack: number): WatchProgress => ({
  mediaId,
  positionSec: Math.round(durationSec * fraction),
  durationSec,
  updatedAt: daysAgo(daysBack),
});
const dur = (id: string) => {
  const m = [...movies, ...episodes, ...videos].find((x) => x.id === id);
  if (!m) throw new Error(`mock data: unknown media id ${id}`);
  return m.durationSec;
};

const activities: ProfileActivity[] = [
  { profileId: 'p-sam', progress: [], favoriteIds: [], historyIds: [] },
  { profileId: 'p-riley', progress: [], favoriteIds: [], historyIds: [] },
  { profileId: 'p-guest', progress: [], favoriteIds: [], historyIds: [] },
];

const showEp = (showSlug: string, s: number, e: number) => `show-${showSlug}-s${s}e${e}`;
activities[0] = {
  profileId: 'p-sam',
  progress: [
    prog('mov-neon-meridian', 0.42, dur('mov-neon-meridian'), 0.1),
    prog(showEp('breaking-example', 1, 3), 0.6, dur(showEp('breaking-example', 1, 3)), 0.5),
    prog('mov-glass-harbor', 0.78, dur('mov-glass-harbor'), 1),
    prog('alex-mov-kingfisher-run', 0.25, dur('alex-mov-kingfisher-run'), 2),
    prog(showEp('the-signal-room', 1, 2), 0.3, dur(showEp('the-signal-room', 1, 2)), 3),
    prog('mov-orbit-of-echoes', 0.15, dur('mov-orbit-of-echoes'), 4),
    prog('vid-lisbon-tram-rides', 0.5, dur('vid-lisbon-tram-rides'), 6),
    prog(showEp('breaking-example', 1, 1), 1, dur(showEp('breaking-example', 1, 1)), 3),
    prog(showEp('breaking-example', 1, 2), 1, dur(showEp('breaking-example', 1, 2)), 2),
  ],
  favoriteIds: [
    'mov-a-thousand-small-suns', 'mov-orbit-of-echoes', 'show-breaking-example', 'show-deep-field', 'alb-midnight-transit',
    'alb-quiet-thunder', 'mov-lanternfall', 'sarah-mov-atlas-undone', 'vid-emma-s-first-steps',
  ],
  historyIds: [
    'mov-neon-meridian', 'mov-glass-harbor', 'show-breaking-example', 'mov-echo-valley', 'mov-northbound', 'show-ashfall',
    'mov-paper-cities', 'vid-kyoto-in-the-rain', 'alex-mov-moonlit-algebra', 'mov-iron-orchard',
  ],
};
activities[1] = {
  profileId: 'p-riley',
  progress: [prog('mov-paper-cities', 0.55, dur('mov-paper-cities'), 1), prog('mov-northbound', 0.2, dur('mov-northbound'), 5)],
  favoriteIds: ['mov-paper-cities', 'mov-northbound', 'show-kingdom-of-moss'],
  historyIds: ['mov-paper-cities', 'mov-northbound', 'mov-static-bloom'],
};

export interface Database {
  me: User;
  profiles: Profile[];
  friends: Friend[];
  libraries: Library[];
  movies: Movie[];
  shows: TVShow[];
  episodes: Episode[];
  albums: Album[];
  songs: Song[];
  artists: Artist[];
  playlists: Playlist[];
  videos: Video[];
  collections: Collection[];
  incomingPermissions: Permission[];
  outgoingPermissions: Permission[];
  activities: ProfileActivity[];
  recentSearches: string[];
}

export const db: Database = {
  me: ME_USER,
  profiles: PROFILES,
  friends: FRIENDS,
  libraries,
  movies,
  shows: tvShows,
  episodes,
  albums,
  songs,
  artists,
  playlists,
  videos,
  collections,
  incomingPermissions: INCOMING_PERMISSIONS,
  outgoingPermissions: OUTGOING_PERMISSIONS,
  activities,
  recentSearches: ['neon meridian', 'jazz', 'alex', 'family videos'],
};
