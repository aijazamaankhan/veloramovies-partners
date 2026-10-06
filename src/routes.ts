import type { AnyMedia, ID } from '@/models';

/** Central place for URLs so pages never build paths by hand. */
export const paths = {
  profiles: '/profiles',
  manageProfiles: '/profiles/manage',
  home: '/',
  movies: '/movies',
  movie: (id: ID) => `/movies/${id}`,
  shows: '/shows',
  show: (id: ID) => `/shows/${id}`,
  music: '/music',
  album: (id: ID) => `/music/album/${id}`,
  artist: (id: ID) => `/music/artist/${id}`,
  playlist: (id: ID) => `/music/playlist/${id}`,
  videos: '/videos',
  video: (id: ID) => `/videos/${id}`,
  library: '/library',
  friends: '/friends',
  friend: (id: ID) => `/friends/${id}`,
  sharing: (friendId?: ID) => (friendId ? `/sharing?friend=${friendId}` : '/sharing'),
  search: '/search',
  profile: '/profile',
  settings: (section = 'account') => `/settings/${section}`,
  states: '/ui-states',
  watch: (id: ID) => `/watch/${id}`,
};

/** Where "open details" goes for any media kind. */
export function detailPath(item: AnyMedia): string {
  switch (item.kind) {
    case 'movie':
      return paths.movie(item.id);
    case 'show':
      return paths.show(item.id);
    case 'episode':
      return paths.show(item.showId);
    case 'album':
      return paths.album(item.id);
    case 'song':
      return paths.album(item.albumId);
    case 'video':
      return paths.video(item.id);
  }
}
