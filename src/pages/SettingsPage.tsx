import { useState, type ReactNode } from 'react';
import { Navigate, NavLink, useNavigate, useParams } from 'react-router-dom';
import { db } from '@/data/mock';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useProfiles } from '@/state/profiles';
import { ACCENTS, useSettings, type Settings } from '@/state/settings';
import { useToast } from '@/state/toast';
import { useUserData } from '@/state/userData';
import { paths } from '@/routes';
import { Avatar, Badge, Button, Dialog, EmptyState, Icon, LinkButton, Modal, Segmented, Select, Slider, Toggle, type IconName } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { incomingPermission, isExpired } from '@/data/access';

const SECTIONS: { id: string; label: string; icon: IconName }[] = [
  { id: 'account', label: 'Account', icon: 'user' },
  { id: 'playback', label: 'Playback', icon: 'play' },
  { id: 'appearance', label: 'Appearance', icon: 'eye' },
  { id: 'audio', label: 'Audio', icon: 'speaker' },
  { id: 'subtitles', label: 'Subtitles', icon: 'subtitles' },
  { id: 'devices', label: 'Devices', icon: 'monitor' },
  { id: 'privacy', label: 'Privacy', icon: 'lock' },
  { id: 'friends', label: 'Friends', icon: 'users' },
  { id: 'sharing', label: 'Sharing', icon: 'share' },
  { id: 'about', label: 'About', icon: 'info' },
];

function Row({ label, description, children, stack }: { label: string; description?: ReactNode; children: ReactNode; stack?: boolean }) {
  return (
    <div className={`setting ${stack ? 'setting--stack' : ''}`}>
      <div className="setting__text">
        <strong>{label}</strong>
        {description && <span className="dim">{description}</span>}
      </div>
      <div className="setting__control">{children}</div>
    </div>
  );
}

const opts = <T extends string>(...v: T[]) => v.map((x) => ({ value: x, label: x }));

export function SettingsPage() {
  const { section = 'account' } = useParams();
  const current = SECTIONS.find((s) => s.id === section);
  useDocumentTitle(current ? `${current.label} settings` : 'Settings');
  if (!current) return <Navigate to={paths.settings()} replace />;

  return (
    <div className="page page--top settings">
      <PageHeader title="Settings" description="Everything here is a UI preview — changes apply to this session only." />
      <div className="settings__layout">
        <nav className="settings__nav" aria-label="Settings sections">
          {SECTIONS.map((s) => (
            <NavLink key={s.id} to={paths.settings(s.id)} className={({ isActive }) => `settings__link ${isActive ? 'is-active' : ''}`} data-autofocus={s.id === section ? '' : undefined}>
              <Icon name={s.icon} /> {s.label}
            </NavLink>
          ))}
        </nav>
        <section className="settings__panel" aria-labelledby="settings-title" key={section}>
          <h2 id="settings-title">{current.label}</h2>
          <SectionBody id={section} />
        </section>
      </div>
    </div>
  );
}

function useSet() {
  const { settings, update } = useSettings();
  return <K extends keyof Settings>(key: K) => ({ value: settings[key], onChange: (v: Settings[K]) => update(key, v) });
}

