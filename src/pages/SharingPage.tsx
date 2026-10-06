import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Friend, Permission, ShareCategory } from '@/models';
import { db } from '@/data/mock';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useUserData } from '@/state/userData';
import { useToast } from '@/state/toast';
import { MOCK_NOW } from '@/data/mock/builders';
import { formatDate, plural } from '@/lib';
import { Avatar, Badge, Button, Chip, Dialog, EmptyState, Icon, Modal, Select, Toggle } from '@/components/ui';
import { PageHeader } from '@/components/layout';

const CATEGORIES: { key: ShareCategory; label: string; allow: string; icon: 'film' | 'tv' | 'music' | 'video'; hint: string }[] = [
  { key: 'movies', label: 'Movies', allow: 'Allow Movies', icon: 'film', hint: 'Every movie in your library' },
  { key: 'shows', label: 'TV Shows', allow: 'Allow TV Shows', icon: 'tv', hint: 'All shows, seasons and episodes' },
  { key: 'music', label: 'Music', allow: 'Allow Music', icon: 'music', hint: 'Albums, artists and playlists' },
  { key: 'videos', label: 'Videos', allow: 'Allow Videos', icon: 'video', hint: 'Personal videos — be selective' },
];

const ownCount = (c: ShareCategory) => ({ movies: db.movies, shows: db.shows, music: db.albums, videos: db.videos })[c].filter((m) => m.ownerId === db.me.id).length;

type Expiry = 'never' | '1d' | '7d' | '30d' | 'custom';
const DAY = 86_400_000;

function expiryOf(p: Permission): Expiry {
  return p.expiresAt === null ? 'never' : 'custom';
}

