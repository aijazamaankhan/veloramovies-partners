import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AnyMedia, Song } from '@/models';
import type { MenuItem } from '@/components/ui';
import { continueWatching, episodesOf, songsOfAlbum, getAlbum } from '@/data/queries';
import { detailPath, paths } from '@/routes';
import { useMusicPlayer } from '@/state/musicPlayer';
import { useProfiles } from '@/state/profiles';
import { useToast } from '@/state/toast';
import { useUserData } from '@/state/userData';

/**
 * Shared behaviour for every media card / button: play, open, favourite, add to list.
 * Note what is NOT here: download, export, copy-file or "save" actions. They do not exist in VibeVault.
 */
export function useMediaActions() {
  const navigate = useNavigate();
  const toast = useToast();
  const music = useMusicPlayer();
  const { active } = useProfiles();
  const data = useUserData();

  const play = useCallback(
    (item: AnyMedia) => {
      switch (item.kind) {
        case 'movie':
        case 'video':
        case 'episode':
          music.pause();
          navigate(paths.watch(item.id));
          break;
        case 'show': {
          const eps = episodesOf(item.id);
          const resume = continueWatching(active?.id ?? '').find((c) => c.media.kind === 'episode' && c.media.showId === item.id);
          music.pause();
          navigate(paths.watch(resume?.media.id ?? eps[0]?.id ?? item.id));
          break;
        }
        case 'album': {
          const songs = songsOfAlbum(item);
          music.play(songs, 0);
          toast.show(`Playing ${item.title}`, { icon: 'music' });
          break;
        }
        case 'song': {
          const album = getAlbum(item.albumId);
          const songs = album ? songsOfAlbum(album) : [item];
          music.play(songs, Math.max(0, songs.findIndex((s) => s.id === item.id)));
          break;
        }
      }
    },
    [navigate, music, toast, active?.id],
  );

  const open = useCallback((item: AnyMedia) => navigate(detailPath(item)), [navigate]);

  const toggleList = useCallback(
    (item: AnyMedia) => {
      const added = data.toggleMyList(item.id);
      toast.show(added ? `Added “${item.title}” to My List` : `Removed “${item.title}” from My List`, { tone: 'success' });
    },
    [data, toast],
  );

  const toggleFavorite = useCallback(
    (item: AnyMedia) => {
      const added = data.toggleFavorite(item.id);
      toast.show(added ? `Added “${item.title}” to Favorites` : `Removed “${item.title}” from Favorites`, { tone: 'success', icon: 'heart' });
    },
    [data, toast],
  );

  const menuFor = useCallback(
    (item: AnyMedia): MenuItem[] => {
      const items: MenuItem[] = [
        { id: 'play', label: item.kind === 'album' || item.kind === 'song' ? 'Play now' : 'Play', icon: 'play', onSelect: () => play(item) },
      ];
      if (item.kind === 'song') {
        items.push(
          { id: 'next', label: 'Play next', icon: 'list', onSelect: () => (music.enqueue(item as Song, true), toast.show('Will play next', { icon: 'list' })) },
          { id: 'queue', label: 'Add to queue', icon: 'plus', onSelect: () => (music.enqueue(item as Song), toast.show('Added to queue', { icon: 'list' })) },
        );
      }
      items.push({ id: 'details', label: item.kind === 'song' ? 'Go to album' : 'View details', icon: 'info', onSelect: () => open(item) });
      if (item.kind !== 'song' && item.kind !== 'episode') {
        items.push({ id: 'list', label: data.inMyList(item.id) ? 'Remove from My List' : 'Add to My List', icon: data.inMyList(item.id) ? 'check' : 'plus', separatorBefore: true, onSelect: () => toggleList(item) });
      }
      items.push({ id: 'fav', label: data.isFavorite(item.id) ? 'Remove from Favorites' : 'Add to Favorites', icon: 'heart', onSelect: () => toggleFavorite(item) });
      return items;
    },
    [play, open, music, toast, data, toggleList, toggleFavorite],
  );

  return { play, open, toggleList, toggleFavorite, menuFor };
}
