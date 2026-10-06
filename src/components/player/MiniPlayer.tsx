import { useState } from 'react';
import { IconButton, Slider } from '../ui';
import { PlayerControls } from './PlayerControls';
import { NowPlaying } from './NowPlaying';
import { useMusicPlayer } from '@/state/musicPlayer';
import { formatDuration } from '@/lib';

/** Persistent mini-player docked at the bottom of every browsing screen. */
export function MiniPlayer() {
  const p = useMusicPlayer();
  const [open, setOpen] = useState(false);
  const song = p.current;
  if (!song) return null;

  return (
    <>
      <aside className="mini" aria-label="Music player">
        <button type="button" className="mini__now" onClick={() => setOpen(true)} aria-label={`Open now playing: ${song.title} by ${song.artistName}`}>
          <img src={song.artwork.square} alt="" />
          <span className="mini__text">
            <strong className="truncate">{song.title}</strong>
            <span className="truncate dim">{song.artistName}</span>
          </span>
        </button>
        <div className="mini__center">
          <PlayerControls />
          <div className="mini__seek">
            <span className="dim">{formatDuration(p.position)}</span>
            <Slider size="sm" label="Seek" value={p.position} max={song.durationSec} step={5} bigStep={15} onChange={p.seek} valueText={`${formatDuration(p.position)} of ${formatDuration(song.durationSec)}`} />
            <span className="dim">{formatDuration(song.durationSec)}</span>
          </div>
        </div>
        <div className="mini__right">
          <IconButton icon={p.muted || p.volume === 0 ? 'mute' : 'volume'} label={p.muted ? 'Unmute' : 'Mute'} size="sm" onClick={p.toggleMute} data-nav-skip />
          <Slider size="sm" label="Volume" value={p.muted ? 0 : p.volume * 100} max={100} step={5} onChange={(v) => p.setVolume(v / 100)} valueText={`${Math.round(p.volume * 100)}%`} className="mini__volume" />
          <IconButton icon="list" label="Open queue" onClick={() => setOpen(true)} />
        </div>
      </aside>
      <NowPlaying open={open} onClose={() => setOpen(false)} />
    </>
  );
}
