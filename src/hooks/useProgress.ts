import { useMemo } from 'react';
import type { ID, WatchProgress } from '@/models';
import { getProfileActivity } from '@/data/queries';
import { useProfiles } from '@/state/profiles';

/** Watch progress for the active profile, keyed by media id. */
export function useProgressMap(): Map<ID, WatchProgress> {
  const { active } = useProfiles();
  return useMemo(() => new Map(getProfileActivity(active?.id ?? '').progress.map((p) => [p.mediaId, p])), [active?.id]);
}

export const fractionOf = (p?: WatchProgress) => (p ? p.positionSec / p.durationSec : undefined);
