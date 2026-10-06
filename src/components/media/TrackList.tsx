import type { Song } from '@/models';
import { Icon, IconButton, Menu, type MenuItem } from '../ui';
import { formatDuration } from '@/lib';
import { useMusicPlayer } from '@/state/musicPlayer';
import { useUserData } from '@/state/userData';
import { useMediaActions } from '@/hooks/useMediaActions';

interface TrackListProps {
  songs: Song[];
  /** Show the album cover + album name column (artist / library views). */
  showAlbum?: boolean;
  /** Show 1..n track numbers instead of covers (album view). */
  numbered?: boolean;
  emptyLabel?: string;
}

/** Song rows. Selecting a row starts playback of the whole list from that song. */
export function TrackList({ songs, showAlbum = true, numbered }: TrackListProps) {
  const player = useMusicPlayer();
  const data = useUserData();
  const actions = useMediaActions();

  return (
    <ol className="tracks" aria-label="Songs">
      {songs.map((song, i) => {
        const isCurrent = player.current?.id === song.id;
        const menu: MenuItem[] = actions.menuFor(song);
        return (
          <li key={song.id} className={`track ${isCurrent ? 'is-current' : ''}`}>
            <button type="button" className="track__main" onClick={() => (isCurrent ? player.toggle() : player.play(songs, i))} aria-label={`${isCurrent && player.playing ? 'Pause' : 'Play'} ${song.title} by ${song.artistName}`}>
              <span className="track__lead">
                {numbered ? <span className="track__num">{song.trackNumber}</span> : <img src={song.artwork.square} alt="" loading="lazy" />}
                <span className="track__playicon">
                  <Icon name={isCurrent && player.playing ? 'pause' : 'play'} size="1.1em" />
                </span>
                {isCurrent && player.playing && (
                  <span className="eq" aria-hidden="true">
                    <i /><i /><i />
                  </span>
                )}
              </span>
              <span className="track__title">
                <strong className="truncate">{song.title}</strong>
                <span className="truncate dim">{song.artistName}</span>
              </span>
              {showAlbum && <span className="track__album truncate dim">{song.albumTitle}</span>}
              <span className="track__time dim">{formatDuration(song.durationSec)}</span>
            </button>
            <div className="track__actions">
              <IconButton icon="heart" label={data.isFavorite(song.id) ? `Remove ${song.title} from favorites` : `Add ${song.title} to favorites`} pressed={data.isFavorite(song.id)} size="sm" onClick={() => actions.toggleFavorite(song)} data-nav-skip />
              <Menu items={menu} title={song.title} align="end">
                <IconButton icon="more" label={`More options for ${song.title}`} size="sm" data-nav-skip />
              </Menu>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