function SectionBody({ id }: { id: string }) {
  const { settings, update } = useSettings();
  const bind = useSet();
  const toast = useToast();
  const navigate = useNavigate();
  const profiles = useProfiles();
  const data = useUserData();
  const [signOut, setSignOut] = useState(false);
  const [revoke, setRevoke] = useState<string | null>(null);
  const [pairing, setPairing] = useState(false);
  const [devices, setDevices] = useState([
    { id: 'd2', name: 'Living Room TV', kind: 'Android TV', last: '2 hours ago' },
    { id: 'd3', name: 'MacBook Air', kind: 'macOS desktop', last: 'Yesterday' },
    { id: 'd4', name: 'Pixel Tablet', kind: 'Android', last: '3 weeks ago' },
  ]);

  const toggle = (key: 'autoplayNext' | 'autoplayPreviews' | 'skipIntros' | 'subtitleBackground' | 'normalizeVolume' | 'activityVisibility' | 'showOnlineStatus', label: string) => (
    <Toggle label={label} checked={settings[key]} onChange={(v) => update(key, v)} />
  );

  switch (id) {
    case 'account':
      return (
        <>
          <Row label="Display name" description="Shown to friends you share with.">
            <input className="input" value={settings.displayName} onChange={(e) => update('displayName', e.target.value)} aria-label="Display name" />
          </Row>
          <Row label="Email" description="Used for sign-in and friend invites."><span className="muted">{db.me.email}</span></Row>
          <Row label="Password" description="Last changed 4 months ago."><Button onClick={() => toast.show('Password management arrives with User Accounts (Phase 4)', { icon: 'info' })}>Change password</Button></Row>
          <Row label="Profiles" description={`${profiles.profiles.length} profiles on this account.`}><LinkButton to={paths.manageProfiles} icon="users">Manage profiles</LinkButton></Row>
          <Row label="Sign out" description="You'll return to the profile screen."><Button variant="danger" icon="logout" onClick={() => setSignOut(true)}>Sign out</Button></Row>
          <Dialog open={signOut} title="Sign out of VibeVault?" description="Your library stays on this computer. Friends streaming from you will be disconnected." confirmLabel="Sign out" onCancel={() => setSignOut(false)} onConfirm={() => (setSignOut(false), profiles.select(null), navigate(paths.profiles))} />
        </>
      );
    case 'playback':
      return (
        <>
          <Row label="Autoplay next episode" description="Continue to the next episode automatically.">{toggle('autoplayNext', 'Autoplay next episode')}</Row>
          <Row label="Autoplay previews" description="Play trailers and previews while browsing.">{toggle('autoplayPreviews', 'Autoplay previews')}</Row>
          <Row label="Skip intros" description="Show a Skip Intro button when available.">{toggle('skipIntros', 'Skip intros')}</Row>
          <Row label="Video quality" description="Auto adapts to the connection to the owner's server."><Select {...bind('videoQuality')} label="Video quality" prefixLabel={false} align="end" options={opts('Auto', '4K', '1080p', '720p')} /></Row>
          <Row label="Default audio"><Select {...bind('defaultAudio')} label="Default audio" prefixLabel={false} align="end" options={opts('English', 'Spanish', 'French', 'Japanese')} /></Row>
          <Row label="Default subtitles"><Select {...bind('defaultSubtitles')} label="Default subtitles" prefixLabel={false} align="end" options={opts('Off', 'English', 'Spanish', 'French')} /></Row>
        </>
      );
    case 'appearance':
      return (
        <>
          <Row label="Theme" description="Dark themes keep the focus on artwork."><Segmented label="Theme" {...bind('theme')} options={[{ value: 'cinematic', label: 'Cinematic' }, { value: 'midnight', label: 'Midnight' }, { value: 'oled', label: 'OLED black' }]} /></Row>
          <Row label="Accent colour" description="Used for progress, highlights and active states.">
            <div className="swatches" role="radiogroup" aria-label="Accent colour">
              {ACCENTS.map((a) => (
                <button key={a.id} type="button" role="radio" aria-checked={settings.accent === a.value} aria-label={a.label} title={a.label} className={`swatch ${settings.accent === a.value ? 'is-on' : ''}`} style={{ background: a.value }} onClick={() => update('accent', a.value)} />
              ))}
            </div>
          </Row>
          <Row label="Layout density" description="Compact fits more titles on screen."><Segmented label="Layout density" {...bind('density')} options={[{ value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }]} /></Row>
          <Row label="Interface mode" description="TV mode enlarges text and controls for viewing from the sofa, and is built for a remote (arrow keys + Enter + Esc)."><Segmented label="Interface mode" {...bind('mode')} options={[{ value: 'desktop', label: 'Desktop' }, { value: 'tv', label: 'TV (10-foot)' }]} /></Row>
        </>
      );
    case 'audio':
      return (
        <>
          <Row label="Normalize volume" description="Keeps loudness consistent between songs and titles.">{toggle('normalizeVolume', 'Normalize volume')}</Row>
          <Row label="Crossfade" description={settings.crossfade ? `${settings.crossfade} seconds between songs` : 'Off'}>
            <div className="setting__slider"><Slider label="Crossfade" value={settings.crossfade} max={12} step={1} onChange={(v) => update('crossfade', v)} valueText={`${settings.crossfade} seconds`} /></div>
          </Row>
          <Row label="Audio output"><Select {...bind('audioOutput')} label="Audio output" prefixLabel={false} align="end" options={opts('Stereo', '5.1 surround', 'Passthrough')} /></Row>
          <Row label="Equalizer"><Select {...bind('equalizer')} label="Equalizer" prefixLabel={false} align="end" options={opts('Flat', 'Bass boost', 'Vocal', 'Cinema')} /></Row>
        </>
      );
    case 'subtitles':
      return (
        <>
          <div className="subtitle-preview" aria-label="Subtitle preview">
            <span style={{ fontSize: settings.subtitleSize === 'Large' ? '1.8em' : settings.subtitleSize === 'Small' ? '1.05em' : '1.4em', color: settings.subtitleColor === 'Yellow' ? '#ffe66d' : settings.subtitleColor === 'Cyan' ? '#7df3ff' : '#fff', background: settings.subtitleBackground ? 'rgba(0,0,0,.65)' : 'transparent' }}>This is how subtitles will look.</span>
          </div>
          <Row label="Size"><Segmented label="Subtitle size" {...bind('subtitleSize')} options={opts('Small', 'Medium', 'Large')} /></Row>
          <Row label="Colour"><Segmented label="Subtitle colour" {...bind('subtitleColor')} options={opts('White', 'Yellow', 'Cyan')} /></Row>
          <Row label="Background" description="A dark box behind text improves legibility.">{toggle('subtitleBackground', 'Subtitle background')}</Row>
          <Row label="Default language"><Select {...bind('defaultSubtitles')} label="Default subtitles" prefixLabel={false} align="end" options={opts('Off', 'English', 'Spanish', 'French')} /></Row>
        </>
      );
    case 'devices':
      return (
        <>
          <Row label="This device's name" description="Friends and your other devices see this name."><input className="input" value={settings.deviceName} onChange={(e) => update('deviceName', e.target.value)} aria-label="Device name" /></Row>
          <h3 className="settings__sub">Connected devices</h3>
          <ul className="device-list">
            <li className="device"><Icon name="monitor" size="1.6rem" /><div className="device__text"><strong>{settings.deviceName} <Badge tone="success">This device</Badge></strong><span className="dim">Windows desktop · Last active: Now</span></div></li>
            {devices.map((d) => (
              <li key={d.id} className="device">
                <Icon name={d.kind === 'Android TV' ? 'tv' : 'monitor'} size="1.6rem" />
                <div className="device__text"><strong>{d.name}</strong><span className="dim">{d.kind} · Last active: {d.last}</span></div>
                <Button variant="ghost" onClick={() => (setDevices((l) => l.filter((x) => x.id !== d.id)), toast.show(`${d.name} was signed out`, { tone: 'success' }))}>Sign out</Button>
              </li>
            ))}
          </ul>
          {devices.length === 0 && <EmptyState compact icon="monitor" title="No other devices" description="Pair an Android TV to watch from the sofa." />}
          <Button variant="primary" icon="tv" onClick={() => setPairing(true)}>Pair a TV</Button>
          <Modal open={pairing} onClose={() => setPairing(false)} title="Pair an Android TV" description="Open VibeVault on your TV and enter this code. (Preview — pairing arrives in Phase 7.)" size="sm" footer={<Button variant="primary" onClick={() => setPairing(false)} data-autofocus>Done</Button>}>
            <div className="pair-code" aria-label="Pairing code 7 Q K 4 M 2">7QK-4M2</div>
          </Modal>
        </>
      );
    case 'privacy':
      return (
        <>
          <Row label="Profile visibility" description="Who can see your profile name and avatar."><Select {...bind('profileVisibility')} label="Profile visibility" prefixLabel={false} align="end" options={opts('Everyone', 'Friends only', 'Only me')} /></Row>
          <Row label="Activity visibility" description="Let friends see what you're watching or listening to.">{toggle('activityVisibility', 'Activity visibility')}</Row>
          <Row label="Show online status" description="Friends can see when you're online.">{toggle('showOnlineStatus', 'Show online status')}</Row>
          <div className="notice notice--ok"><Icon name="shield" /><div><strong>Streaming only.</strong> <span className="muted">Nobody can download your media, and file locations are never revealed to friends.</span></div></div>
        </>
      );
    case 'friends':
      return (
        <>
          <Row label="Who can send friend requests"><Select {...bind('friendRequests')} label="Friend requests" prefixLabel={false} align="end" options={opts('Everyone', 'Friends of friends', 'Nobody')} /></Row>
          <Row label="Access for new friends" description="What a newly accepted friend can stream by default."><Select {...bind('newFriendAccess')} label="Default access" prefixLabel={false} align="end" options={opts('No access', 'Movies & TV Shows', 'Everything')} /></Row>
          <h3 className="settings__sub">Your friends</h3>
          <ul className="device-list">
            {db.friends.map((f) => (
              <li key={f.id} className="device">
                <Avatar spec={f.avatar} size="md" presence={f.presence} />
                <div className="device__text"><strong>{f.name}</strong><span className="dim">{f.lastSeenLabel}</span></div>
                <LinkButton variant="ghost" to={paths.sharing(f.id)}>Permissions</LinkButton>
              </li>
            ))}
          </ul>
        </>
      );
    case 'sharing': {
      const active = data.outgoing.filter((p) => p.status === 'active' && Object.values(p.categories).some(Boolean));
      const incoming = db.incomingPermissions;
      const target = db.friends.find((f) => f.id === revoke);
      return (
        <>
          <h3 className="settings__sub">Friends with access to your library <Badge tone="accent">{active.length}</Badge></h3>
          {active.length === 0 ? (
            <EmptyState compact icon="share" title="No shared libraries" description="You're not sharing anything right now." />
          ) : (
            <ul className="device-list">
              {active.map((p) => {
                const f = db.friends.find((x) => x.id === p.granteeId)!;
                const cats = Object.entries(p.categories).filter(([, v]) => v).map(([k]) => k);
                return (
                  <li key={p.id} className="device">
                    <Avatar spec={f.avatar} size="md" presence={f.presence} />
                    <div className="device__text"><strong>{f.name}</strong><span className="dim">{cats.map((c) => c[0].toUpperCase() + c.slice(1)).join(' · ')}</span></div>
                    <LinkButton variant="ghost" to={paths.sharing(f.id)}>Edit</LinkButton>
                    <Button variant="danger" onClick={() => setRevoke(f.id)}>Revoke access</Button>
                  </li>
                );
              })}
            </ul>
          )}
          <h3 className="settings__sub">Libraries shared with you</h3>
          <ul className="device-list">
            {incoming.map((p) => {
              const f = db.friends.find((x) => x.id === p.ownerId)!;
              const off = p.status === 'revoked' || isExpired(p);
              const cats = Object.entries(incomingPermission(f.id)!.categories).filter(([, v]) => v).map(([k]) => k);
              return (
                <li key={p.id} className="device">
                  <Avatar spec={f.avatar} size="md" presence={f.presence} />
                  <div className="device__text"><strong>{f.name}'s Library</strong><span className="dim">{off ? 'Access revoked' : cats.map((c) => c[0].toUpperCase() + c.slice(1)).join(' · ')}</span></div>
                  <LinkButton variant="ghost" to={paths.friend(f.id)}>Open</LinkButton>
                </li>
              );
            })}
          </ul>
          <Dialog open={!!target} title={`Revoke ${target?.name}'s access?`} description="They'll immediately lose access to everything you share. You can restore it later." confirmLabel="Revoke access" tone="danger" onCancel={() => setRevoke(null)} onConfirm={() => { if (target) data.revokeAccess(target.id); toast.show(`${target?.name}'s access has been revoked`, { tone: 'danger', icon: 'ban' }); setRevoke(null); }} />
        </>
      );
    }
    case 'about':
      return (
        <>
          <Row label="VibeVault" description="Private media network"><Badge tone="accent">v0.1.0 · Phase 1</Badge></Row>
          <div className="notice"><Icon name="info" /><div><strong>Phase 1 is a UI-only prototype.</strong> <span className="muted">No backend, no network, no real files. Everything you see is mock data in memory.</span></div></div>
          <h3 className="settings__sub">Planned architecture</h3>
          <ol className="arch">
            {['Your account', 'Authentication server', 'Your desktop media server', 'Local media library', 'Permission service', 'Secure streaming session', "Friend's desktop / Android TV"].map((s, i) => (
              <li key={s}><span className="arch__n">{i + 1}</span>{s}</li>
            ))}
          </ol>
          <p className="dim">Media streams directly from the owner's computer. The cloud only handles identity, friendships, permissions, device registration and metadata sync — never your files.</p>
          <h3 className="settings__sub">Preview tools</h3>
          <Row label="Slow loading" description="Stretch loading time so skeleton screens are easy to review."><Toggle label="Slow loading" checked={settings.slowLoading} onChange={(v) => update('slowLoading', v)} /></Row>
          <Row label="UI states gallery" description="Loading, empty and error screens in one place."><LinkButton to={paths.states} icon="grid">Open gallery</LinkButton></Row>
        </>
      );
    default:
      return null;
  }
}
