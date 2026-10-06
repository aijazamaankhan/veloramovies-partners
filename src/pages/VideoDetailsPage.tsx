import { useParams } from 'react-router-dom';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useMediaActions } from '@/hooks/useMediaActions';
import { fractionOf, useProgressMap } from '@/hooks/useProgress';
import * as catalog from '@/services/catalog';
import { useUserData } from '@/state/userData';
import { checkStream, friendById } from '@/data/access';
import { formatDate, formatRuntime } from '@/lib';
import { paths } from '@/routes';
import { AccessDeniedState, Badge, Button, IconButton, LinkButton } from '@/components/ui';
import { AsyncView, ContentRow, DetailHero, DetailsSkeleton, Facts, OwnerLine, VideoCard } from '@/components/media';

export function VideoDetailsPage() {
  const { id = '' } = useParams();
  const state = useAsync(() => catalog.getVideoDetails(id), [id]);
  const actions = useMediaActions();
  const data = useUserData();
  const progress = useProgressMap();
  useDocumentTitle(state.data?.video.title);

  return (
    <AsyncView state={state} skeleton={<DetailsSkeleton />}>
      {({ video, owner, related }) => {
        const stream = checkStream(video);
        const frac = fractionOf(progress.get(video.id));
        const names = video.sharedWithIds.map((i) => friendById(i)?.name).filter(Boolean).join(', ');
        const fav = data.isFavorite(video.id);
        return (
          <>
            <DetailHero
              backdrop={video.artwork.backdrop!}
              eyebrow={
                owner ? <OwnerLine owner={owner} /> : video.sharedWithIds.length ? <Badge tone="accent" icon="users">Shared with {names}</Badge> : <Badge tone="private" icon="lock">Private — only you</Badge>
              }
              title={video.title}
              meta={
                <>
                  <span>{video.category}</span>
                  <span>{formatDate(video.recordedAt)}</span>
                  <span>{formatRuntime(video.durationSec)}</span>
                  <Badge tone="quality">{video.resolution}</Badge>
                </>
              }
              description={video.description}
              actions={
                <>
                  <Button variant="primary" size="lg" icon="play" onClick={() => actions.play(video)} data-autofocus>
                    {frac !== undefined ? 'Resume' : 'Play'}
                  </Button>
                  {!owner && <LinkButton variant="glass" size="lg" icon="share" to={paths.sharing()}>Sharing settings</LinkButton>}
                  <IconButton icon="heart" label={fav ? 'Remove from favorites' : 'Add to favorites'} pressed={fav} variant="glass" size="lg" onClick={() => actions.toggleFavorite(video)} />
                </>
              }
              aside={
                <Facts
                  items={[
                    { label: 'Recorded', value: formatDate(video.recordedAt) },
                    { label: 'Category', value: video.category },
                    { label: 'Visibility', value: owner ? `Shared by ${owner.name}` : video.sharedWithIds.length ? `Shared with ${names}` : 'Private' },
                    { label: 'Resolution', value: video.resolution },
                    { label: 'Audio', value: video.audioTracks.map((a) => a.label).join(', ') },
                  ]}
                />
              }
            />
            <div className="page">
              {!stream.ok && <AccessDeniedState compact reason={stream.reason} />}
              {related.length > 0 && (
                <ContentRow title={`More ${video.category.toLowerCase()} videos`}>
                  {related.map((v) => <VideoCard key={v.id} video={v} />)}
                </ContentRow>
              )}
            </div>
          </>
        );
      }}
    </AsyncView>
  );
}
