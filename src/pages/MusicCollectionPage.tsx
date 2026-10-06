import { useParams } from 'react-router-dom';
import type { Album, Friend, Song } from '@/models';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/state/toast';
import * as catalog from '@/services/catalog';
import { useMusicPlayer } from '@/state/musicPlayer';
import { useUserData } from '@/state/userData';
import { formatRuntime, plural } from '@/lib';
import { Button, IconButton, Menu } from '@/components/ui';
import { AlbumCard, AsyncView, ContentRow, ListSkeleton, OwnerLine, TrackList, PageHeaderSkeleton } from '@/components/media';

interface View {
  kind: 'album' | 'artist' | 'playlist';
  title: string;
  eyebrow: string;
  cover: string;
  subtitle: string;
  songs: Song[];
  albums?: Album[];
  owner?: Friend;
  favoriteId?: string;
  round?: boolean;
}

function Skeleton() {
  return (
    <div className="page page--top" role="status" aria-label="Loading">
      <PageHeaderSkeleton />
      <ListSkeleton rows={8} />
    </div>
  );
}

/** One screen for album, artist and playlist pages (header + track list). */
export function MusicCollectionPage({ type }: { type: View['kind'] }) {
  const { id = '' } = useParams();
  const state = useAsync<View>(async () => {
    if (type === 'album') {
      const { album, songs, owner } = await catalog.getAlbumDetails(id);
      return { kind: 'album', title: album.title, eyebrow: 'Album', cover: album.artwork.square!, subtitle: `${album.artistName} · ${album.year} · ${plural(songs.length, 'song')} · ${formatRuntime(album.totalDurationSec)}`, songs, owner, favoriteId: album.id };
    }
    if (type === 'artist') {
      const { artist, albums, songs, owner } = await catalog.getArtistDetails(id);
      return { kind: 'artist', title: artist.name, eyebrow: 'Artist', cover: artist.artwork.square!, subtitle: `${plural(albums.length, 'album')} · ${plural(songs.length, 'song')}`, songs, albums, owner, round: true };
    }
    const { playlist, songs } = await catalog.getPlaylistDetails(id);
    return { kind: 'playlist', title: playlist.name, eyebrow: 'Playlist', cover: playlist.artwork.square!, subtitle: `${playlist.description} · ${plural(songs.length, 'song')}`, songs };
  }, [type, id]);
  useDocumentTitle(state.data?.title);

  return (
    <AsyncView state={state} skeleton={<Skeleton />}>
      {(v) => <Collection view={v} />}
    </AsyncView>
  );
}

function Collection({ view }: { view: View }) {
  const player = useMusicPlayer();
  const data = useUserData();
  const toast = useToast();
  const fav = view.favoriteId ? data.isFavorite(view.favoriteId) : false;
  const shuffle = () => player.play([...view.songs].sort(() => Math.random() - 0.5), 0);

  return (
    <div className="page page--top">
      <header className="collection-head">
        <img className={`collection-head__cover ${view.round ? 'is-round' : ''}`} src={view.cover} alt={`${view.title} cover`} />
        <div className="collection-head__text">
          <span className="eyebrow">{view.eyebrow}</span>
          <h1>{view.title}</h1>
          <p className="muted">{view.subtitle}</p>
          {view.owner && <OwnerLine owner={view.owner} />}
          <div className="row row--wrap" style={{ marginTop: '0.75rem' }}>
            <Button variant="primary" size="lg" icon="play" onClick={() => player.play(view.songs, 0)} data-autofocus>Play</Button>
            <Button variant="glass" size="lg" icon="shuffle" onClick={shuffle}>Shuffle</Button>
            {view.favoriteId && (
              <IconButton
                icon="heart"
                label={fav ? 'Remove from favorites' : 'Add to favorites'}
                pressed={fav}
                variant="glass"
                size="lg"
                onClick={() => {
                  const added = data.toggleFavorite(view.favoriteId!);
                  toast.show(added ? `Added “${view.title}” to Favorites` : `Removed “${view.title}” from Favorites`, { tone: 'success', icon: 'heart' });
                }}
              />
            )}
            <Menu
              items={[
                { id: 'queue', label: 'Add all to queue', icon: 'list', onSelect: () => view.songs.forEach((s) => player.enqueue(s)) },
                { id: 'next', label: 'Play next', icon: 'next', onSelect: () => [...view.songs].reverse().forEach((s) => player.enqueue(s, true)) },
              ]}
            >
              <IconButton icon="more" label="More options" variant="glass" size="lg" />
            </Menu>
          </div>
        </div>
      </header>
      <section className="section" aria-label="Songs">
        {view.kind === 'artist' && <h2 style={{ marginBottom: '0.75rem' }}>Popular songs</h2>}
        <TrackList songs={view.kind === 'artist' ? view.songs.slice(0, 8) : view.songs} numbered={view.kind === 'album'} showAlbum={view.kind !== 'album'} />
      </section>
      {view.albums && view.albums.length > 0 && (
        <ContentRow title="Albums">
          {view.albums.map((a) => <AlbumCard key={a.id} album={a} />)}
        </ContentRow>
      )}
    </div>
  );
}
