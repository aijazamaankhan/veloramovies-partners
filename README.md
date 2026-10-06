# VibeVault — Phase 1 (UI only)

A private, Netflix-style media network for your own library and trusted friends' libraries.
**Phase 1 is a front-end prototype with mock data.** There is no backend, database, auth, networking,
file access, FFmpeg, streaming or downloading. Nothing is read from or written to disk.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build (relative base, wrappable by a desktop shell / TV WebView)
```

Pick a profile (Sam has the richest data; Guest shows empty states). Press `?` for shortcuts, `T` to toggle TV layout.

## Structure

```
src/
  models/          Domain interfaces (User, Profile, Media, Movie, TVShow, Episode, Album, Song, Video,
                   Friend, Library, Permission, PlaybackState …). No path/URL/credential fields, ever.
  data/
    mock/          In-memory dataset (32 movies, 15 shows/…, 62 songs …) + procedural SVG artwork (art.ts)
    access.ts      Browse/stream access decisions (mirrors future permission service)
    queries.ts     Pure synchronous queries — all apply access checks
  services/        Async, typed "client" the pages call (catalog.ts) + simulated latency
  state/           Settings, profiles, user data (favourites, My List, outgoing permissions), music player, toasts
  hooks/           useAsync, spatial (D-pad) navigation, input modality, media actions
  components/
    ui/            Button, IconButton, Icon, Avatar, Badge, ProgressBar, Toggle, Slider, Tabs, Chip, Segmented,
                   SearchBar, Skeleton, Toast, Modal, Dialog, Menu/Select (Dropdown), EmptyState/ErrorState
    media/         MediaCard, Movie/Show/Album/Song/Artist/Playlist/Video/Episode/FriendLibrary cards,
                   ContentRow, HeroBanner, DetailHero, TrackList, Skeletons, AsyncView
    layout/        AppShell, Sidebar, TopNavigation, PageHeader, Logo, ShortcutsDialog
    player/        MiniPlayer, NowPlaying, PlayerControls (music), VideoPlayer (mock)
  pages/           One component per screen
  styles/          tokens.css (design tokens), base.css, pages.css
```

## Screens

Profiles (select / manage) · Home · Movies · Movie details · TV Shows · Show details (seasons/episodes) ·
Music (Home/Albums/Artists/Songs/Playlists/Favorites/Recently played) · Album / Artist / Playlist · Videos (private categories) ·
Video details · My Library (filter/sort/grid-list) · Friends · Friend library · Manage Sharing · Search ·
Player (mock) · Profile (Continue/Favorites/History) · Settings (10 sections) · UI States gallery (`Settings → About`).

## Notable behaviours to try

- Friends: **John** fails to load once (retry works) · **David** is offline (browse only, playback blocked) ·
  **Maya** is revoked · **Alex** hasn't shared Music/Videos (locked sections).
- "Zero Hour Lullaby" is unavailable. Sharing toggles, revoke/restore and expiry are live in-session.
- Navigate everything with arrow keys / Enter / Esc (TV remote model). TV layout: `T` or Settings → Appearance.

## Security stance (enforced in the UI design)

No download / save / export / copy-file control exists anywhere. Models carry no filesystem paths, SMB paths,
direct URLs or credentials. Shared media is labelled "Shared by …" and "Stream only".

## Known limitations

Mock data resets on reload (nothing persists) · playback is simulated (no audio/video) · artwork is generated SVG ·
friend invites / pairing / add-folder are previews · not tested on real Android TV hardware ·
the profile named "Alex" from the brief was renamed to "Riley" to avoid clashing with friend Alex.
