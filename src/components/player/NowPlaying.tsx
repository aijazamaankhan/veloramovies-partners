import { Icon, IconButton, Modal, Slider, Button } from '../ui';
import { PlayerControls } from './PlayerControls';
import { useMusicPlayer } from '@/state/musicPlayer';
import { formatDuration } from '@/lib';

/** Expanded music player: large artwork, seek, volume, repeat/shuffle and the play queue. */
export function NowPlaying({ open, onClose }: { open: boolean; onClose: () => void }) {
  const p = useMusicPlayer();
  const song = p.current;
  if (!song) return null;
  return (
    <Modal open={open} onClose={onClose} title="Now playing" size="lg">
      <div className="nowplaying">
        <div className="nowplaying__main">
          <img className="nowplaying__cover" src={song.artwork.square} alt={`${song.albumTitle} cover`} />
          <div className="nowplaying__info">
            <h3 className="truncate">{song.title}</h3>
            <p className="muted truncate">
              {song.artistName} · {song.albumTitle}
            </p>
          </div>
          <div className="nowplaying__seek">
            <span className="dim">{formatDuration(p.position)}</span>
            <Slider label="Seek" value={p.position} max={song.durationSec} step={5} bigStep={15} onChange={p.seek} valueText={`${formatDuration(p.position)} of ${formatDuration(song.durationSec)}`} />
            <span className="dim">{formatDuration(song.durationSec)}</span>
          </div>
          <PlayerControls size="lg" extended />
          <div className="nowplaying__volume">
            <IconButton icon={p.muted || p.volume === 0 ? 'mute' : 'volume'} label={p.muted ? 'Unmute' : 'Mute'} onClick={p.toggleMute} />
            <Slider label="Volume" value={p.muted ? 0 : p.volume * 100} max={100} step={5} onChange={(v) => p.setVolume(v / 100)} valueText={`${Math.round(p.volume * 100)}%`} size="sm" />
          </div>
        </div>
        <section className="nowplaying__queue" aria-label="Queue">
          <header className="row">
            <h3>Queue</h3>
            <span className="dim">{p.queue.length} songs</span>
            <span className="spacer" />
            <Button variant="ghost" onClick={p.clearUpcoming}>
              Clear
            </Button>
          </header>
          <ol className="queue">
            {p.queue.map((s, i) => (
              <li key={`${s.id}-${i}`} className={`queue__item ${i === p.index ? 'is-current' : ''}`}>
                <button type="button" className="queue__main" onClick={() => p.jumpTo(i)} aria-label={`Play ${s.title}`} aria-current={i === p.index}>
                  <span className="queue__idx">{i === p.index ? <Icon name={p.playing ? 'volume' : 'play'} size="1em" /> : i + 1}</span>
                  <img src={s.artwork.square} alt="" />
                  <span className="queue__text">
                    <strong className="truncate">{s.title}</strong>
                    <span className="truncate dim">{s.artistName}</span>
                  </span>
                  <span className="dim">{formatDuration(s.durationSec)}</span>
                </button>
                {i !== p.index && <IconButton icon="close" label={`Remove ${s.title} from queue`} size="sm" onClick={() => p.removeFromQueue(i)} data-nav-skip />}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Modal>
  );
}