export function SharingPage() {
  useDocumentTitle('Manage Sharing');
  const [params, setParams] = useSearchParams();
  const data = useUserData();
  const toast = useToast();
  const friendId = params.get('friend') ?? db.friends[0]?.id;
  const friend = db.friends.find((f) => f.id === friendId) ?? db.friends[0];
  const perm = data.outgoing.find((p) => p.granteeId === friend?.id);
  const [titlesOpen, setTitlesOpen] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);

  if (!friend || !perm)
    return (
      <div className="page page--top">
        <EmptyState icon="share" title="No shared libraries" description="Add a friend first, then choose exactly what they can stream." />
      </div>
    );

  const revoked = perm.status === 'revoked';
  const allowedCount = CATEGORIES.filter((c) => perm.categories[c.key]).length;

  return (
    <div className="page page--top sharing">
      <PageHeader
        eyebrow="Owner controls"
        title="Manage Sharing"
        description="Choose what each friend can stream from your library. They can watch and listen — never download, save or copy."
      />
      <div className="sharing__layout">
        <nav className="sharing__list" aria-label="Friends">
          <ul>
            {db.friends.map((f) => {
              const p = data.outgoing.find((x) => x.granteeId === f.id)!;
              return (
                <li key={f.id}>
                  <FriendRow friend={f} perm={p} selected={f.id === friend.id} onSelect={() => setParams({ friend: f.id }, { replace: true })} />
                </li>
              );
            })}
          </ul>
        </nav>

        <section className="sharing__panel" aria-label={`Sharing with ${friend.name}`}>
          <header className="sharing__panel-head">
            <Avatar spec={friend.avatar} size="lg" presence={friend.presence} />
            <div>
              <h2>Sharing with {friend.name}</h2>
              <p className="muted">{revoked ? 'Access revoked — nothing is shared.' : allowedCount ? `${allowedCount} of 4 categories shared` : 'Nothing shared yet'}</p>
            </div>
            <span className="spacer" />
            {revoked ? (
              <Button variant="primary" icon="repeat" onClick={() => (data.restoreAccess(friend.id), toast.show(`Access restored for ${friend.name}. Pick what to share.`, { tone: 'success' }))}>
                Restore access
              </Button>
            ) : (
              <Button variant="danger" icon="ban" onClick={() => setRevokeOpen(true)}>Revoke access</Button>
            )}
          </header>

          <ul className="perm-summary" aria-label="Summary">
            {CATEGORIES.map((c) => (
              <li key={c.key} className={perm.categories[c.key] ? 'is-on' : ''}>
                <span>{c.label}</span>
                <b>{perm.categories[c.key] ? 'Allowed' : 'Not Allowed'}</b>
              </li>
            ))}
          </ul>

          <h3 className="sharing__h">Library categories</h3>
          <ul className="perm-list">
            {CATEGORIES.map((c) => (
              <li key={c.key} className="perm-row">
                <span className="perm-row__icon"><Icon name={c.icon} /></span>
                <div className="perm-row__text">
                  <strong>{c.allow}</strong>
                  <span className="dim">{c.hint} · {plural(ownCount(c.key), c.key === 'music' ? 'album' : 'title')}</span>
                </div>
                <Toggle
                  label={`${c.allow} for ${friend.name}`}
                  checked={perm.categories[c.key]}
                  disabled={revoked}
                  onChange={(v) => {
                    data.setCategory(friend.id, c.key, v);
                    toast.show(`${friend.name} ${v ? 'can now stream' : 'can no longer stream'} your ${c.label}`, { tone: 'success', icon: v ? 'check' : 'lock' });
                  }}
                />
              </li>
            ))}
          </ul>

          <div className="sharing__adv-head">
            <h3 className="sharing__h">Fine-grained access</h3>
            <Badge tone="accent">Preview</Badge>
          </div>
          <p className="dim" style={{ marginBottom: '0.75rem' }}>Per-title, collection and time-limited access. These controls are mock-only in this build and reset when you reload.</p>
          <ul className="perm-list">
            <li className="perm-row">
              <span className="perm-row__icon"><Icon name="film" /></span>
              <div className="perm-row__text">
                <strong>Individual title access</strong>
                <span className="dim">{perm.titleGrantIds.length ? `${plural(perm.titleGrantIds.length, 'title')} shared individually` : 'Share single titles without opening a whole category'}</span>
              </div>
              <Button variant="secondary" disabled={revoked} onClick={() => setTitlesOpen(true)}>Choose titles…</Button>
            </li>
            <li className="perm-row perm-row--col">
              <div className="perm-row__line">
                <span className="perm-row__icon"><Icon name="folder" /></span>
                <div className="perm-row__text">
                  <strong>Collection access</strong>
                  <span className="dim">Share curated groups of titles</span>
                </div>
              </div>
              <div className="row row--wrap perm-row__chips">
                {db.collections.map((col) => {
                  const on = perm.collectionGrantIds.includes(col.id);
                  return (
                    <Chip key={col.id} selected={on} disabled={revoked} onClick={() => data.patchPermission(friend.id, { collectionGrantIds: on ? perm.collectionGrantIds.filter((x) => x !== col.id) : [...perm.collectionGrantIds, col.id] })}>
                      {on && <Icon name="check" size="1em" />} {col.name} · {col.itemIds.length}
                    </Chip>
                  );
                })}
              </div>
            </li>
            <li className="perm-row">
              <span className="perm-row__icon"><Icon name="calendar" /></span>
              <div className="perm-row__text">
                <strong>Expiration</strong>
                <span className="dim">{perm.expiresAt ? `Access ends ${formatDate(perm.expiresAt)}` : 'Access continues until you revoke it'}</span>
              </div>
              <Select<Expiry>
                label="Expires"
                value={expiryOf(perm)}
                align="end"
                options={[
                  { value: 'never', label: 'Never' },
                  { value: '1d', label: 'In 24 hours' },
                  { value: '7d', label: 'In 7 days' },
                  { value: '30d', label: 'In 30 days' },
                  ...(perm.expiresAt ? [{ value: 'custom' as const, label: formatDate(perm.expiresAt) }] : []),
                ]}
                onChange={(v) => {
                  if (v === 'custom') return;
                  const days = { never: 0, '1d': 1, '7d': 7, '30d': 30 }[v];
                  data.patchPermission(friend.id, { expiresAt: days ? new Date(MOCK_NOW + days * DAY).toISOString() : null });
                  toast.show(days ? `${friend.name}'s access will expire in ${days === 1 ? '24 hours' : `${days} days`}` : 'Access no longer expires', { icon: 'calendar' });
                }}
              />
            </li>
          </ul>
          <p className="dim sharing__foot">
            <Icon name="shield" size="1em" /> {friend.name} streams directly from your computer through a private, short-lived session. They never see file locations and have no way to download.
          </p>
        </section>
      </div>

      <TitlePicker open={titlesOpen} onClose={() => setTitlesOpen(false)} friend={friend} selected={perm.titleGrantIds} onSave={(ids) => (data.patchPermission(friend.id, { titleGrantIds: ids }), setTitlesOpen(false), toast.show(`${plural(ids.length, 'title')} shared with ${friend.name}`, { tone: 'success' }))} />
      <Dialog
        open={revokeOpen}
        title={`Revoke ${friend.name}'s access?`}
        description={`${friend.name} will immediately lose access to everything you share, including anything they are streaming right now. You can restore access later.`}
        confirmLabel="Revoke access"
        tone="danger"
        onCancel={() => setRevokeOpen(false)}
        onConfirm={() => {
          data.revokeAccess(friend.id);
          setRevokeOpen(false);
          toast.show(`${friend.name}'s access has been revoked`, { tone: 'danger', icon: 'ban' });
        }}
      />
    </div>
  );
}

