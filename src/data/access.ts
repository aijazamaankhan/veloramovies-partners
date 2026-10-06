import type { AccessResult, AnyMedia, Friend, Library, Permission, ShareCategory } from '@/models';
import { MOCK_NOW } from './mock/builders';
import { db } from './mock';

/**
 * Access decisions.
 *
 * Phase 1 evaluates these against static mock permissions. The *shape* is the production contract:
 * "may this viewer browse this item?" and, separately, "may a stream session be created for it?".
 * In later phases the second question is answered by the owner's media server + permission service
 * before any short-lived streaming token is issued.
 */

export function categoryOf(item: Pick<AnyMedia, 'kind'>): ShareCategory {
  switch (item.kind) {
    case 'movie':
      return 'movies';
    case 'show':
    case 'episode':
      return 'shows';
    case 'album':
    case 'song':
      return 'music';
    case 'video':
      return 'videos';
  }
}

export const isMine = (ownerId: string) => ownerId === db.me.id;

export function incomingPermission(ownerId: string): Permission | undefined {
  return db.incomingPermissions.find((p) => p.ownerId === ownerId);
}

export function friendById(id: string): Friend | undefined {
  return db.friends.find((f) => f.id === id);
}

export function libraryByOwner(ownerId: string): Library | undefined {
  return db.libraries.find((l) => l.ownerId === ownerId);
}

export function isExpired(p: Pick<Permission, 'expiresAt'>): boolean {
  return p.expiresAt !== null && Date.parse(p.expiresAt) < MOCK_NOW;
}

/** Can the item show up in lists and search results (metadata only)? */
export function checkBrowse(item: Pick<AnyMedia, 'kind' | 'ownerId'>): AccessResult {
  if (isMine(item.ownerId)) return { ok: true };
  const perm = incomingPermission(item.ownerId);
  if (!perm || perm.status === 'revoked' || isExpired(perm)) return { ok: false, reason: 'revoked' };
  if (!perm.categories[categoryOf(item)]) return { ok: false, reason: 'not-shared' };
  return { ok: true };
}

/** Can a stream session be created right now? */
export function checkStream(item: Pick<AnyMedia, 'kind' | 'ownerId'> & { availability: string }): AccessResult {
  const browse = checkBrowse(item);
  if (!browse.ok) return browse;
  if (item.availability === 'unavailable') return { ok: false, reason: 'unavailable' };
  if (!isMine(item.ownerId) && friendById(item.ownerId)?.presence === 'offline') return { ok: false, reason: 'owner-offline' };
  return { ok: true };
}

export const canBrowse = (item: Pick<AnyMedia, 'kind' | 'ownerId'>) => checkBrowse(item).ok;
