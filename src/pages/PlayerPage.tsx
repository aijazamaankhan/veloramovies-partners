import { useParams, useNavigate } from 'react-router-dom';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useProgressMap } from '@/hooks/useProgress';
import * as catalog from '@/services/catalog';
import { AccessDeniedState, Button, ErrorState, RetryButton, Skeleton } from '@/components/ui';
import { VideoPlayer } from '@/components/player/VideoPlayer';

/** Full-screen player route (outside the app shell). Access is checked BEFORE the player is created. */
export function PlayerPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const state = useAsync(() => catalog.openPlayable(id), [id]);
  const progress = useProgressMap();
  useDocumentTitle(state.data ? state.data.media.title : 'Player');

  if (state.status === 'loading')
    return (
      <div className="vplayer vplayer--loading" role="status" aria-label="Opening player">
        <Skeleton w="14rem" h="1.2rem" />
        <Skeleton w="22rem" h="2.4rem" />
      </div>
    );

  const back = <Button variant="glass" icon="arrowLeft" onClick={() => navigate(-1)} data-autofocus>Go back</Button>;
  if (state.status === 'error')
    return (
      <div className="vplayer vplayer--error">
        <ErrorState icon="alert" title="This media is currently unavailable." description="We couldn't open this title." action={<>{back}<RetryButton onClick={state.reload} /></>} />
      </div>
    );

  const ctx = state.data;
  if (!ctx.stream.ok)
    return (
      <div className="vplayer vplayer--error">
        <AccessDeniedState reason={ctx.stream.reason} action={<>{back}{ctx.stream.reason === 'owner-offline' && <RetryButton onClick={state.reload} label="Check again" />}</>} />
      </div>
    );

  const saved = progress.get(ctx.media.id);
  const start = saved && saved.positionSec / saved.durationSec < 0.95 ? saved.positionSec : 0;
  return <VideoPlayer key={ctx.media.id} context={ctx} startPositionSec={start} />;
}
