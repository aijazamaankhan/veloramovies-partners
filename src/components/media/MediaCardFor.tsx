import type { AnyMedia } from '@/models';
import { AlbumCard, EpisodeCard, MovieCard, ShowCard, SongCard, VideoCard } from './Cards';
import { getShow } from '@/data/queries';

/** Picks the right card for any media item (used by favourites, search, library, history). */
export function MediaCardFor({ item }: { item: AnyMedia }) {
  switch (item.kind) {
    case 'movie':
      return <MovieCard movie={item} />;
    case 'show':
      return <ShowCard show={item} />;
    case 'episode':
      return <EpisodeCard episode={item} show={getShow(item.showId)} />;
    case 'album':
      return <AlbumCard album={item} />;
    case 'song':
      return <SongCard song={item} />;
    case 'video':
      return <VideoCard video={item} />;
  }
}
