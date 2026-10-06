import type { Album, Artist, Episode, Library, Movie, Playlist, Song, TVShow, Video, Friend, WatchProgress } from '@/models';
import { Avatar, Badge, Icon, ProgressBar } from '../ui';
import { MediaCard } from './MediaCard';
import { isMine, friendById } from '@/data/access';
import { useMediaActions } from '@/hooks/useMediaActions';
import { formatDuration, formatRuntime, plural } from '@/lib';
import { paths } from '@/routes';
import { Link } from 'react-router-dom';
import type { FriendLibrarySummary } from '@/services/catalog';

const ownerName = (ownerId: string) => (isMine(ownerId) ? undefined : friendById(ownerId)?.name);

export function MovieCard({ movie, progress, variant = 'poster' }: { movie: Movie; progress?: number; variant?: 'poster' | 'landscape' }) {
  const a = useMediaActions();
  return (
    <MediaCard
      variant={variant}
      to={paths.movie(movie.id)}
      image={variant === 'poster' ? movie.artwork.poster! : movie.artwork.thumb!}
      title={movie.title}
      subtitle={`${movie.year} · ${formatRuntime(movie.durationSec)}`}
      meta={`${movie.genres.join(' · ')} · ${movie.contentRating}`}
      description={movie.description}
      quality={movie.hdr ? `${movie.resolution} HDR` : movie.resolution}
      sharedBy={ownerName(movie.ownerId)}
      progress={progress}
      onPlay={() => a.play(movie)}
      menu={a.menuFor(movie)}
      dimmed={movie.availability === 'unavailable'}
    />
  );
}

export function ShowCard({ show }: { show: TVShow }) {
  const a = useMediaActions();
  const seasons = show.seasons.length;
  return (
    <MediaCard
      variant="poster"
      to={paths.show(show.id)}
      image={show.artwork.poster!}
      title={show.title}
      subtitle={`${show.year} · ${plural(seasons, 'Season')}`}
      meta={`${show.genres.join(' · ')} · ${show.contentRating}`}
      description={show.description}
      quality={show.resolution}
      sharedBy={ownerName(show.ownerId)}
      onPlay={() => a.play(show)}
      menu={a.menuFor(show)}
    />
  );
}

/** Landscape card for episodes (used by Continue Watching). */
export function EpisodeCard({ episode, show, progress }: { episode: Episode; show?: TVShow; progress?: WatchProgress }) {
  const a = useMediaActions();
  return (
    <MediaCard
      variant="landscape"
      to={paths.show(episode.showId)}
      image={episode.artwork.thumb!}
      title={show?.title ?? episode.title}
      subtitle={`S${episode.seasonNumber}:E${episode.episodeNumber} · ${episode.title}`}
      meta={formatRuntime(episode.durationSec)}
      description={episode.description}
      sharedBy={ownerName(episode.ownerId)}
      progress={progress ? progress.positionSec / progress.durationSec : undefined}
      onPlay={() => a.play(episode)}
      menu={a.menuFor(episode)}
    />
  );
}

export function VideoCard({ video, progress }: { video: Video; progress?: number }) {
  const a = useMediaActions();
  const shared = video.sharedWithIds.length;
  const mine = isMine(video.ownerId);
  return (
    <MediaCard
      variant="landscape"
      to={paths.video(video.id)}
      image={video.artwork.thumb!}
      title={video.title}
      subtitle={`${video.category} · ${new Date(video.recordedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
      meta={video.category}
      description={video.description}
      sharedBy={ownerName(video.ownerId)}
      progress={progress}
      corner={<span className="card__duration">{formatDuration(video.durationSec)}</span>}
      topLeft={
        mine ? (
          <Badge tone={shared ? 'accent' : 'private'} icon={shared ? 'users' : 'lock'}>
            {shared ? `Shared with ${shared}` : 'Private'}
          </Badge>
        ) : undefined
      }
      onPlay={() => a.play(video)}
      menu={a.menuFor(video)}
    />
  );
}

export function AlbumCard({ album }: { album: Album }) {
  const a = useMediaActions();
  return (
    <MediaCard
      variant="square"
      to={paths.album(album.id)}
      image={album.artwork.square!}
      title={album.title}
      subtitle={`${album.artistName} · ${album.year}`}
      sharedBy={ownerName(album.ownerId)}
      onPlay={() => a.play(album)}
      menu={a.menuFor(album)}
    />
  );
}

export function SongCard({ song }: { song: Song }) {
  const a = useMediaActions();
  return (
    <MediaCard
      variant="square"
      to={paths.album(song.albumId)}
      image={song.artwork.square!}
      title={song.title}
      subtitle={`${song.artistName} · ${formatDuration(song.durationSec)}`}
      sharedBy={ownerName(song.ownerId)}
      onPlay={() => a.play(song)}
      menu={a.menuFor(song)}
    />
  );
}

export function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <MediaCard variant="round" to={paths.artist(artist.id)} image={artist.artwork.square!} title={artist.name} subtitle={plural(artist.albumIds.length, 'album')} sharedBy={ownerName(artist.ownerId)} />
  );
}

export function PlaylistCard({ playlist }: { playlist: Playlist }) {
  return <MediaCard variant="square" to={paths.playlist(playlist.id)} image={playlist.artwork.square!} title={playlist.name} subtitle={`${plural(playlist.songIds.length, 'song')}`} />;
}

const STATUS_LABEL: Record<Library['status'], string> = {
  available: 'Ready to stream',
  'owner-offline': 'Owner offline',
  revoked: 'Access revoked',
  error: 'Needs attention',
};

/** Landscape card representing a friend's shared library (Home rail + Friends page). */
export function FriendLibraryCard({ summary }: { summary: FriendLibrarySummary }) {
  const { friend, library, sharedCount } = summary;
  const bad = library.status === 'revoked';
  return (
    <article className={`card card--landscape card--friend ${bad ? 'is-dimmed' : ''}`}>
      <Link to={paths.friend(friend.id)} className="card__link" aria-label={`${friend.name}'s library, ${sharedCount} shared items, ${STATUS_LABEL[library.status]}`}>
        <div className="card__frame friend-tile">
          <div className="friend-tile__covers" aria-hidden="true">
            {summary.covers.map((c, i) => (
              <img key={i} src={c} alt="" loading="lazy" />
            ))}
          </div>
          <div className="friend-tile__body">
            <Avatar spec={friend.avatar} size="md" presence={friend.presence} />
            <div className="friend-tile__text">
              <strong className="truncate">{friend.name}</strong>
              <span className="truncate">{bad ? 'Access revoked' : `${plural(sharedCount, 'shared title')}`}</span>
            </div>
          </div>
        </div>
        <div className="card__text">
          <h3 className="truncate">{library.name}</h3>
          <p className="truncate row">
            <Icon name={library.status === 'available' ? 'lock' : library.status === 'owner-offline' ? 'wifiOff' : 'alert'} size="0.9em" /> {STATUS_LABEL[library.status]}
          </p>
        </div>
      </Link>
    </article>
  );
}

export type { Friend };

/** Small inline progress for list rows. */
export const RowProgress = ProgressBar;
