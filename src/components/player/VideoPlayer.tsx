import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PlaybackState } from '@/models';
import { Badge, Button, Icon, IconButton, Menu, Slider } from '../ui';
import { formatDuration } from '@/lib';
import { lastInputWasKeyboard } from '@/hooks/useInputModality';
import { focusElement } from '@/hooks/useSpatialNavigation';
import { episodesOf } from '@/data/queries';
import { paths } from '@/routes';
import { useSettings } from '@/state/settings';
import type { PlayableContext } from '@/services/catalog';

const IDLE_MS = 3500;
const SUBTITLE_SAMPLE: Record<string, string> = {
  English: 'This is where subtitles will appear.',
  Spanish: 'Aquí es donde aparecerán los subtítulos.',
  French: 'Les sous-titres apparaîtront ici.',
  German: 'Hier erscheinen die Untertitel.',
  Portuguese: 'É aqui que as legendas vão aparecer.',
};

interface VideoPlayerProps {
  context: PlayableContext;
  startPositionSec: number;
}

/**
 * Mock video player UI. There is NO video element and NO media: a timer advances a fake playhead over the
 * title's artwork so the full control surface can be reviewed. There is deliberately no download control.
 */
export function VideoPlayer({ context, startPositionSec }: VideoPlayerProps) {
  const { media, show, prev, next } = context;
  const navigate = useNavigate();
  const { settings } = useSettings();
  const root = useRef<HTMLDivElement>(null);
  const playBtn = useRef<HTMLButtonElement>(null);

  const defaultSub = media.subtitleTracks.find((s) => s.language === settings.defaultSubtitles)?.id ?? null;
  const defaultAudio = media.audioTracks.find((a) => a.language === settings.defaultAudio)?.id ?? media.audioTracks[0]?.id ?? null;

  const [state, setState] = useState<PlaybackState>({
    mediaId: media.id,
    isPlaying: true,
    positionSec: Math.min(startPositionSec, media.durationSec - 5),
    durationSec: media.durationSec,
    volume: 0.8,
    muted: false,
    audioTrackId: defaultAudio,
    subtitleTrackId: defaultSub,
    quality: settings.videoQuality === 'Auto' ? 'Auto' : media.resolution,
  });
  const [idle, setIdle] = useState(false);
  const [flash, setFlash] = useState<'play' | 'pause' | 'back' | 'forward' | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const ended = state.positionSec >= state.durationSec - 0.01;
  const patch = (p: Partial<PlaybackState>) => setState((s) => ({ ...s, ...p }));

  /* ---- mock playback clock ---- */
  useEffect(() => {
    if (!state.isPlaying || ended) return;
    const id = window.setInterval(() => setState((s) => ({ ...s, positionSec: Math.min(s.durationSec, s.positionSec + 0.5) })), 500);
    return () => window.clearInterval(id);
  }, [state.isPlaying, ended]);

  /* ---- end of title: up next countdown ---- */
  useEffect(() => {
    if (!ended) return setCountdown(null);
    patch({ isPlaying: false });
    if (next && settings.autoplayNext) setCountdown(6);
  }, [ended, next, settings.autoplayNext]);
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) return void (next && navigate(paths.watch(next.id), { replace: true }));
    const t = window.setTimeout(() => setCountdown((c) => (c === null ? c : c - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [countdown, next, navigate]);

  /* ---- controls auto-hide ---- */
  const idleTimer = useRef<number | undefined>(undefined);
  const wake = useCallback(() => {
    setIdle((was) => {
      if (was && lastInputWasKeyboard()) requestAnimationFrame(() => playBtn.current && focusElement(playBtn.current));
      return false;
    });
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      if (!document.querySelector('[data-focus-scope]')) setIdle(true);
    }, IDLE_MS);
  }, []);
  useEffect(() => {
    wake();
    return () => window.clearTimeout(idleTimer.current);
  }, [wake, state.isPlaying]);
  useEffect(() => {
    if (!state.isPlaying) {
      window.clearTimeout(idleTimer.current);
      setIdle(false);
    }
  }, [state.isPlaying]);

  const doFlash = (f: typeof flash) => {
    setFlash(f);
    window.setTimeout(() => setFlash(null), 600);
  };
  const toggle = useCallback(() => {
    setState((s) => {
      if (s.positionSec >= s.durationSec - 0.01) return { ...s, positionSec: 0, isPlaying: true };
      return { ...s, isPlaying: !s.isPlaying };
    });
    setFlash((f) => (f === 'play' ? 'pause' : 'play'));
    window.setTimeout(() => setFlash(null), 600);
  }, []);
  const seekBy = useCallback((delta: number) => {
    setState((s) => ({ ...s, positionSec: Math.max(0, Math.min(s.durationSec, s.positionSec + delta)) }));
    doFlash(delta < 0 ? 'back' : 'forward');
  }, []);
  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen?.();
    else void root.current?.requestFullscreen?.().catch(() => undefined);
  }, []);
  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => {
      document.removeEventListener('fullscreenchange', onFs);
      if (document.fullscreenElement) void document.exitFullscreen?.();
    };
  }, []);

  /* ---- keyboard / remote ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (document.querySelector('[data-focus-scope]')) return;
      const k = e.key.toLowerCase();
      const wasIdle = idle;
      wake();
      const onButton = (e.target as HTMLElement).matches?.('button, a, [role="slider"]');

      if (['ArrowLeft', 'ArrowRight'].includes(e.key) && !wasIdle && onButton) return; // directional focus handles it
      if (e.key === 'ArrowLeft') return seekBy(-10), e.preventDefault();
      if (e.key === 'ArrowRight') return seekBy(10), e.preventDefault();
      if (['ArrowUp', 'ArrowDown'].includes(e.key) && wasIdle) return void e.preventDefault();
      if (k === 'j') seekBy(-10);
      else if (k === 'l') seekBy(10);
      else if (k === 'k' || (e.key === ' ' && !(e.target as HTMLElement).matches?.('button, a, [role="slider"]'))) toggle();
      else if (k === 'm') setState((s) => ({ ...s, muted: !s.muted }));
      else if (k === 'f') toggleFullscreen();
      else if (k === 'c') setState((s) => ({ ...s, subtitleTrackId: s.subtitleTrackId ? null : media.subtitleTracks[0]?.id ?? null }));
      else if (k === 'n' && next) navigate(paths.watch(next.id), { replace: true });
      else if (k === 'p' && prev) navigate(paths.watch(prev.id), { replace: true });
      else if (e.key === '-' || e.key === '_') setState((s) => ({ ...s, volume: Math.max(0, s.volume - 0.1), muted: false }));
      else if (e.key === '=' || e.key === '+') setState((s) => ({ ...s, volume: Math.min(1, s.volume + 0.1), muted: false }));
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [idle, wake, seekBy, toggle, toggleFullscreen, next, prev, navigate, media.subtitleTracks]);

  const sub = media.subtitleTracks.find((s) => s.id === state.subtitleTrackId);
  const audio = media.audioTracks.find((a) => a.id === state.audioTrackId);
  const effective = state.quality === 'Auto' ? media.resolution : state.quality;
  const title = show ? show.title : media.title;
  const subtitle = media.kind === 'episode' ? `S${media.seasonNumber}:E${media.episodeNumber} · ${media.title}` : media.kind === 'video' ? media.category : String(media.year);
  const backdrop = media.artwork.backdrop ?? media.artwork.thumb;
  const qualities = (['4K', '1080p', '720p', '480p'] as const).filter((q) => ['4K', '1080p', '720p', '480p'].indexOf(q) >= ['4K', '1080p', '720p', '480p'].indexOf(media.resolution));
  const episodes = media.kind === 'episode' ? episodesOf(media.showId).filter((e) => e.seasonNumber === media.seasonNumber) : [];
  const volumeIcon = state.muted || state.volume === 0 ? 'mute' : 'volume';

  return (
    <div ref={root} className={`vplayer ${idle ? 'is-idle' : ''}`} onPointerMove={wake} onPointerDown={wake} role="region" aria-label={`Player: ${title}`}>
      <div className="vplayer__art" onClick={(e) => e.target === e.currentTarget && toggle()} onDoubleClick={toggleFullscreen}>
        <img src={backdrop} alt="" draggable={false} className={state.isPlaying ? 'is-playing' : ''} />
      </div>
      <div className="vplayer__vignette" />

      {sub && <p className="vplayer__caption" style={{ fontSize: settings.subtitleSize === 'Large' ? '1.9em' : settings.subtitleSize === 'Small' ? '1.1em' : '1.5em', color: settings.subtitleColor === 'Yellow' ? '#ffe66d' : settings.subtitleColor === 'Cyan' ? '#7df3ff' : '#fff', background: settings.subtitleBackground ? 'rgba(0,0,0,.6)' : 'transparent' }}>{SUBTITLE_SAMPLE[sub.language] ?? 'Subtitles'}</p>}

      <div className={`vplayer__flash ${flash ? 'is-on' : ''}`} aria-hidden="true">
        {flash && <Icon name={flash === 'play' ? 'play' : flash === 'pause' ? 'pause' : flash === 'back' ? 'back10' : 'fwd10'} size="3rem" />}
      </div>

      {ended && (
        <div className="vplayer__end" role="status">
          {next ? (
            <>
              <span className="eyebrow">Up next</span>
              <h2>{`S${next.seasonNumber}:E${next.episodeNumber} · ${next.title}`}</h2>
              <p className="muted">{countdown !== null ? `Starting in ${countdown}…` : 'Autoplay is off'}</p>
              <div className="row">
                <Button variant="primary" size="lg" icon="play" onClick={() => navigate(paths.watch(next.id), { replace: true })} data-autofocus>Play now</Button>
                <Button variant="glass" size="lg" onClick={() => setCountdown(null)}>{countdown !== null ? 'Cancel' : 'Stay here'}</Button>
              </div>
            </>
          ) : (
            <>
              <h2>That's a wrap</h2>
              <div className="row">
                <Button variant="primary" size="lg" icon="repeat" onClick={toggle} data-autofocus>Watch again</Button>
                <Button variant="glass" size="lg" icon="arrowLeft" onClick={() => navigate(-1)}>Back</Button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="vplayer__chrome" inert={idle}>
        <header className="vplayer__top">
          <IconButton icon="arrowLeft" label="Back" variant="glass" size="lg" onClick={() => navigate(-1)} />
          <div className="vplayer__title">
            <strong className="truncate">{title}</strong>
            <span className="muted truncate">{subtitle}{context.ownerName ? ` · Shared by ${context.ownerName}` : ''}</span>
          </div>
          <span className="spacer" />
          <Badge tone="warn" icon="info" title="Phase 1 is UI only">Mock playback — no media loaded</Badge>
        </header>

        <div className="vplayer__bottom">
          <div className="vplayer__seek">
            <span className="vplayer__time">{formatDuration(state.positionSec)}</span>
            <Slider label="Seek" value={state.positionSec} max={state.durationSec} step={1} keyStep={10} bigStep={60} buffered={Math.min(state.durationSec, state.positionSec + 240)} onChange={(v) => patch({ positionSec: v })} valueText={`${formatDuration(state.positionSec)} of ${formatDuration(state.durationSec)}`} />
            <span className="vplayer__time">-{formatDuration(state.durationSec - state.positionSec)}</span>
          </div>
          <div className="vplayer__buttons">
            <div className="vplayer__group">
              <IconButton ref={playBtn} icon={state.isPlaying ? 'pause' : 'play'} label={state.isPlaying ? 'Pause' : 'Play'} variant="solid" size="lg" onClick={toggle} data-autofocus />
              {prev && <IconButton icon="prev" label="Previous episode" size="lg" onClick={() => navigate(paths.watch(prev.id), { replace: true })} />}
              <IconButton icon="back10" label="Back 10 seconds" size="lg" onClick={() => seekBy(-10)} />
              <IconButton icon="fwd10" label="Forward 10 seconds" size="lg" onClick={() => seekBy(10)} />
              {next && <IconButton icon="next" label="Next episode" size="lg" onClick={() => navigate(paths.watch(next.id), { replace: true })} />}
              <div className="vplayer__volume">
                <IconButton icon={volumeIcon} label={state.muted ? 'Unmute' : 'Mute'} size="lg" onClick={() => patch({ muted: !state.muted })} />
                <Slider label="Volume" size="sm" value={state.muted ? 0 : state.volume * 100} max={100} step={5} onChange={(v) => patch({ volume: v / 100, muted: v === 0 })} valueText={`${Math.round(state.volume * 100)}%`} />
              </div>
            </div>
            <div className="vplayer__group vplayer__group--end">
              {episodes.length > 1 && (
                <Menu title={`Season ${media.kind === 'episode' ? media.seasonNumber : ''} episodes`} align="end" items={episodes.map((e) => ({ id: e.id, label: `${e.episodeNumber}. ${e.title}`, selected: e.id === media.id, onSelect: () => navigate(paths.watch(e.id), { replace: true }) }))}>
                  <Button variant="ghost" icon="list">Episodes</Button>
                </Menu>
              )}
              <Menu title="Subtitles" align="end" items={[{ id: 'off', label: 'Off', selected: !state.subtitleTrackId, onSelect: () => patch({ subtitleTrackId: null }) }, ...media.subtitleTracks.map((s) => ({ id: s.id, label: s.label, selected: s.id === state.subtitleTrackId, onSelect: () => patch({ subtitleTrackId: s.id }) }))]}>
                <Button variant="ghost" icon="subtitles" aria-label={`Subtitles: ${sub?.label ?? 'Off'}`}>{sub ? sub.language : 'Subtitles'}</Button>
              </Menu>
              <Menu title="Audio track" align="end" items={media.audioTracks.map((a) => ({ id: a.id, label: a.label, selected: a.id === state.audioTrackId, onSelect: () => patch({ audioTrackId: a.id }) }))}>
                <Button variant="ghost" icon="globe" aria-label={`Audio: ${audio?.label}`}>Audio</Button>
              </Menu>
              <Menu title="Quality" align="end" items={[{ id: 'Auto', label: 'Auto', hint: media.resolution, selected: state.quality === 'Auto', onSelect: () => patch({ quality: 'Auto' }) }, ...qualities.map((q) => ({ id: q, label: q, selected: state.quality === q, onSelect: () => patch({ quality: q }) }))]}>
                <Button variant="ghost" icon="sliders" aria-label={`Quality: ${state.quality}`}>{state.quality === 'Auto' ? `Auto · ${effective}` : state.quality}</Button>
              </Menu>
              <IconButton icon="fullscreen" label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} size="lg" onClick={toggleFullscreen} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
