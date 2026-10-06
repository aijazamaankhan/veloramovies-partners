import { useMemo, useState } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import * as catalog from '@/services/catalog';
import { getProfileActivity, lookup } from '@/data/queries';
import { useProfiles } from '@/state/profiles';
import { useToast } from '@/state/toast';
import { useUserData } from '@/state/userData';
import { paths } from '@/routes';
import { Avatar, Button, EmptyState, LinkButton, Tabs } from '@/components/ui';
import { EpisodeCard, GridSkeleton, MediaCardFor, MovieCard, VideoCard } from '@/components/media';

type Tab = 'continue' | 'favorites' | 'history';

export function ProfilePage() {
  useDocumentTitle('Profile');
  const { active } = useProfiles();
  const data = useUserData();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('continue');
  const [cleared, setCleared] = useState<string[]>([]);
  const state = useAsync(() => catalog.getHome(active?.id ?? ''), [active?.id]);
  const favorites = useMemo(() => lookup(data.favoriteIds), [data.favoriteIds]);
  const history = useMemo(() => lookup(getProfileActivity(active?.id ?? '').historyIds), [active?.id]);
  if (!active) return null;
  const cont = state.data?.continueWatching ?? [];
  const hist = cleared.includes(active.id) ? [] : history;

  return (
    <div className="page page--top">
      <header className="profile-head">
        <Avatar spec={active.avatar} size="xl" shape="rounded" />
        <div className="profile-head__text">
          <span className="eyebrow">Profile</span>
          <h1>{active.name}</h1>
          <p className="muted">{cont.length} in progress · {favorites.length} favorites · {hist.length} in history</p>
          <div className="row row--wrap" style={{ marginTop: '0.6rem' }}>
            <LinkButton variant="glass" icon="users" to={paths.profiles}>Switch profile</LinkButton>
            <LinkButton variant="ghost" icon="edit" to={paths.manageProfiles}>Manage profiles</LinkButton>
          </div>
        </div>
      </header>
      <div className="toolbar">
        <Tabs
          label="Profile sections"
          value={tab}
          onChange={setTab}
          items={[
            { id: 'continue', label: 'Continue Watching', icon: 'play', count: cont.length },
            { id: 'favorites', label: 'Favorites', icon: 'heart', count: favorites.length },
            { id: 'history', label: 'History', icon: 'history', count: hist.length },
          ]}
        />
        <span className="spacer" />
        {tab === 'history' && hist.length > 0 && <Button variant="ghost" onClick={() => (setCleared([...cleared, active.id]), toast.show('History cleared', { tone: 'success' }))}>Clear history</Button>}
      </div>
      <div key={tab}>
        {tab === 'continue' &&
          (state.status === 'loading' ? (
            <GridSkeleton variant="landscape" count={4} />
          ) : cont.length === 0 ? (
            <EmptyState icon="clock" title="No recently watched content" description={`When ${active.name} starts something, it will wait here — right where they stopped.`} action={<LinkButton variant="primary" to={paths.movies} icon="film">Browse movies</LinkButton>} />
          ) : (
            <div className="grid grid--land">
              {cont.map(({ media, progress, show }) =>
                media.kind === 'movie' ? <MovieCard key={media.id} movie={media} variant="landscape" progress={progress.positionSec / progress.durationSec} /> : media.kind === 'episode' ? <EpisodeCard key={media.id} episode={media} show={show} progress={progress} /> : <VideoCard key={media.id} video={media} progress={progress.positionSec / progress.durationSec} />,
              )}
            </div>
          ))}
        {tab === 'favorites' &&
          (favorites.length === 0 ? (
            <EmptyState icon="heart" title="No favorites" description="Tap the heart on any title, album or video to keep it close." />
          ) : (
            <div className="grid">{favorites.map((m) => <MediaCardFor key={m.id} item={m} />)}</div>
          ))}
        {tab === 'history' &&
          (hist.length === 0 ? (
            <EmptyState icon="history" title="No history" description="Titles you finish will be listed here." />
          ) : (
            <div className="grid">{hist.map((m) => <MediaCardFor key={m.id} item={m} />)}</div>
          ))}
      </div>
    </div>
  );
}
