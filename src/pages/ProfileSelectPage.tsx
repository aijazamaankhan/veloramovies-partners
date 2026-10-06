import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AvatarSpec, Profile } from '@/models';
import { useProfiles, MAX_PROFILES } from '@/state/profiles';
import { useToast } from '@/state/toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { paths } from '@/routes';
import { Avatar, Button, Dialog, Icon, Modal } from '@/components/ui';
import { Logo } from '@/components/layout';

export const AVATAR_PALETTE: [string, string][] = [
  ['#7c5cff', '#ff7ac6'], ['#18b3a5', '#f9e27d'], ['#3b82f6', '#9be7ff'], ['#d6336c', '#ffb84d'],
  ['#2fbf71', '#d4f57a'], ['#e8833a', '#ffe08a'], ['#a24bff', '#4de1ff'], ['#64748b', '#94a3b8'],
];

export function ProfileSelectPage({ manage = false }: { manage?: boolean }) {
  useDocumentTitle(manage ? 'Manage profiles' : "Who's watching?");
  const navigate = useNavigate();
  const { profiles, select, add, update, remove } = useProfiles();
  const toast = useToast();
  const [editing, setEditing] = useState<Profile | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Profile | null>(null);

  return (
    <main className="profiles">
      <Logo />
      <h1>{manage ? 'Manage profiles' : "Who's watching?"}</h1>
      <ul className="profiles__grid">
        {profiles.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              className="profile-tile"
              onClick={() => {
                if (manage) setEditing(p);
                else {
                  select(p.id);
                  navigate(paths.home);
                }
              }}
              data-autofocus={i === 0 ? '' : undefined}
              aria-label={manage ? `Edit profile ${p.name}` : `Watch as ${p.name}`}
            >
              <span className="profile-tile__avatar">
                <Avatar spec={p.avatar} size="xl" shape="rounded" />
                {manage && <span className="profile-tile__edit"><Icon name="edit" size="2rem" /></span>}
              </span>
              <span className="profile-tile__name">{p.name}</span>
              {p.kind === 'guest' && <span className="dim">Guest</span>}
            </button>
          </li>
        ))}
        {profiles.length < MAX_PROFILES && (
          <li>
            <button type="button" className="profile-tile profile-tile--add" onClick={() => setEditing('new')} aria-label="Add profile">
              <span className="profile-tile__avatar profile-tile__avatar--add"><Icon name="plus" size="3rem" /></span>
              <span className="profile-tile__name">Add Profile</span>
            </button>
          </li>
        )}
      </ul>
      <Button variant={manage ? 'primary' : 'glass'} size="lg" onClick={() => navigate(manage ? paths.profiles : paths.manageProfiles)}>
        {manage ? 'Done' : 'Manage profiles'}
      </Button>
      <p className="dim profiles__note"><Icon name="lock" size="1em" /> Each profile keeps its own Continue Watching, Favorites and History.</p>

      <ProfileEditor
        key={editing === null ? 'closed' : editing === 'new' ? 'new' : editing.id}
        target={editing}
        canDelete={profiles.length > 1}
        onClose={() => setEditing(null)}
        onSave={(name, avatar) => {
          if (editing === 'new') {
            add(name, avatar);
            toast.show(`Profile “${name}” created`, { tone: 'success' });
          } else if (editing) {
            update(editing.id, { name, avatar });
            toast.show('Profile updated', { tone: 'success' });
          }
          setEditing(null);
        }}
        onDelete={() => editing && editing !== 'new' && (setDeleting(editing), setEditing(null))}
      />
      <Dialog
        open={!!deleting}
        title={`Delete ${deleting?.name}?`}
        description="Their Continue Watching, Favorites and History will be removed from this device."
        confirmLabel="Delete profile"
        tone="danger"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) remove(deleting.id);
          toast.show(`Profile “${deleting?.name}” deleted`, { icon: 'check' });
          setDeleting(null);
        }}
      />
    </main>
  );
}

function ProfileEditor({ target, canDelete, onClose, onSave, onDelete }: { target: Profile | 'new' | null; canDelete: boolean; onClose: () => void; onSave: (name: string, avatar: AvatarSpec) => void; onDelete: () => void }) {
  const existing = target && target !== 'new' ? target : null;
  const [name, setName] = useState(existing?.name ?? '');
  const [colors, setColors] = useState<[string, string]>(existing?.avatar.colors ?? AVATAR_PALETTE[0]);
  const trimmed = name.trim();
  const avatar: AvatarSpec = { initials: (trimmed[0] ?? '?').toUpperCase(), colors };
  return (
    <Modal
      open={target !== null}
      onClose={onClose}
      title={existing ? 'Edit profile' : 'Add profile'}
      size="sm"
      footer={
        <>
          {existing && canDelete && <Button variant="danger" onClick={onDelete}>Delete</Button>}
          <span className="spacer" />
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!trimmed} onClick={() => onSave(trimmed, avatar)}>Save</Button>
        </>
      }
    >
      <div className="profile-editor">
        <Avatar spec={avatar} size="xl" shape="rounded" />
        <label className="field">
          <span className="field__label">Name</span>
          <input className="input" value={name} maxLength={16} onChange={(e) => setName(e.target.value)} placeholder="Profile name" data-autofocus />
        </label>
        <div role="radiogroup" aria-label="Avatar colour" className="swatches">
          {AVATAR_PALETTE.map((c) => (
            <button key={c[0]} type="button" role="radio" aria-checked={c[0] === colors[0]} aria-label={`Colour ${c[0]}`} className={`swatch ${c[0] === colors[0] ? 'is-on' : ''}`} style={{ background: `linear-gradient(135deg, ${c[0]}, ${c[1]})` }} onClick={() => setColors(c)} />
          ))}
        </div>
      </div>
    </Modal>
  );
}
