import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavigation } from './TopNavigation';
import { ShortcutsDialog } from './ShortcutsDialog';
import { NAV_ITEMS } from './nav';
import { MiniPlayer } from '../player/MiniPlayer';
import { useSettings } from '@/state/settings';
import { useMusicPlayer } from '@/state/musicPlayer';
import { useToast } from '@/state/toast';
import { paths } from '@/routes';

/** Desktop / TV application frame: sidebar + translucent top bar + scrolling content + mini-player. */
export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const main = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [shortcuts, setShortcuts] = useState(false);
  const { settings, toggleMode } = useSettings();
  const music = useMusicPlayer();
  const toast = useToast();

  // New screen → start at the top.
  useEffect(() => {
    main.current?.scrollTo({ top: 0 });
    setScrolled(false);
  }, [location.pathname]);

  // Global keyboard shortcuts (ignored while typing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el.matches?.('input, textarea, select, [contenteditable]');
      if (e.key === 'MediaPlayPause') return music.toggle();
      if (e.key === 'MediaTrackNext') return music.next();
      if (e.key === 'MediaTrackPrevious') return music.prev();
      if (typing || e.defaultPrevented || document.querySelector('[data-focus-scope]')) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        navigate(paths.search);
      } else if (e.altKey && /^[1-8]$/.test(e.key)) {
        e.preventDefault();
        navigate(NAV_ITEMS[Number(e.key) - 1].to);
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === '/') {
          e.preventDefault();
          navigate(paths.search);
        } else if (e.key === '?') setShortcuts(true);
        else if (e.key.toLowerCase() === 't') {
          toggleMode();
          toast.show(settings.mode === 'tv' ? 'Desktop layout' : 'TV layout on', { icon: 'monitor' });
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, music, toggleMode, toast, settings.mode]);

  const hasMini = !!music.current;
  return (
    <div className={`shell ${hasMini ? 'has-mini' : ''}`}>
      <a href="#main" className="skip-link" data-nav-skip onClick={(e) => (e.preventDefault(), main.current?.focus())}>
        Skip to content
      </a>
      <Sidebar />
      <div className="shell__content">
        <TopNavigation scrolled={scrolled} onShowShortcuts={() => setShortcuts(true)} />
        <main id="main" ref={main} tabIndex={-1} className="shell__main" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 24)}>
          <div key={location.pathname}>
            <Outlet />
          </div>
        </main>
        <MiniPlayer />
      </div>
      <ShortcutsDialog open={shortcuts} onClose={() => setShortcuts(false)} />
    </div>
  );
}
