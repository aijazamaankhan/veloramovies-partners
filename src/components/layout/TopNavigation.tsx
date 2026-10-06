import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Icon, IconButton, Menu } from '../ui';
import { useProfiles } from '@/state/profiles';
import { useSettings } from '@/state/settings';
import { useToast } from '@/state/toast';
import { paths } from '@/routes';

interface TopNavigationProps {
  scrolled: boolean;
  onShowShortcuts: () => void;
}

/** Slim, translucent bar that floats over page content: back, search, view mode, profile menu. */
export function TopNavigation({ scrolled, onShowShortcuts }: TopNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { active } = useProfiles();
  const { settings, toggleMode } = useSettings();
  const toast = useToast();
  const canGoBack = location.key !== 'default' && location.pathname !== '/';

  return (
    <header className={`topbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="topbar__left">{canGoBack && <IconButton icon="arrowLeft" label="Back" variant="glass" onClick={() => navigate(-1)} />}</div>
      <div className="topbar__right">
        <Link to={paths.search} className="topbar__search" aria-label="Search (press slash)">
          <Icon name="search" />
          <span>Search movies, shows, music, friends…</span>
          <kbd className="kbd">/</kbd>
        </Link>
        <IconButton
          icon="monitor"
          label={settings.mode === 'tv' ? 'Switch to desktop layout' : 'Switch to TV layout'}
          pressed={settings.mode === 'tv'}
          variant="glass"
          onClick={() => {
            toggleMode();
            toast.show(settings.mode === 'tv' ? 'Desktop layout' : 'TV layout — use the arrow keys and Enter, Esc to go back', { icon: 'monitor' });
          }}
        />
        <IconButton icon="keyboard" label="Keyboard shortcuts" variant="glass" onClick={onShowShortcuts} />
        <Menu
          title={active ? `Signed in as ${active.name}` : 'Profile'}
          align="end"
          items={[
            { id: 'switch', label: 'Switch profile', icon: 'users', onSelect: () => navigate(paths.profiles) },
            { id: 'profile', label: 'Your activity', icon: 'history', onSelect: () => navigate(paths.profile) },
            { id: 'sharing', label: 'Manage sharing', icon: 'share', onSelect: () => navigate(paths.sharing()) },
            { id: 'settings', label: 'Settings', icon: 'settings', separatorBefore: true, onSelect: () => navigate(paths.settings()) },
          ]}
        >
          <button type="button" className="topbar__profile" aria-label={`Profile menu, ${active?.name ?? 'no profile'}`}>
            {active && <Avatar spec={active.avatar} size="sm" shape="rounded" />}
            <Icon name="chevronDown" size="1em" />
          </button>
        </Menu>
      </div>
    </header>
  );
}
