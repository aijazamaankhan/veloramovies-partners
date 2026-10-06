import { Link, useNavigate, useParams } from 'react-router-dom';
import type { ShareCategory } from '@/models';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useProgressMap, fractionOf } from '@/hooks/useProgress';
import * as catalog from '@/services/catalog';
import { CatalogError } from '@/services/catalog';
import { paths } from '@/routes';
import { plural } from '@/lib';
import { AccessDeniedState, Avatar, Badge, EmptyState, ErrorState, Icon, IconButton, LinkButton, RetryButton } from '@/components/ui';
import { AlbumCard, AsyncView, ContentRow, FriendLibrarySkeleton, MovieCard, ShowCard, VideoCard } from '@/components/media';

const SECTIONS: { key: ShareCategory; label: string }[] = [
  { key: 'movies', label: 'Movies' },
  { key: 'shows', label: 'TV Shows' },
  { key: 'music', label: 'Music' },
  { key: 'videos', label: 'Videos' },
];

export function FriendLibraryPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const state = useAsync(() => catalog.getFriendLibrary(id), [id]);
  const progress = useProgressMap();
  useDocumentTitle(state.data ? `${state.data.friend.name}'s Library` : undefined);

  return (
    <AsyncView
      state={state}
      skeleton={<FriendLibrarySkeleton />}
      renderError={(error, reload) => {
        const code = error instanceof CatalogError ? error.code : 'library-error';
        const back = <LinkButton variant="glass" icon="arrowLeft" to={paths.friends}>Back to friends</LinkButton>;
        return (
          <div className="page page--top">
            {code === 'revoked' ? (
              <AccessDeniedState reason="revoked" action={back} />
            ) : code === 'not-found' ? (
              <ErrorState icon="search" title="We couldn't find that library" action={back} />
            ) : (
              <ErrorState
                icon="alert"
                title="Unable to load this library."
                description="The connection to their media server hiccuped. Your access hasn't changed."
                action={
                  <>
                    <RetryButton
                      onClick={() => {
                        catalog.retryLibrary(`lib-${id}`); // mock: the second attempt succeeds
                        reload();
                      }}
                    />
                    {back}
                  </>
                }
              />
            )}
          </div>
        );
      }}
    >
      {({ friend, library, movies, shows, albums, videos, locked, ownerOffline }) => {
        const total = movies.length + shows.length + albums.length + videos.length;
        return (
          <div className="page page--top">
            <header className="friend-head">
              <Avatar spec={friend.avatar} size="xl" presence={friend.presence} />
              <div className="friend-head__text">
                <span className="eyebrow">Shared library</span>
                <h1>{friend.name}'s Library</h1>
                <div className="row row--wrap">
                  <span className={`presence presence--${friend.presence}`}>{friend.lastSeenLabel}</span>
                  <span className="dim">·</span>
                  <span className="muted">{plural(total, 'title')} shared with you</span>
                  <span className="dim">·</span>
                  <span className="dim">{library.lastSyncedLabel}</span>
                </div>
                <div className="row row--wrap" style={{ marginTop: '0.4rem' }}>
                  <Badge tone="success" icon="shield">Stream only</Badge>
                  <span className="dim">Titles play straight from {friend.name}'s computer. They can't be downloaded, saved or copied.</span>
                </div>
              </div>
              <IconButton icon="arrowLeft" label="Back to friends" variant="glass" onClick={() => navigate(-1)} />
            </header>

            {ownerOffline && (
              <div className="notice notice--warn" role="status">
                <Icon name="wifiOff" />
                <div>
                  <strong>{friend.name} is offline.</strong> <span className="muted">You can browse their library, but streaming starts again once they're back online.</span>
                </div>
              </div>
            )}

            {SECTIONS.map(({ key, label }) => {
              if (locked.includes(key))
                return (
                  <section key={key} className="row-section locked-section">
                    <h2>{label}</h2>
                    <div className="locked-section__body">
                      <Icon name="lock" />
                      <span>{friend.name} hasn't shared {label} with you.</span>
                    </div>
                  </section>
                );
              const count = { movies: movies.length, shows: shows.length, music: albums.length, videos: videos.length }[key];
              if (count === 0)
                return (
                  <section key={key} className="row-section">
                    <h2>{label}</h2>
                    <EmptyState compact icon="folder" title={`No ${label.toLowerCase()} yet`} description={`${friend.name} hasn't added any ${label.toLowerCase()} to share.`} />
                  </section>
                );
              return (
                <ContentRow key={key} title={label} subtitle={plural(count, 'title')}>
                  {key === 'movies' && movies.map((m) => <MovieCard key={m.id} movie={m} progress={fractionOf(progress.get(m.id))} />)}
                  {key === 'shows' && shows.map((s) => <ShowCard key={s.id} show={s} />)}
                  {key === 'music' && albums.map((a) => <AlbumCard key={a.id} album={a} />)}
                  {key === 'videos' && videos.map((v) => <VideoCard key={v.id} video={v} />)}
                </ContentRow>
              );
            })}
            <p className="dim footnote">
              <Icon name="info" size="1em" /> Want to change what you share back? <Link to={paths.sharing(friend.id)} className="link">Manage sharing for {friend.name}</Link>.
            </p>
          </div>
        );
      }}
    </AsyncView>
  );
}
