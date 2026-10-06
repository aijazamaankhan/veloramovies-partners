import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { AnyMedia, LibraryFilter, SortKey } from '@/models';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import * as catalog from '@/services/catalog';
import { byRecentlyAdded, lookup, sortItems } from '@/data/queries';
import { useUserData } from '@/state/userData';
import { useToast } from '@/state/toast';
import { detailPath, paths } from '@/routes';
import { formatDate, plural, sortOptions } from '@/lib';
import { Badge, Button, EmptyState, LinkButton, Segmented, Select, Tabs } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { AlbumCard, AsyncView, ContentRow, GridSkeleton, MediaCardFor, MovieCard, PageHeaderSkeleton, RowSkeleton, ShowCard, VideoCard } from '@/components/media';

type View = 'grid' | 'list';

const KIND_LABEL: Record<AnyMedia['kind'], string> = { movie: 'Movie', show: 'Show', episode: 'Episode', album: 'Album', song: 'Song', video: 'Video' };

function Skeleton() {
  return (
    <div className="page page--top" role="status" aria-label="Loading library">
      <PageHeaderSkeleton />
      <RowSkeleton />
      <RowSkeleton variant="square" />
      <GridSkeleton count={6} />
    </div>
  );
}

export function LibraryPage() {
  useDocumentTitle('My Library');
  const state = useAsync(() => catalog.getMyLibrary(), []);
  const [filter, setFilter] = useState<LibraryFilter>('all');
  const [sort, setSort] = useState<SortKey>('recent');
  const [view, setView] = useState<View>('grid');
  const data = useUserData();
  const toast = useToast();
  const favorites = useMemo(() => lookup(data.favoriteIds), [data.favoriteIds]);

  return (
    <AsyncView state={state} skeleton={<Skeleton />}>
      {({ movies, shows, albums, videos }) => {
        const all: AnyMedia[] = [...movies, ...shows, ...albums, ...videos];
        const sorted = {
          movies: sortItems(movies, sort),
          shows: sortItems(shows, sort),
          albums: sortItems(albums, sort),
          videos: sortItems(videos, sort),
        };
        const selected: AnyMedia[] = filter === 'all' ? sortItems(all, sort) : filter === 'movies' ? sorted.movies : filter === 'shows' ? sorted.shows : filter === 'music' ? sorted.albums : sorted.videos;
        const recentlyAdded = byRecentlyAdded(all).slice(0, 14);

        return (
          <div className="page page--top">
            <PageHeader
              eyebrow="Your private collection"
              title="My Library"
              description={`${plural(movies.length, 'movie')} · ${plural(shows.length, 'show')} · ${plural(albums.length, 'album')} · ${plural(videos.length, 'video')}`}
              actions={
                <>
                  <LinkButton variant="primary" icon="share" to={paths.sharing()} data-autofocus>Manage Sharing</LinkButton>
                  <Button variant="glass" icon="folder" onClick={() => toast.show('Adding folders arrives with the Local Media Engine (Phase 2)', { icon: 'info' })}>Add folder</Button>
                </>
              }
            />
            <div className="library-status">
              <Badge tone="success" icon="shield">Server online</Badge>
              <span className="dim">Sharing with {data.outgoing.filter((p) => p.status === 'active' && Object.values(p.categories).some(Boolean)).length} friends · Streaming only</span>
            </div>
            <div className="toolbar">
              <Tabs
                label="Filter library"
                value={filter}
                onChange={setFilter}
                items={[
                  { id: 'all', label: 'All', count: all.length },
                  { id: 'movies', label: 'Movies', count: movies.length },
                  { id: 'shows', label: 'Shows', count: shows.length },
                  { id: 'music', label: 'Music', count: albums.length },
                  { id: 'videos', label: 'Videos', count: videos.length },
                ]}
              />
              <span className="spacer" />
              <Select label="Sort" value={sort} onChange={setSort} options={sortOptions} icon="sort" align="end" />
              <Segmented label="View" value={view} onChange={setView} options={[{ value: 'grid', label: 'Grid' }, { value: 'list', label: 'List' }]} />
            </div>

            {all.length === 0 ? (
              <EmptyState icon="library" title="Your library is empty" description="Add a folder and VibeVault will organise it with artwork and details." />
            ) : filter === 'all' && view === 'grid' ? (
              <>
                <ContentRow title="My Movies" seeAllTo={paths.movies}>{sorted.movies.map((m) => <MovieCard key={m.id} movie={m} />)}</ContentRow>
                <ContentRow title="My Shows" seeAllTo={paths.shows}>{sorted.shows.map((s) => <ShowCard key={s.id} show={s} />)}</ContentRow>
                <ContentRow title="My Music" seeAllTo={paths.music}>{sorted.albums.map((a) => <AlbumCard key={a.id} album={a} />)}</ContentRow>
                <ContentRow title="My Videos" seeAllTo={paths.videos}>{sorted.videos.map((v) => <VideoCard key={v.id} video={v} />)}</ContentRow>
                {favorites.length > 0 ? (
                  <ContentRow title="Favorites">{favorites.map((f) => <MediaCardFor key={f.id} item={f} />)}</ContentRow>
                ) : (
                  <section className="row-section"><h2>Favorites</h2><EmptyState compact icon="heart" title="No favorites" description="Heart something to pin it here." /></section>
                )}
                <ContentRow title="Recently Added">{recentlyAdded.map((m) => <MediaCardFor key={m.id} item={m} />)}</ContentRow>
              </>
            ) : selected.length === 0 ? (
              <EmptyState compact icon="search" title="Nothing here yet" description="This part of your library is empty." />
            ) : view === 'grid' ? (
              <div className={`grid ${filter === 'videos' ? 'grid--land' : filter === 'music' ? 'grid--square' : ''}`}>{selected.map((m) => <MediaCardFor key={m.id} item={m} />)}</div>
            ) : (
              <LibraryTable items={selected} />
            )}
          </div>
        );
      }}
    </AsyncView>
  );
}

function LibraryTable({ items }: { items: AnyMedia[] }) {
  return (
    <div className="table" role="table" aria-label="Library items">
      <div className="table__row table__head" role="row">
        <span role="columnheader">Title</span>
        <span role="columnheader">Type</span>
        <span role="columnheader">Year</span>
        <span role="columnheader">Added</span>
        <span role="columnheader" className="table__num">Plays</span>
      </div>
      {items.map((m) => {
        const art = m.kind === 'album' || m.kind === 'song' ? m.artwork.square : (m.artwork.thumb ?? m.artwork.poster);
        return (
          <Link key={m.id} to={detailPath(m)} className="table__row" role="row">
            <span role="cell" className="table__title">
              <img src={art} alt="" loading="lazy" />
              <strong className="truncate">{m.title}</strong>
            </span>
            <span role="cell" className="dim">{KIND_LABEL[m.kind]}</span>
            <span role="cell" className="dim">{m.year}</span>
            <span role="cell" className="dim">{formatDate(m.addedAt)}</span>
            <span role="cell" className="dim table__num">{m.playCount}</span>
          </Link>
        );
      })}
    </div>
  );
}
