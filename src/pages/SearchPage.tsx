import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import * as catalog from '@/services/catalog';
import { useUserData } from '@/state/userData';
import { paths } from '@/routes';
import { Avatar, Button, Chip, EmptyState, SearchBar } from '@/components/ui';
import { AlbumCard, ContentRow, MovieCard, SearchSkeleton, ShowCard, SongCard, VideoCard } from '@/components/media';

const SUGGESTIONS = ['Sci-Fi', 'Jazz', 'Family videos', 'Thriller', 'Breaking Example', 'Luna Vale', 'Documentary', 'Alex'];

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function SearchPage() {
  useDocumentTitle('Search');
  const [params, setParams] = useSearchParams();
  const [text, setText] = useState(params.get('q') ?? '');
  const query = useDebounced(text, 300).trim();
  const data = useUserData();
  const input = useRef<HTMLInputElement>(null);
  const state = useAsync(() => catalog.searchAll(query), [query]);

  useEffect(() => {
    input.current?.focus();
  }, []);
  useEffect(() => {
    setParams(query ? { q: query } : {}, { replace: true });
  }, [query, setParams]);

  const searching = text.trim() !== '' && (text.trim() !== query || state.status === 'loading');
  const results = state.data;
  const total = results ? results.movies.length + results.shows.length + results.music.length + results.videos.length + results.friends.length : 0;
  const run = (q: string) => {
    setText(q);
    data.addRecentSearch(q);
  };

  return (
    <div className="page page--top search">
      <div className="search__bar">
        <SearchBar ref={input} value={text} onChange={setText} onSubmit={() => data.addRecentSearch(text)} placeholder="Search movies, shows, music, videos and friends' libraries" shortcutHint="/" data-autofocus />
      </div>

      {!text.trim() ? (
        <div className="search__idle">
          <section>
            <div className="section__head">
              <h2>Recent searches</h2>
              <span className="spacer" />
              {data.recentSearches.length > 0 && <Button variant="ghost" onClick={data.clearRecentSearches}>Clear</Button>}
            </div>
            {data.recentSearches.length ? (
              <div className="row row--wrap">
                {data.recentSearches.map((r) => (
                  <Chip key={r} onClick={() => run(r)}>{r}</Chip>
                ))}
              </div>
            ) : (
              <p className="dim">Your recent searches will appear here.</p>
            )}
          </section>
          <section className="section">
            <div className="section__head"><h2>Suggested searches</h2></div>
            <div className="row row--wrap">
              {SUGGESTIONS.map((s) => (
                <Chip key={s} onClick={() => run(s)}>{s}</Chip>
              ))}
            </div>
          </section>
        </div>
      ) : searching || !results ? (
        <SearchSkeleton />
      ) : total === 0 ? (
        <EmptyState icon="search" title={`No results for “${query}”`} description="Check the spelling or try a broader term. Titles friends haven't shared with you won't appear." action={<Button onClick={() => setText('')}>Clear search</Button>} />
      ) : (
        <div aria-live="polite">
          <p className="dim sr-only">{total} results</p>
          {results.movies.length > 0 && <ContentRow title="Movies" subtitle={`${results.movies.length}`}>{results.movies.map((m) => <MovieCard key={m.id} movie={m} />)}</ContentRow>}
          {results.shows.length > 0 && <ContentRow title="Shows" subtitle={`${results.shows.length}`}>{results.shows.map((s) => <ShowCard key={s.id} show={s} />)}</ContentRow>}
          {results.music.length > 0 && (
            <ContentRow title="Music" subtitle={`${results.music.length}`}>
              {results.music.map((x) => (x.kind === 'album' ? <AlbumCard key={x.id} album={x} /> : <SongCard key={x.id} song={x} />))}
            </ContentRow>
          )}
          {results.videos.length > 0 && <ContentRow title="Videos" subtitle={`${results.videos.length}`}>{results.videos.map((v) => <VideoCard key={v.id} video={v} />)}</ContentRow>}
          {results.friends.length > 0 && (
            <section className="row-section">
              <div className="row-section__head"><h2>Friends</h2><span className="dim">{results.friends.length}</span></div>
              <ul className="friend-results">
                {results.friends.map((f) => (
                  <li key={f.id}>
                    <Link to={paths.friend(f.id)} className="friend-result">
                      <Avatar spec={f.avatar} size="md" presence={f.presence} />
                      <span><strong>{f.name}'s Library</strong><span className="dim"> · {f.lastSeenLabel}</span></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

