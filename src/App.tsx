import { HashRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { AppShell } from '@/components/layout';
import { SettingsProvider } from '@/state/settings';
import { ProfilesProvider, useProfiles } from '@/state/profiles';
import { ToastProvider } from '@/state/toast';
import { UserDataProvider } from '@/state/userData';
import { MusicPlayerProvider } from '@/state/musicPlayer';
import { useInputModality } from '@/hooks/useInputModality';
import { useSpatialNavigation } from '@/hooks/useSpatialNavigation';
import { HomePage } from '@/pages/HomePage';
import { MoviesPage } from '@/pages/MoviesPage';
import { MovieDetailsPage } from '@/pages/MovieDetailsPage';
import { ShowsPage } from '@/pages/ShowsPage';
import { ShowDetailsPage } from '@/pages/ShowDetailsPage';
import { MusicPage } from '@/pages/MusicPage';
import { MusicCollectionPage } from '@/pages/MusicCollectionPage';
import { VideosPage } from '@/pages/VideosPage';
import { VideoDetailsPage } from '@/pages/VideoDetailsPage';
import { LibraryPage } from '@/pages/LibraryPage';
import { FriendsPage } from '@/pages/FriendsPage';
import { FriendLibraryPage } from '@/pages/FriendLibraryPage';
import { SharingPage } from '@/pages/SharingPage';
import { SearchPage } from '@/pages/SearchPage';
import { PlayerPage } from '@/pages/PlayerPage';
import { ProfileSelectPage } from '@/pages/ProfileSelectPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { StatesGalleryPage } from '@/pages/StatesGalleryPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

/** Everything except the profile picker needs an active profile. */
function RequireProfile() {
  const { active } = useProfiles();
  return active ? <Outlet /> : <Navigate to="/profiles" replace />;
}

/** Mounts app-wide input handling: D-pad / arrow focus navigation, Back, and keyboard-vs-pointer tracking. */
function GlobalInput() {
  const location = useLocation();
  const navigate = useNavigate();
  useInputModality();
  const back = useCallback(() => {
    if (location.key !== 'default' && location.pathname !== '/' && location.pathname !== '/profiles') navigate(-1);
  }, [location.key, location.pathname, navigate]);
  useSpatialNavigation(back);
  return null;
}

export function App() {
  return (
    <HashRouter>
      <SettingsProvider>
        <ProfilesProvider>
          <ToastProvider>
            <UserDataProvider>
              <MusicPlayerProvider>
                <GlobalInput />
                <Routes>
                  <Route path="/profiles" element={<ProfileSelectPage />} />
                  <Route path="/profiles/manage" element={<ProfileSelectPage manage />} />
                  <Route element={<RequireProfile />}>
                    <Route path="/watch/:id" element={<PlayerPage />} />
                    <Route element={<AppShell />}>
                      <Route index element={<HomePage />} />
                      <Route path="movies" element={<MoviesPage />} />
                      <Route path="movies/:id" element={<MovieDetailsPage />} />
                      <Route path="shows" element={<ShowsPage />} />
                      <Route path="shows/:id" element={<ShowDetailsPage />} />
                      <Route path="music" element={<MusicPage />} />
                      <Route path="music/album/:id" element={<MusicCollectionPage type="album" />} />
                      <Route path="music/artist/:id" element={<MusicCollectionPage type="artist" />} />
                      <Route path="music/playlist/:id" element={<MusicCollectionPage type="playlist" />} />
                      <Route path="videos" element={<VideosPage />} />
                      <Route path="videos/:id" element={<VideoDetailsPage />} />
                      <Route path="library" element={<LibraryPage />} />
                      <Route path="friends" element={<FriendsPage />} />
                      <Route path="friends/:id" element={<FriendLibraryPage />} />
                      <Route path="sharing" element={<SharingPage />} />
                      <Route path="search" element={<SearchPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="settings" element={<Navigate to="/settings/account" replace />} />
                      <Route path="settings/:section" element={<SettingsPage />} />
                      <Route path="ui-states" element={<StatesGalleryPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Route>
                  </Route>
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </MusicPlayerProvider>
            </UserDataProvider>
          </ToastProvider>
        </ProfilesProvider>
      </SettingsProvider>
    </HashRouter>
  );
}
