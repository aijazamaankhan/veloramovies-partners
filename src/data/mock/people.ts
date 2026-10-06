import type { Friend, Library, Permission, Profile, ShareCategory, User } from '@/models';
import { avatar, daysAgo, ME } from './builders';

export const ME_USER: User = {
  id: ME,
  displayName: 'Sam Rivera',
  email: 'sam@example.com',
  avatar: avatar('SR', '#7c5cff', '#ff7ac6'),
};

export const PROFILES: Profile[] = [
  { id: 'p-sam', userId: ME, name: 'Sam', avatar: avatar('S', '#7c5cff', '#ff7ac6'), kind: 'standard' },
  { id: 'p-riley', userId: ME, name: 'Riley', avatar: avatar('R', '#18b3a5', '#f9e27d'), kind: 'standard' },
  { id: 'p-guest', userId: ME, name: 'Guest', avatar: avatar('G', '#64748b', '#94a3b8'), kind: 'guest' },
];

export const FRIENDS: Friend[] = [
  { id: 'alex', name: 'Alex', avatar: avatar('A', '#3b82f6', '#9be7ff'), presence: 'online', lastSeenLabel: 'Online now', libraryId: 'lib-alex', friendsSince: daysAgo(640) },
  { id: 'sarah', name: 'Sarah', avatar: avatar('S', '#d6336c', '#ffb84d'), presence: 'online', lastSeenLabel: 'Online now', libraryId: 'lib-sarah', friendsSince: daysAgo(980) },
  { id: 'john', name: 'John', avatar: avatar('J', '#2fbf71', '#d4f57a'), presence: 'away', lastSeenLabel: 'Away · 25 min', libraryId: 'lib-john', friendsSince: daysAgo(310) },
  { id: 'david', name: 'David', avatar: avatar('D', '#e8833a', '#ffe08a'), presence: 'offline', lastSeenLabel: 'Seen yesterday', libraryId: 'lib-david', friendsSince: daysAgo(150) },
  { id: 'maya', name: 'Maya', avatar: avatar('M', '#a24bff', '#4de1ff'), presence: 'online', lastSeenLabel: 'Online now', libraryId: 'lib-maya', friendsSince: daysAgo(75) },
];

const cats = (movies: boolean, shows: boolean, music: boolean, videos: boolean): Record<ShareCategory, boolean> => ({ movies, shows, music, videos });

/** Libraries as seen from the current user's side (counts are filled in by the db builder). */
export const LIBRARY_STATUS: Record<string, Pick<Library, 'status' | 'lastSyncedLabel'>> = {
  'lib-alex': { status: 'available', lastSyncedLabel: 'Synced 4 min ago' },
  'lib-sarah': { status: 'available', lastSyncedLabel: 'Synced 1 min ago' },
  'lib-john': { status: 'error', lastSyncedLabel: 'Synced 3 h ago' },
  'lib-david': { status: 'owner-offline', lastSyncedLabel: 'Synced yesterday' },
  'lib-maya': { status: 'revoked', lastSyncedLabel: 'Never' },
};

/** What friends let ME watch (incoming). Read-only in the UI. */
export const INCOMING_PERMISSIONS: Permission[] = [
  { id: 'in-alex', ownerId: 'alex', granteeId: ME, categories: cats(true, true, false, false), titleGrantIds: [], collectionGrantIds: [], expiresAt: null, status: 'active' },
  { id: 'in-sarah', ownerId: 'sarah', granteeId: ME, categories: cats(true, true, true, true), titleGrantIds: [], collectionGrantIds: [], expiresAt: null, status: 'active' },
  { id: 'in-john', ownerId: 'john', granteeId: ME, categories: cats(true, false, true, false), titleGrantIds: [], collectionGrantIds: [], expiresAt: null, status: 'active' },
  { id: 'in-david', ownerId: 'david', granteeId: ME, categories: cats(true, true, true, true), titleGrantIds: [], collectionGrantIds: [], expiresAt: daysAgo(-30), status: 'active' },
  { id: 'in-maya', ownerId: 'maya', granteeId: ME, categories: cats(false, false, false, false), titleGrantIds: [], collectionGrantIds: [], expiresAt: null, status: 'revoked' },
];

/** What *I* let friends watch (outgoing). This seeds editable UI state. */
export const OUTGOING_PERMISSIONS: Permission[] = [
  { id: 'out-alex', ownerId: ME, granteeId: 'alex', categories: cats(true, true, false, false), titleGrantIds: [], collectionGrantIds: ['col-scifi'], expiresAt: null, status: 'active' },
  { id: 'out-sarah', ownerId: ME, granteeId: 'sarah', categories: cats(true, true, true, true), titleGrantIds: [], collectionGrantIds: [], expiresAt: daysAgo(-60), status: 'active' },
  { id: 'out-john', ownerId: ME, granteeId: 'john', categories: cats(true, false, false, false), titleGrantIds: ['mov-glass-harbor'], collectionGrantIds: [], expiresAt: null, status: 'active' },
  { id: 'out-david', ownerId: ME, granteeId: 'david', categories: cats(true, true, true, false), titleGrantIds: [], collectionGrantIds: [], expiresAt: daysAgo(-7), status: 'active' },
  { id: 'out-maya', ownerId: ME, granteeId: 'maya', categories: cats(false, false, false, false), titleGrantIds: [], collectionGrantIds: [], expiresAt: null, status: 'revoked' },
];
