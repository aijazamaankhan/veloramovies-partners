import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AvatarSpec, ID, Profile } from '@/models';
import { db } from '@/data/mock';

interface ProfilesApi {
  profiles: Profile[];
  active: Profile | null;
  select: (id: ID | null) => void;
  add: (name: string, avatar: AvatarSpec) => Profile;
  update: (id: ID, patch: Partial<Pick<Profile, 'name' | 'avatar'>>) => void;
  remove: (id: ID) => void;
}

const Ctx = createContext<ProfilesApi | null>(null);
export const MAX_PROFILES = 5;

export function ProfilesProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(db.profiles);
  const [activeId, setActiveId] = useState<ID | null>(null);

  const select = useCallback((id: ID | null) => setActiveId(id), []);
  const add = useCallback<ProfilesApi['add']>((name, avatar) => {
    const profile: Profile = { id: `p-${Date.now()}`, userId: db.me.id, name, avatar, kind: 'standard' };
    setProfiles((l) => [...l, profile]);
    return profile;
  }, []);
  const update = useCallback<ProfilesApi['update']>((id, patch) => setProfiles((l) => l.map((p) => (p.id === id ? { ...p, ...patch } : p))), []);
  const remove = useCallback((id: ID) => {
    setProfiles((l) => l.filter((p) => p.id !== id));
    setActiveId((a) => (a === id ? null : a));
  }, []);

  const active = profiles.find((p) => p.id === activeId) ?? null;
  const api = useMemo(() => ({ profiles, active, select, add, update, remove }), [profiles, active, select, add, update, remove]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProfiles(): ProfilesApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useProfiles must be used inside <ProfilesProvider>');
  return v;
}
