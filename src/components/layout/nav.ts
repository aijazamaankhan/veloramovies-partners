import type { IconName } from '../ui';
import { paths } from '@/routes';

export interface NavItem {
  id: string;
  label: string;
  icon: IconName;
  to: string;
  end?: boolean;
}

/** Primary navigation — shared by the desktop sidebar and the TV rail. */
export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home', to: paths.home, end: true },
  { id: 'movies', label: 'Movies', icon: 'film', to: paths.movies },
  { id: 'shows', label: 'TV Shows', icon: 'tv', to: paths.shows },
  { id: 'music', label: 'Music', icon: 'music', to: paths.music },
  { id: 'videos', label: 'Videos', icon: 'video', to: paths.videos },
  { id: 'library', label: 'My Library', icon: 'library', to: paths.library },
  { id: 'friends', label: 'Friends', icon: 'users', to: paths.friends },
  { id: 'search', label: 'Search', icon: 'search', to: paths.search },
];
