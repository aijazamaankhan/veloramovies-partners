import { NavLink, Link } from 'react-router-dom';
import { Avatar, Icon } from '../ui';
import { Logo } from './Logo';
import { NAV_ITEMS } from './nav';
import { useProfiles } from '@/state/profiles';
import { paths } from '@/routes';

/**
 * Left navigation.
 *  - Large desktop: always expanded.
 *  - Laptop / small desktop / TV: collapses to an icon rail and expands (as an overlay) while focused or hovered,
 *    so D-pad users can reach it with a single Left press and it never shifts the content.
 */
export function Sidebar() {
  const { active } = useProfiles();
  return (
    <nav className="sidebar" aria-label="Primary">
      <div className="sidebar__panel">
        <Link to={paths.home} className="sidebar__logo" aria-label="VibeVault home">
          <Logo />
        </Link>
        <ul className="sidebar__list">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <NavLink to={item.to} end={item.end} className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}>
                <span className="nav-item__icon">
                  <Icon name={item.icon} size="1.4rem" />
                </span>
                <span className="nav-item__label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="sidebar__foot">
          <NavLink to={paths.profile} className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}>
            <span className="nav-item__icon">{active ? <Avatar spec={active.avatar} size="sm" /> : <Icon name="user" size="1.4rem" />}</span>
            <span className="nav-item__label">{active?.name ?? 'Profile'}</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}>
            <span className="nav-item__icon">
              <Icon name="settings" size="1.4rem" />
            </span>
            <span className="nav-item__label">Settings</span>
          </NavLink>
          <p className="sidebar__note">
            <Icon name="shield" size="1em" /> Streaming only. Shared files never leave their owner.
          </p>
        </div>
      </div>
    </nav>
  );
}
