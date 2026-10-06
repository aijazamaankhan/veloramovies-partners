import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Episode } from '@/models';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useMediaActions } from '@/hooks/useMediaActions';
import { fractionOf, useProgressMap } from '@/hooks/useProgress';
import * as catalog from '@/services/catalog';
import { useUserData } from '@/state/userData';
import { formatRuntime, plural } from '@/lib';
import { paths } from '@/routes';
import { Badge, Button, Icon, IconButton, ProgressBar, Tabs } from '@/components/ui';
import { AsyncView, ContentRow, DetailHero, DetailsSkeleton, Facts, OwnerLine, ShowCard } from '@/components/media';

export function ShowDetailsPage() {
  const { id = '' } = useParams();
  const state = useAsync(() => catalog.getShowDetails(id), [id]);
  useDocumentTitle(state.data?.show.title);
  return (
    <AsyncView state={state} skeleton={<DetailsSkeleton />}>
      {(data) => <ShowContent key={id} {...data} />}
    </AsyncView>
  );
}

function ShowContent({ show, episodes, owner, similar }: { show: import('@/models').TVShow; episodes: Episode[]; owner?: import('@/models').Friend; similar: import('@/models').TVShow[] }) {
  const actions = useMediaActions();
  const data = useUserData();
  const progress = useProgressMap();

  // Where "Play" should go: first partially-watched episode, else first unwatched, else the start.
  const resume = useMemo(() => {
    const partial = episodes.find((e) => {
      const f = fractionOf(progress.get(e.id));
      return f !== undefined && f > 0 && f < 0.95;
    });
    return partial ?? episodes.find((e) => (fractionOf(progress.get(e.id)) ?? 0) < 0.95) ?? episodes[0];
  }, [episodes, progress]);
  const [season, setSeason] = useState(resume?.seasonNumber ?? 1);
  const seasonEpisodes = episodes.filter((e) => e.seasonNumber === season);
  const resumeFrac = fractionOf(progress.get(resume.id));
  const label = `S${resume.seasonNumber}:E${resume.episodeNumber}`;
  const inList = data.inMyList(show.id);

  return (
    <>
      <DetailHero
        backdrop={show.artwork.backdrop!}
        poster={show.artwork.poster}
        eyebrow={owner ? <OwnerLine owner={owner} /> : <span className="eyebrow">TV Show · Your library</span>}
        title={show.title}
        meta={
          <>
            <span className="hero__score"><Icon name="star" size="1em" /> {show.score.toFixed(1)}</span>
            <span>{show.year}</span>
            <span>{plural(show.seasons.length, 'Season')}</span>
            <Badge tone="quality">{show.contentRating}</Badge>
            <Badge tone="quality">{show.resolution}</Badge>
            <span>{show.genres.join(' • ')}</span>
          </>
        }
        description={show.description}
        actions={
          <>
            <Button variant="primary" size="lg" icon="play" onClick={() => actions.play(resume)} data-autofocus>
              {resumeFrac ? `Continue ${label}` : `Play ${label}`}
            </Button>
            <Button variant="glass" size="lg" icon={inList ? 'check' : 'plus'} onClick={() => actions.toggleList(show)} aria-pressed={inList}>
              {inList ? 'In My List' : 'Add to My List'}
            </Button>
            <IconButton icon="heart" label={data.isFavorite(show.id) ? 'Remove from favorites' : 'Add to favorites'} pressed={data.isFavorite(show.id)} variant="glass" size="lg" onClick={() => actions.toggleFavorite(show)} />
          </>
        }
        aside={
          <Facts
            items={[
              { label: 'Creator', value: show.creator },
              { label: 'Cast', value: show.cast.join(', ') },
              { label: 'Episodes', value: `${episodes.length} across ${plural(show.seasons.length, 'season')}` },
              { label: 'Resolution', value: show.resolution },
              { label: 'Source', value: owner ? `${owner.name}’s library` : 'Your library' },
            ]}
          />
        }
      />
      <div className="page">
        <section className="section episodes" aria-label="Episodes">
          <div className="section__head">
            <h2>Episodes</h2>
            <span className="spacer" />
            {show.seasons.length > 1 && <Tabs variant="pill" label="Season" value={String(season)} onChange={(v) => setSeason(Number(v))} items={show.seasons.map((s) => ({ id: String(s.number), label: s.title }))} />}
          </div>
          <ol className="episode-list">
            {seasonEpisodes.map((ep) => {
              const p = progress.get(ep.id);
              const f = fractionOf(p);
              const watched = f !== undefined && f >= 0.95;
              return (
                <li key={ep.id}>
                  <Link to={paths.watch(ep.id)} className={`episode ${watched ? 'is-watched' : ''}`} aria-label={`Episode ${ep.episodeNumber}: ${ep.title}, ${formatRuntime(ep.durationSec)}${watched ? ', watched' : f ? `, ${Math.round(f * 100)}% watched` : ''}`}>
                    <span className="episode__num">{ep.episodeNumber}</span>
                    <span className="episode__thumb">
                      <img src={ep.artwork.thumb} alt="" loading="lazy" />
                      <span className="episode__play"><Icon name="play" size="1.4em" /></span>
                      {f !== undefined && !watched && <ProgressBar value={f} className="episode__progress" label="Episode progress" />}
                    </span>
                    <span className="episode__body">
                      <span className="episode__title">
                        <strong>{ep.title}</strong>
                        <span className="dim">{formatRuntime(ep.durationSec)}</span>
                      </span>
                      <span className="muted clamp-2">{ep.description}</span>
                    </span>
                    <span className="episode__state">
                      {watched ? <Badge tone="success" icon="check">Watched</Badge> : f ? <Badge tone="accent">Continue</Badge> : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
        {similar.length > 0 && (
          <ContentRow title="More like this">
            {similar.map((s) => <ShowCard key={s.id} show={s} />)}
          </ContentRow>
        )}
      </div>
    </>
  );
}
