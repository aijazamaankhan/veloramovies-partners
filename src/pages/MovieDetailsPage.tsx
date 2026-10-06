import { useParams } from 'react-router-dom';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useMediaActions } from '@/hooks/useMediaActions';
import { fractionOf, useProgressMap } from '@/hooks/useProgress';
import * as catalog from '@/services/catalog';
import { useUserData } from '@/state/userData';
import { checkStream } from '@/data/access';
import { formatRuntime } from '@/lib';
import { Badge, Button, Icon, IconButton, Menu } from '@/components/ui';
import { AccessDeniedState } from '@/components/ui';
import { AsyncView, ContentRow, DetailHero, DetailsSkeleton, Facts, MovieCard, OwnerLine } from '@/components/media';

export function MovieDetailsPage() {
  const { id = '' } = useParams();
  const state = useAsync(() => catalog.getMovieDetails(id), [id]);
  const actions = useMediaActions();
  const data = useUserData();
  const progress = useProgressMap();
  useDocumentTitle(state.data?.movie.title);

  return (
    <AsyncView state={state} skeleton={<DetailsSkeleton />}>
      {({ movie, owner, similar }) => {
        const frac = fractionOf(progress.get(movie.id));
        const stream = checkStream(movie);
        const inList = data.inMyList(movie.id);
        const fav = data.isFavorite(movie.id);
        return (
          <>
            <DetailHero
              backdrop={movie.artwork.backdrop!}
              poster={movie.artwork.poster}
              eyebrow={owner ? <OwnerLine owner={owner} /> : <span className="eyebrow">Your library</span>}
              title={movie.title}
              meta={
                <>
                  <span className="hero__score"><Icon name="star" size="1em" /> {movie.score.toFixed(1)}</span>
                  <span>{movie.year}</span>
                  <span>{formatRuntime(movie.durationSec)}</span>
                  <Badge tone="quality">{movie.contentRating}</Badge>
                  <Badge tone="quality">{movie.resolution}</Badge>
                  {movie.hdr && <Badge tone="quality">HDR</Badge>}
                  <span>{movie.genres.join(' • ')}</span>
                </>
              }
              description={movie.description}
              actions={
                <>
                  <Button variant="primary" size="lg" icon="play" onClick={() => actions.play(movie)} data-autofocus>
                    {frac !== undefined ? `Resume · ${formatRuntime(movie.durationSec * (1 - frac))} left` : 'Play'}
                  </Button>
                  <Button variant="glass" size="lg" icon={inList ? 'check' : 'plus'} onClick={() => actions.toggleList(movie)} aria-pressed={inList}>
                    {inList ? 'In My List' : 'Add to My List'}
                  </Button>
                  <IconButton icon="heart" label={fav ? 'Remove from favorites' : 'Add to favorites'} pressed={fav} variant="glass" size="lg" onClick={() => actions.toggleFavorite(movie)} />
                  <Menu align="start" title="More" items={actions.menuFor(movie).filter((i) => i.id !== 'play' && i.id !== 'list' && i.id !== 'details')}>
                    <IconButton icon="more" label="More options" variant="glass" size="lg" />
                  </Menu>
                </>
              }
              aside={
                <Facts
                  items={[
                    { label: 'Audio', value: movie.audioTracks.map((a) => a.label).join(', ') },
                    { label: 'Subtitles', value: movie.subtitleTracks.map((s) => s.language).join(', ') },
                    { label: 'Resolution', value: movie.hdr ? `${movie.resolution} · HDR` : movie.resolution },
                    { label: 'Source', value: owner ? `${owner.name}’s library` : 'Your library' },
                    { label: 'Director', value: movie.director },
                    { label: 'Cast', value: movie.cast.join(', ') },
                  ]}
                />
              }
            />
            <div className="page">
              {!stream.ok && (
                <AccessDeniedState
                  compact
                  reason={stream.reason}
                />
              )}
              {frac !== undefined && stream.ok && <p className="dim">You’ve watched {Math.round(frac * 100)}% of this title.</p>}
              {similar.length > 0 && (
                <ContentRow title="More like this">
                  {similar.map((m) => (
                    <MovieCard key={m.id} movie={m} />
                  ))}
                </ContentRow>
              )}
            </div>
          </>
        );
      }}
    </AsyncView>
  );
}