function FriendRow({ friend, perm, selected, onSelect }: { friend: Friend; perm: Permission; selected: boolean; onSelect: () => void }) {
  const revoked = perm.status === 'revoked';
  const on = CATEGORIES.filter((c) => perm.categories[c.key]);
  return (
    <button type="button" className={`friend-row ${selected ? 'is-selected' : ''}`} onClick={onSelect} aria-current={selected}>
      <Avatar spec={friend.avatar} size="md" presence={friend.presence} />
      <span className="friend-row__text">
        <strong>{friend.name}</strong>
        <span className="dim truncate">{revoked ? 'Access revoked' : on.length ? on.map((c) => c.label).join(' · ') : 'Nothing shared'}</span>
      </span>
      {revoked ? <Badge tone="danger">Revoked</Badge> : <Badge tone={on.length ? 'success' : 'neutral'}>{on.length}/4</Badge>}
    </button>
  );
}

function TitlePicker({ open, onClose, friend, selected, onSave }: { open: boolean; onClose: () => void; friend: Friend; selected: string[]; onSave: (ids: string[]) => void }) {
  const [ids, setIds] = useState<string[]>(selected);
  const movies = useMemo(() => db.movies.filter((m) => m.ownerId === db.me.id), []);
  // Re-seed when reopened for a different friend.
  const [seedKey, setSeedKey] = useState('');
  if (open && seedKey !== friend.id + selected.join()) {
    setSeedKey(friend.id + selected.join());
    setIds(selected);
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Choose titles for ${friend.name}`}
      description="Selected titles are streamable by this friend even if the category is off."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => onSave(ids)}>Save · {ids.length} selected</Button>
        </>
      }
    >
      <ul className="picker">
        {movies.map((m, i) => {
          const on = ids.includes(m.id);
          return (
            <li key={m.id}>
              <button type="button" className={`picker__row ${on ? 'is-on' : ''}`} role="checkbox" aria-checked={on} onClick={() => setIds(on ? ids.filter((x) => x !== m.id) : [...ids, m.id])} data-autofocus={i === 0 ? '' : undefined}>
                <img src={m.artwork.thumb} alt="" loading="lazy" />
                <span className="picker__text"><strong className="truncate">{m.title}</strong><span className="dim">{m.year} · {m.genres[0]}</span></span>
                <span className="picker__check">{on && <Icon name="check" size="1em" />}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
