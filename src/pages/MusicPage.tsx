import { useMemo, useState } from 'react';
import type { Song } from '@/models';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import * as catalog from '@/services/catalog';
import { lookup } from '@/data/queries';
import { useMusicPlayer } from '@/state/musicPlayer';
import { useUserData } from '@/state/userData';
import { useToast } from '@/state/toast';
import { Button, EmptyState, Tabs, type TabItem } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { AlbumCard, ArtistCard, AsyncView, ContentRow, GridSkeleton, ListSkeleton, PageHeaderSkeleton, PlaylistCard, RowSkeleton, SongCard, TrackList } from '@/components/media';

type Tab = 'home' | 'albums' | 'artists' | 'songs' | 'playlists' | 'favorites' | 'recent';

const TABS: TabItem<Tab>[] = [
  { id: 'home', label: 'Home' },
  { id: 'albums', label: 'Albums', icon: 'disc' },
  { id: 'artists', label: 'Artists', icon: 'mic' },
  { id: 'songs', label: 'Songs', icon: 'music' },
  { id: 'playlists', label: 'Playlists', icon: 'list' },
  { id: 'favorites', label: 'Favorites', icon: 'heart' },
  { id: 'recent', label: 'Recently Played', icon: 'clock' },
];

function MusicSkeleton() {
  return (
    <div className="page page--top" role="status" aria-label="Loading music">
      <PageHeaderSkeleton />
      <RowSkeleton variant="square" />
      <GridSkeleton variant="square" count={10} />
      <div style={{ marginTop: '2rem' }}><ListSkeleton rows={5} /></div>
    </div>
  );
}

export function MusicPage() {
  useDocumentTitle('Music');
  const state = useAsync(() => catalog.getMusic(), []);
  const [tab, setTab] = useState<Tab>('home');
  const player = useMusicPlayer();
  const data = useUserData();
  const toast = useToast();
  const favorites = useMemo(() => lookup(data.favoriteIds).filter((m) => m.kind === 'song' || m.kind === 'album'), [data.favoriteIds]);

  return (
    <AsyncView state={state} skeleton={<MusicSkeleton />}>
      {({ albums, artists, songs, playlists }) => {
        const mySongs = songs;
        const recent = [...songs].filter((s) => s.lastPlayedAt).sort((a, b) => Date.parse(b.lastPlayedAt!) - Date.parse(a.lastPlayedAt!)).slice(0, 25);
        const favSongs = favorites.filter((f): f is Song => f.kind === 'song');
        const favAlbums = favorites.filter((f) => f.kind === 'album');
        const shuffleAll = () => {
          const mixed = [...mySongs].sort(() => Math.random() - 0.5);
          player.play(mixed, 0);
          toast.show('Shuffling your whole library', { icon: 'shuffle' });
        };
        const noMusic = albums.length === 0;
        return (
          <div className="page page--top">
            <PageHeader
              title="Music"
              description={`${albums.length} albums · ${songs.length} songs · ${artists.length} artists`}
              actions={<Button variant="primary" icon="shuffle" onClick={shuffleAll} data-autofocus>Shuffle all</Button>}
            />
            {noMusic ? (
              <EmptyState icon="music" title="No music" description="Add a music folder to your library and your albums will appear here." />
            ) : (
              <>
                <Tabs label="Music sections" items={TABS} value={tab} onChange={setTab} variant="underline" />
                <div className="music-body" key={tab}>
                  {tab === 'home' && (
                    <>
                      <ContentRow title="Recently Played">
                        {recent.slice(0, 10).map((s) => <SongCard key={s.id} song={s} />)}
                      </ContentRow>
                      <ContentRow title="Albums">{albums.slice(0, 14).map((a) => <AlbumCard key={a.id} album={a} />)}</ContentRow>
                      <ContentRow title="Artists">{artists.map((a) => <ArtistCard key={a.id} artist={a} />)}</ContentRow>
                      <ContentRow title="Playlists">{playlists.map((p) => <PlaylistCard key={p.id} playlist={p} />)}</ContentRow>
                      {favorites.length > 0 && (
                        <ContentRow title="Favorites">
                          {favAlbums.map((a) => (a.kind === 'album' ? <AlbumCard key={a.id} album={a} /> : null))}
                          {favSongs.map((s) => <SongCard key={s.id} song={s} />)}
                        </ContentRow>
                      )}
                    </>
                  )}
                  {tab === 'albums' && <div className="grid grid--square">{albums.map((a) => <AlbumCard key={a.id} album={a} />)}</div>}
                  {tab === 'artists' && <div className="grid grid--square">{artists.map((a) => <ArtistCard key={a.id} artist={a} />)}</div>}
                  {tab === 'songs' && <TrackList songs={songs} />}
                  {tab === 'playlists' && <div className="grid grid--square">{playlists.map((p) => <PlaylistCard key={p.id} playlist={p} />)}</div>}
                  {tab === 'favorites' &&
                    (favorites.length === 0 ? (
                      <EmptyState icon="heart" title="No favorites" description="Tap the heart next to a song or album and it will live here." />
                    ) : (
                      <>
                        {favAlbums.length > 0 && <div className="grid grid--square" style={{ marginBottom: '2rem' }}>{favAlbums.map((a) => (a.kind === 'album' ? <AlbumCard key={a.id} album={a} /> : null))}</div>}
                        {favSongs.length > 0 && <TrackList songs={favSongs} />}
                      </>
                    ))}
                  {tab === 'recent' &&
                    (recent.length === 0 ? <EmptyState icon="clock" title="Nothing played yet" description="Songs you listen to will show up here." /> : <TrackList songs={recent} />)}
                </div>
              </>
            )}
          </div>
        );
      }}
    </AsyncView>
  );
}
