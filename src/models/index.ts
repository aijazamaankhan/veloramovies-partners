/**
 * Domain models for VibeVault.
 *
 * These interfaces are the contract between the UI and whatever supplies data
 * (mock data in Phase 1, a local media engine in Phase 2, remote media servers later).
 *
 * SECURITY BY DESIGN
 * ------------------
 * No model in this file has a filesystem path, SMB path, direct file URL or storage
 * credential field — and none ever should. Media is identified only by opaque `id`s.
 * A future streaming layer exchanges an `id` + a short-lived session token for a stream;
 * the UI never sees where the bytes live. There is also deliberately no "download" concept.
 */

export type ID = string;
export type ISODate = string;

/* ----------------------------- primitives ----------------------------- */

export type MediaKind = 'movie' | 'show' | 'episode' | 'album' | 'song' | 'video';
export type ShareCategory = 'movies' | 'shows' | 'music' | 'videos';
export type Presence = 'online' | 'away' | 'offline';
export type Resolution = '4K' | '1080p' | '720p' | '480p';
export type Availability = 'available' | 'unavailable';
export type VideoCategory = 'Family' | 'Travel' | 'Events' | 'Personal' | 'Other';

/** Artwork is always an opaque URL/data-URI produced by the data layer. */
export interface Artwork {
  poster?: string; // 2:3
  backdrop?: string; // 16:9, large
  thumb?: string; // 16:9, small
  square?: string; // 1:1 (covers)
}

export interface AvatarSpec {
  initials: string;
  /** Two CSS colours used for the avatar gradient. */
  colors: [string, string];
}

export interface AudioTrack {
  id: string;
  language: string;
  label: string; // e.g. "English · 5.1"
}

export interface SubtitleTrack {
  id: string;
  language: string;
  label: string;
}

/* ------------------------------- media -------------------------------- */

export interface MediaBase {
  id: ID;
  kind: MediaKind;
  title: string;
  description: string;
  year: number;
  addedAt: ISODate;
  /** The user that owns the underlying media. `User.id` of the current user means "mine". */
  ownerId: ID;
  availability: Availability;
  playCount: number;
  lastPlayedAt: ISODate | null;
  artwork: Artwork;
}

export interface PlayableMedia extends MediaBase {
  durationSec: number;
  resolution: Resolution;
  hdr: boolean;
  audioTracks: AudioTrack[];
  subtitleTracks: SubtitleTrack[];
}

export interface Media extends MediaBase {}

export interface Movie extends PlayableMedia {
  kind: 'movie';
  genres: string[];
  contentRating: string;
  score: number; // 0–10
  tagline: string;
  director: string;
  cast: string[];
  collectionIds: ID[];
}

export interface Season {
  number: number;
  title: string;
  episodeIds: ID[];
}

export interface TVShow extends MediaBase {
  kind: 'show';
  genres: string[];
  contentRating: string;
  score: number;
  creator: string;
  cast: string[];
  resolution: Resolution;
  hdr: boolean;
  seasons: Season[];
}

export interface Episode extends PlayableMedia {
  kind: 'episode';
  showId: ID;
  seasonNumber: number;
  episodeNumber: number;
}

export interface Artist {
  id: ID;
  name: string;
  ownerId: ID;
  albumIds: ID[];
  artwork: Artwork;
}

export interface Album extends MediaBase {
  kind: 'album';
  artistId: ID;
  artistName: string;
  genres: string[];
  trackIds: ID[];
  totalDurationSec: number;
}

export interface Song extends MediaBase {
  kind: 'song';
  albumId: ID;
  albumTitle: string;
  artistId: ID;
  artistName: string;
  trackNumber: number;
  durationSec: number;
}

export interface Playlist {
  id: ID;
  name: string;
  description: string;
  ownerId: ID;
  songIds: ID[];
  artwork: Artwork;
}

export interface Video extends PlayableMedia {
  kind: 'video';
  category: VideoCategory;
  recordedAt: ISODate;
  /** Personal videos are private unless explicitly shared. */
  sharedWithIds: ID[];
}

export interface Collection {
  id: ID;
  name: string;
  itemIds: ID[];
}

export type AnyMedia = Movie | TVShow | Episode | Album | Song | Video;
export type AnyPlayable = Movie | Episode | Video;

/* ------------------------------- people ------------------------------- */

export interface User {
  id: ID;
  displayName: string;
  email: string;
  avatar: AvatarSpec;
}

export interface Profile {
  id: ID;
  userId: ID;
  name: string;
  avatar: AvatarSpec;
  kind: 'standard' | 'guest';
}

export interface Friend {
  id: ID; // also the User.id of the friend
  name: string;
  avatar: AvatarSpec;
  presence: Presence;
  lastSeenLabel: string;
  libraryId: ID;
  friendsSince: ISODate;
}

/* ------------------------ libraries & permissions ---------------------- */

export type LibraryStatus = 'available' | 'owner-offline' | 'revoked' | 'error';

export interface Library {
  id: ID;
  ownerId: ID;
  name: string;
  status: LibraryStatus;
  /** When metadata was last synchronised (metadata sync is separate from streaming). */
  lastSyncedLabel: string;
  counts: Record<ShareCategory, number>;
}

export interface Permission {
  id: ID;
  /** Who owns the media being shared. */
  ownerId: ID;
  /** Who is allowed to stream it. */
  granteeId: ID;
  categories: Record<ShareCategory, boolean>;
  /** Optional fine-grained access (future UI). */
  titleGrantIds: ID[];
  collectionGrantIds: ID[];
  /** `null` = never expires. */
  expiresAt: ISODate | null;
  status: 'active' | 'revoked';
}

/* ------------------------------ playback ------------------------------ */

export interface PlaybackState {
  mediaId: ID;
  isPlaying: boolean;
  positionSec: number;
  durationSec: number;
  volume: number; // 0–1
  muted: boolean;
  audioTrackId: string | null;
  subtitleTrackId: string | null; // null = off
  quality: 'Auto' | Resolution;
}

export interface WatchProgress {
  mediaId: ID;
  positionSec: number;
  durationSec: number;
  updatedAt: ISODate;
}

export interface ProfileActivity {
  profileId: ID;
  progress: WatchProgress[];
  favoriteIds: ID[];
  historyIds: ID[];
}

/* ---------------------------- view helpers ---------------------------- */

export type SortKey = 'recent' | 'alpha' | 'played' | 'most-played';
export type LibraryFilter = 'all' | 'movies' | 'shows' | 'music' | 'videos';

export type AccessDenial = 'owner-offline' | 'revoked' | 'not-shared' | 'unavailable';
export type AccessResult = { ok: true } | { ok: false; reason: AccessDenial };
