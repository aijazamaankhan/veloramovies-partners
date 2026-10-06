import { useMemo, useState } from 'react';
import type { Video, VideoCategory } from '@/models';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useProgressMap, fractionOf } from '@/hooks/useProgress';
import * as catalog from '@/services/catalog';
import { isMine } from '@/data/access';
import { paths } from '@/routes';
import { EmptyState, Icon, LinkButton, Tabs } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { AsyncView, ContentRow, GridSkeleton, PageHeaderSkeleton, RowSkeleton, VideoCard } from '@/components/media';

const CATEGORIES: VideoCategory[] = ['Family', 'Travel', 'Events', 'Personal', 'Other'];
type Tab = 'all' | VideoCategory;

function Skeleton() {
  return (
    <div className="page page--top" role="status" aria-label="Loading videos">
      <PageHeaderSkeleton />
      <RowSkeleton variant="landscape" count={5} />
      <GridSkeleton variant="landscape" count={8} />
    </div>
  );
}

export function VideosPage() {
  useDocumentTitle('Videos');
  const state = useAsync(() => catalog.listVideos(), []);
  const [tab, setTab] = useState<Tab>('all');
  const progress = useProgressMap();

  return (
    <AsyncView state={state} skeleton={<Skeleton />}>
      {({ videos }) => <VideosContent videos={videos} tab={tab} setTab={setTab} frac={(id) => fractionOf(progress.get(id))} />}
    </AsyncView>
  );
}

function VideosContent({ videos, tab, setTab, frac }: { videos: Video[]; tab: Tab; setTab: (t: Tab) => void; frac: (id: string) => number | undefined }) {
  const mine = useMemo(() => videos.filter((v) => isMine(v.ownerId)), [videos]);
  const shared = videos.filter((v) => !isMine(v.ownerId));
  const items = tab === 'all' ? mine : mine.filter((v) => v.category === tab);

  return (
    <div className="page page--top videos">
      <PageHeader
        eyebrow={<span className="row" style={{ gap: '0.4rem' }}><Icon name="lock" size="1em" /> Personal & private</span>}
        title="Videos"
        description="Your own recordings — family moments, trips, events. Nothing here is visible to anyone unless you choose to share it."
        actions={<LinkButton variant="glass" icon="share" to={paths.sharing()}>Manage sharing</LinkButton>}
      />
      <div className="private-banner" role="note">
        <Icon name="shield" />
        <div>
          <strong>Private by default.</strong> <span className="muted">Videos are never shared automatically. Items marked with a lock are only visible to you.</span>
        </div>
      </div>
      <div className="toolbar">
        <Tabs
          label="Video categories"
          value={tab}
          onChange={setTab}
          items={[{ id: 'all', label: 'All', count: mine.length }, ...CATEGORIES.map((c) => ({ id: c, label: c, count: mine.filter((v) => v.category === c).length }))]}
        />
      </div>
      {mine.length === 0 ? (
        <EmptyState icon="video" tone="private" title="No personal videos yet" description="Home movies and recordings you add will live here — privately." />
      ) : tab === 'all' ? (
        <>
          {CATEGORIES.map((c) => {
            const list = mine.filter((v) => v.category === c);
            return list.length ? (
              <ContentRow key={c} title={c}>
                {list.map((v) => <VideoCard key={v.id} video={v} progress={frac(v.id)} />)}
              </ContentRow>
            ) : null;
          })}
          {shared.length > 0 && (
            <ContentRow title="Shared with you" subtitle="Videos friends have chosen to share">
              {shared.map((v) => <VideoCard key={v.id} video={v} />)}
            </ContentRow>
          )}
        </>
      ) : items.length === 0 ? (
        <EmptyState compact icon="video" tone="private" title={`No ${tab.toLowerCase()} videos`} description="Nothing in this category yet." />
      ) : (
        <div className="grid grid--land">{items.map((v) => <VideoCard key={v.id} video={v} progress={frac(v.id)} />)}</div>
      )}
    </div>
  );
}
