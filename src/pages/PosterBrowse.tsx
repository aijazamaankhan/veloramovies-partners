import { useMemo, useState } from 'react';
import type { AsyncState } from '@/hooks/useAsync';
import type { Movie, SortKey, TVShow } from '@/models';
import { EmptyState, Select, Tabs, Button, LinkButton } from '@/components/ui';
import { AsyncView, BrowseSkeleton, HeroBanner, MovieCard, ShowCard, heroFromMovie, heroFromShow } from '@/components/media';
import { genresOf, sortItems } from '@/data/queries';
import { isMine } from '@/data/access';
import { useMediaActions } from '@/hooks/useMediaActions';
import { sortOptions } from '@/lib';
import { paths } from '@/routes';

type Source = 'all' | 'mine' | 'shared';
type Item = Movie | TVShow;
interface BrowseData {
  items: Item[];
  featured: Item[];
}

interface Props {
  state: AsyncState<BrowseData> & { reload: () => void };
  kind: 'movies' | 'shows';
}

/** Shared browse screen for Movies and TV Shows: hero, source tabs, genre + sort filters, poster grid. */
export function PosterBrowse({ state, kind }: Props) {
  return (
    <AsyncView state={state} skeleton={<BrowseSkeleton />}>
      {(data) => <BrowseContent kind={kind} {...data} />}
    </AsyncView>
  );
}

function BrowseContent({ kind, items, featured }: BrowseData & { kind: Props['kind'] }) {
  const [source, setSource] = useState<Source>('all');
  const [genre, setGenre] = useState('All');
  const [sort, setSort] = useState<SortKey>('recent');
  const actions = useMediaActions();
  const noun = kind === 'movies' ? 'Movies' : 'TV Shows';

  const genres = useMemo(() => ['All', ...genresOf(items)], [items]);
  const list = useMemo(() => {
    const filtered = items.filter((i) => (source === 'all' || (source === 'mine') === isMine(i.ownerId)) && (genre === 'All' || i.genres.includes(genre)));
    return sortItems(filtered, sort);
  }, [items, source, genre, sort]);
  const mine = items.filter((i) => isMine(i.ownerId)).length;

  if (items.length === 0)
    return (
      <div className="page page--top">
        <EmptyState
          icon={kind === 'movies' ? 'film' : 'tv'}
          title={`No ${noun.toLowerCase()} yet`}
          description={`Add a folder to your library and your ${noun.toLowerCase()} will appear here with artwork and details.`}
          action={<LinkButton variant="primary" to={paths.library}>Go to My Library</LinkButton>}
        />
      </div>
    );

  return (
    <>
      <HeroBanner
        compact
        items={featured.map((f, i) => (f.kind === 'movie' ? heroFromMovie(f, () => actions.play(f), i === 0 ? 'Top pick' : undefined) : heroFromShow(f, () => actions.play(f), i === 0 ? 'Top pick' : undefined)))}
      />
      <div className="page browse">
        <h1 className="browse__title">{noun}</h1>
        <div className="toolbar">
          <Tabs
            label="Source"
            value={source}
            onChange={setSource}
            items={[
              { id: 'all', label: `All ${noun}`, count: items.length },
              { id: 'mine', label: `My ${noun}`, count: mine },
              { id: 'shared', label: 'Shared with me', count: items.length - mine, icon: 'users' },
            ]}
          />
          <span className="spacer" />
          <Select label="Genre" value={genre} onChange={setGenre} options={genres.map((g) => ({ value: g, label: g }))} icon="filter" />
          <Select label="Sort" value={sort} onChange={setSort} options={sortOptions} icon="sort" align="end" />
        </div>
        {list.length === 0 ? (
          <EmptyState
            compact
            icon="search"
            title={`No ${noun.toLowerCase()} match`}
            description="Try a different genre or source."
            action={<Button onClick={() => { setSource('all'); setGenre('All'); }}>Clear filters</Button>}
          />
        ) : (
          <div className="grid" aria-label={noun}>
            {list.map((i) => (i.kind === 'movie' ? <MovieCard key={i.id} movie={i} /> : <ShowCard key={i.id} show={i} />))}
          </div>
        )}
      </div>
    </>
  );
}
