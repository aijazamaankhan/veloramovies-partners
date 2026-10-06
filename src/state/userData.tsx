import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ID, Permission, ShareCategory } from '@/models';
import { db } from '@/data/mock';
import { useProfiles } from './profiles';

/**
 * Mutable, UI-only user state: favourites, "My List", search history and outgoing sharing permissions.
 * Nothing here persists — a reload resets to the mock seed.
 */
interface UserDataApi {
  favoriteIds: ID[];
  isFavorite: (id: ID) => boolean;
  toggleFavorite: (id: ID) => boolean;
  myListIds: ID[];
  inMyList: (id: ID) => boolean;
  toggleMyList: (id: ID) => boolean;
  recentSearches: string[];
  addRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;
  outgoing: Permission[];
  setCategory: (friendId: ID, category: ShareCategory, allowed: boolean) => void;
  patchPermission: (friendId: ID, patch: Partial<Pick<Permission, 'expiresAt' | 'titleGrantIds' | 'collectionGrantIds'>>) => void;
  revokeAccess: (friendId: ID) => void;
  restoreAccess: (friendId: ID) => void;
}

const Ctx = createContext<UserDataApi | null>(null);

export function UserDataProvider({ children }: { children: ReactNode }) {
  const { active } = useProfiles();
  const [favoritesByProfile, setFavorites] = useState<Record<ID, ID[]>>(() => Object.fromEntries(db.activities.map((a) => [a.profileId, a.favoriteIds])));
  const [myListIds, setMyList] = useState<ID[]>(['mov-lanternfall', 'show-kingdom-of-moss', 'sarah-mov-rosewater']);
  const [recentSearches, setRecent] = useState<string[]>(db.recentSearches);
  const [outgoing, setOutgoing] = useState<Permission[]>(db.outgoingPermissions);

  const favoriteIds = favoritesByProfile[active?.id ?? ''] ?? [];

  const toggleFavorite = useCallback(
    (id: ID) => {
      const key = active?.id ?? '';
      const has = (favoritesByProfile[key] ?? []).includes(id);
      setFavorites((f) => ({ ...f, [key]: has ? (f[key] ?? []).filter((x) => x !== id) : [id, ...(f[key] ?? [])] }));
      return !has;
    },
    [active?.id, favoritesByProfile],
  );

  const toggleMyList = useCallback(
    (id: ID) => {
      const has = myListIds.includes(id);
      setMyList((l) => (has ? l.filter((x) => x !== id) : [id, ...l]));
      return !has;
    },
    [myListIds],
  );

  const addRecentSearch = useCallback((q: string) => {
    const t = q.trim();
    if (t) setRecent((l) => [t, ...l.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 8));
  }, []);

  const mutate = useCallback((friendId: ID, fn: (p: Permission) => Permission) => setOutgoing((l) => l.map((p) => (p.granteeId === friendId ? fn(p) : p))), []);

  const api = useMemo<UserDataApi>(
    () => ({
      favoriteIds,
      isFavorite: (id) => favoriteIds.includes(id),
      toggleFavorite,
      myListIds,
      inMyList: (id) => myListIds.includes(id),
      toggleMyList,
      recentSearches,
      addRecentSearch,
      clearRecentSearches: () => setRecent([]),
      outgoing,
      setCategory: (friendId, category, allowed) =>
        mutate(friendId, (p) => ({ ...p, status: 'active', categories: { ...p.categories, [category]: allowed } })),
      patchPermission: (friendId, patch) => mutate(friendId, (p) => ({ ...p, ...patch })),
      revokeAccess: (friendId) =>
        mutate(friendId, (p) => ({ ...p, status: 'revoked', categories: { movies: false, shows: false, music: false, videos: false }, titleGrantIds: [], collectionGrantIds: [], expiresAt: null })),
      restoreAccess: (friendId) => mutate(friendId, (p) => ({ ...p, status: 'active' })),
    }),
    [favoriteIds, toggleFavorite, myListIds, toggleMyList, recentSearches, addRecentSearch, outgoing, mutate],
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useUserData(): UserDataApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useUserData must be used inside <UserDataProvider>');
  return v;
}
