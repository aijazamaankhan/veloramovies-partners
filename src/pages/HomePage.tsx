import { useMemo } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { useMediaActions } from '@/hooks/useMediaActions';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import * as catalog from '@/services/catalog';
import { lookup } from '@/data/queries';
import { useProfiles } from '@/state/profiles';
import { useUserData } from '@/state/userData';
import { paths } from '@/routes';
import { EmptyState, LinkButton } from '@/components/ui';
import {
  AlbumCard, AsyncView, ContentRow, EpisodeCard, FriendLibraryCard, HeroBanner, HomeSkeleton, MediaCardFor, MovieCard, ShowCard,
  SongCard, VideoCard, heroFromMovie, heroFromShow,
} from '@/components/media';

export function HomePage() {
  useDocumentTitle('Home');
  const { active } = useProfiles();
  const data = useUserData();
  const actions = useMediaActions();
  const state = useAsync(() => catalog.getHome(active?.id ?? ''), [active?.id]);
  const favorites = useMemo(() => lookup(data.favoriteIds).slice(0, 14), [data.favoriteIds]);

  return (
    <AsyncView state={state} skeleton={<HomeSkeleton />}>
      {(home) => (
        <>
          <HeroBanner
            items={home.hero.map((item, i) => {
              const eyebrow = i === 0 ? 'Featured tonight' : 'In your library';
              return item.kind === 'movie' ? heroFromMovie(item, () => actions.play(item), eyebrow) : heroFromShow(item, () => actions.play(item), eyebrow);
            })}
          />
          <div className="page home-rows">
            {home.continueWatching.length > 0 ? (
              <ContentRow title={`Continue Watching for ${active?.name ?? 'you'}`}>
                {home.continueWatching.map(({ media, progress, show }) =>
                  media.kind === 'movie' ? (
                    <MovieCard key={media.id} movie={media} variant="landscape" progress={progress.positionSec / progress.durationSec} />
                  ) : media.kind === 'episode' ? (
                    <EpisodeCard key={media.id} episode={media} show={show} progress={progress} />
                  ) : (
                    <VideoCard key={media.id} video={media} progress={progress.positionSec / progress.durationSec} />
                  ),
                )}
              </ContentRow>
            ) : (
              <section className="row-section">
                <h2>Continue Watching</h2>
                <EmptyState compact icon="clock" title="No recently watched content" description="Start something and it will wait for you here, right where you stopped." action={<LinkButton variant="primary" to={paths.movies} icon="film">Browse movies</LinkButton>} />
              </section>
            )}
            <ContentRow title="Recently Added" seeAllTo={paths.library}>
              {home.recentlyAdded.map((m) => (m.kind === 'movie' ? <MovieCard key={m.id} movie={m} /> : <ShowCard key={m.id} show={m} />))}
            </ContentRow>
            <ContentRow title="Recommended For You" subtitle="Based on what you watch" seeAllTo={paths.movies}>
              {home.recommended.map((m) => <MovieCard key={m.id} movie={m} />)}
            </ContentRow>
            <ContentRow title="My Movies" seeAllTo={paths.movies}>
              {home.myMovies.map((m) => <MovieCard key={m.id} movie={m} />)}
            </ContentRow>
            <ContentRow title="TV Shows" seeAllTo={paths.shows}>
              {home.myShows.map((s) => <ShowCard key={s.id} show={s} />)}
            </ContentRow>
            <ContentRow title="Music" seeAllTo={paths.music}>
              {home.albums.map((a) => <AlbumCard key={a.id} album={a} />)}
            </ContentRow>
            <ContentRow title="Friends' Libraries" subtitle="Streamed live from their computers" seeAllTo={paths.friends}>
              {home.friendLibraries.map((s) => <FriendLibraryCard key={s.friend.id} summary={s} />)}
            </ContentRow>
            <ContentRow title="Recently Played" seeAllTo={paths.music}>
              {home.recentlyPlayed.map((x) => (x.kind === 'album' ? <AlbumCard key={x.id} album={x} /> : <SongCard key={x.id} song={x} />))}
            </ContentRow>
            {favorites.length > 0 ? (
              <ContentRow title="Your Favorites" seeAllTo={paths.profile}>
                {favorites.map((m) => <MediaCardFor key={m.id} item={m} />)}
              </ContentRow>
            ) : (
              <section className="row-section">
                <h2>Your Favorites</h2>
                <EmptyState compact icon="heart" title="No favorites yet" description="Tap the heart on anything you love and it will show up here." />
              </section>
            )}
          </div>
        </>
      )}
    </AsyncView>
  );
}
