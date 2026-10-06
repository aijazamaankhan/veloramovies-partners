import { useState } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { AccessDeniedState, Button, Chip, EmptyState, ErrorState, Tabs } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { BrowseSkeleton, DetailsSkeleton, FriendLibrarySkeleton, HomeSkeleton, SearchSkeleton, GridSkeleton, ListSkeleton } from '@/components/media';

type Tab = 'loading' | 'empty' | 'error';

const LOADING = {
  Home: <HomeSkeleton />,
  Movies: <BrowseSkeleton />,
  'TV Shows': <BrowseSkeleton />,
  Music: (<div className="page"><GridSkeleton variant="square" count={8} /><div style={{ marginTop: '2rem' }}><ListSkeleton rows={4} /></div></div>),
  'Friend library': <FriendLibrarySkeleton />,
  Search: <div className="page"><SearchSkeleton /></div>,
  Details: <DetailsSkeleton />,
} as const;

/** Review screen for every loading / empty / error state (reachable from Settings → About). */
export function StatesGalleryPage() {
  useDocumentTitle('UI states');
  const [tab, setTab] = useState<Tab>('loading');
  const [loading, setLoading] = useState<keyof typeof LOADING>('Home');
  const noop = () => undefined;

  return (
    <div className="page page--top">
      <PageHeader title="UI states" description="Every loading, empty and error screen in VibeVault — for design review." />
      <Tabs label="State type" value={tab} onChange={setTab} items={[{ id: 'loading', label: 'Loading' }, { id: 'empty', label: 'Empty' }, { id: 'error', label: 'Errors' }]} />
      <div className="section" key={tab}>
        {tab === 'loading' && (
          <>
            <div className="row row--wrap" style={{ marginBottom: '1rem' }}>
              {(Object.keys(LOADING) as (keyof typeof LOADING)[]).map((k) => (
                <Chip key={k} selected={k === loading} onClick={() => setLoading(k)}>{k}</Chip>
              ))}
            </div>
            <div className="gallery__frame gallery__frame--tall">{LOADING[loading]}</div>
          </>
        )}
        {tab === 'empty' && (
          <div className="gallery">
            {[
              { icon: 'film', title: 'No movies yet', description: 'Add a folder to your library and your movies will appear here.' },
              { icon: 'tv', title: 'No TV shows yet', description: 'Shows you add will be grouped into seasons automatically.' },
              { icon: 'music', title: 'No music', description: 'Add a music folder to your library and your albums will appear here.' },
              { icon: 'video', title: 'No personal videos yet', description: 'Home movies and recordings you add will live here — privately.', tone: 'private' },
              { icon: 'users', title: 'No friends yet', description: 'Invite someone you trust. You choose exactly what they can stream.' },
              { icon: 'share', title: 'No shared libraries', description: 'Nobody has shared a library with you yet.' },
              { icon: 'heart', title: 'No favorites', description: 'Tap the heart on anything you love and it will show up here.' },
              { icon: 'clock', title: 'No recently watched content', description: 'Start something and it will wait for you right where you stopped.' },
              { icon: 'search', title: 'No results for “zzz”', description: 'Check the spelling or try a broader term.' },
            ].map((s) => (
              <div key={s.title} className="gallery__card"><EmptyState compact icon={s.icon as 'film'} title={s.title} description={s.description} tone={(s.tone as 'private') ?? 'neutral'} action={<Button variant="secondary" onClick={noop}>Primary action</Button>} /></div>
            ))}
          </div>
        )}
        {tab === 'error' && (
          <div className="gallery">
            <div className="gallery__card"><ErrorState compact icon="alert" title="Unable to load this library." description="The connection to their media server hiccuped. Your access hasn't changed." action={<Button variant="primary" icon="repeat" onClick={noop}>Try again</Button>} /></div>
            <div className="gallery__card"><AccessDeniedState compact reason="unavailable" action={<Button variant="primary" icon="repeat" onClick={noop}>Try again</Button>} /></div>
            <div className="gallery__card"><AccessDeniedState compact reason="owner-offline" action={<Button variant="primary" icon="repeat" onClick={noop}>Check again</Button>} /></div>
            <div className="gallery__card"><AccessDeniedState compact reason="revoked" /></div>
            <div className="gallery__card"><AccessDeniedState compact reason="not-shared" /></div>
          </div>
        )}
      </div>
    </div>
  );
}
