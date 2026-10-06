import { IconButton } from '../ui';
import { useMusicPlayer } from '@/state/musicPlayer';

/** Transport controls for music: shuffle, previous, play/pause, next, repeat. */
export function PlayerControls({ size = 'md', extended = false }: { size?: 'md' | 'lg'; extended?: boolean }) {
  const p = useMusicPlayer();
  return (
    <div className="transport" role="group" aria-label="Playback controls">
      {extended && <IconButton icon="shuffle" label={p.shuffle ? 'Shuffle on' : 'Shuffle off'} pressed={p.shuffle} onClick={p.toggleShuffle} />}
      <IconButton icon="prev" label="Previous" size={size} onClick={p.prev} />
      <IconButton icon={p.playing ? 'pause' : 'play'} label={p.playing ? 'Pause' : 'Play'} size={size === 'lg' ? 'lg' : 'md'} variant="solid" onClick={p.toggle} data-autofocus />
      <IconButton icon="next" label="Next" size={size} onClick={p.next} />
      {extended && <IconButton icon="repeat" label={`Repeat: ${p.repeat}`} pressed={p.repeat !== 'off'} onClick={p.cycleRepeat} className={p.repeat === 'one' ? 'is-repeat-one' : ''} />}
    </div>
  );
}
