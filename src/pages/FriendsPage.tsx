import { useState } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import * as catalog from '@/services/catalog';
import type { FriendLibrarySummary } from '@/services/catalog';
import { useUserData } from '@/state/userData';
import { useToast } from '@/state/toast';
import { paths } from '@/routes';
import { plural } from '@/lib';
import { Avatar, Badge, Button, EmptyState, Icon, LinkButton, Modal } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { AsyncView, GridSkeleton, PageHeaderSkeleton } from '@/components/media';

function Skeleton() {
  return (
    <div className="page page--top" role="status" aria-label="Loading friends">
      <PageHeaderSkeleton />
      <GridSkeleton variant="landscape" count={6} />
    </div>
  );
}

const LIBRARY_BADGE = {
  available: { tone: 'success', label: 'Library ready' },
  'owner-offline': { tone: 'warn', label: 'Offline — browse only' },
  revoked: { tone: 'danger', label: 'Access revoked' },
  error: { tone: 'warn', label: 'Needs attention' },
} as const;

export function FriendsPage({ forceEmpty = false }: { forceEmpty?: boolean }) {
  useDocumentTitle('Friends');
  const state = useAsync(() => catalog.listFriends(), []);
  const [adding, setAdding] = useState(false);
  const [invite, setInvite] = useState('');
  const toast = useToast();

  return (
    <AsyncView state={state} skeleton={<Skeleton />}>
      {(all) => {
        const friends = forceEmpty ? [] : all;
        return (
          <div className="page page--top">
            <PageHeader
              title="My Friends"
              description="A private network — only people you approve can see and stream what you share. Nobody can download anything."
              actions={
                <>
                  <LinkButton variant="glass" icon="share" to={paths.sharing()}>Manage sharing</LinkButton>
                  <Button variant="primary" icon="plus" onClick={() => setAdding(true)} data-autofocus={friends.length === 0 ? '' : undefined}>Add friend</Button>
                </>
              }
            />
            {friends.length === 0 ? (
              <EmptyState icon="users" title="No friends yet" description="Invite someone you trust. You choose exactly what they can stream — and you can take it back any time." action={<Button variant="primary" icon="plus" onClick={() => setAdding(true)}>Add friend</Button>} />
            ) : (
              <ul className="friend-grid">
                {friends.map((s, i) => (
                  <li key={s.friend.id}>
                    <FriendCard summary={s} first={i === 0} />
                  </li>
                ))}
              </ul>
            )}
            <Modal
              open={adding}
              onClose={() => setAdding(false)}
              title="Add a friend"
              description="Enter their VibeVault username or email. They'll need to accept before anything is shared."
              footer={
                <>
                  <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
                  <Button
                    variant="primary"
                    disabled={!invite.trim()}
                    onClick={() => {
                      toast.show(`Invite to ${invite.trim()} queued (preview only)`, { tone: 'success' });
                      setInvite('');
                      setAdding(false);
                    }}
                  >
                    Send invite
                  </Button>
                </>
              }
            >
              <label className="field">
                <span className="field__label">Username or email</span>
                <input className="input" value={invite} onChange={(e) => setInvite(e.target.value)} placeholder="friend@example.com" data-autofocus />
              </label>
              <p className="dim" style={{ marginTop: '0.75rem' }}>Friend requests are a preview in this build — nothing is sent.</p>
            </Modal>
          </div>
        );
      }}
    </AsyncView>
  );
}

function FriendCard({ summary, first }: { summary: FriendLibrarySummary; first: boolean }) {
  const { friend, library, sharedCount } = summary;
  const { outgoing } = useUserData();
  const mine = outgoing.find((p) => p.granteeId === friend.id);
  const youShare = mine && mine.status === 'active' ? (Object.entries(mine.categories).filter(([, v]) => v).map(([k]) => k)) : [];
  const badge = LIBRARY_BADGE[library.status];
  const dim = library.status === 'revoked';

  return (
    <article className={`friend-card ${dim ? 'is-dimmed' : ''}`}>
      <div className="friend-card__top">
        <Avatar spec={friend.avatar} size="lg" presence={friend.presence} />
        <div className="friend-card__id">
          <h2>{friend.name}</h2>
          <span className={`presence presence--${friend.presence}`}>{friend.lastSeenLabel}</span>
        </div>
        <Badge tone={badge.tone}>{badge.label}</Badge>
      </div>
      <dl className="friend-card__stats">
        <div>
          <dt>Shared with you</dt>
          <dd>{library.status === 'revoked' ? '—' : plural(sharedCount, 'item')}</dd>
        </div>
        <div>
          <dt>You share</dt>
          <dd>{youShare.length ? youShare.map((c) => c[0].toUpperCase() + c.slice(1)).join(', ') : 'Nothing'}</dd>
        </div>
      </dl>
      <div className="friend-card__actions">
        <LinkButton variant="primary" icon="library" to={paths.friend(friend.id)} data-autofocus={first ? '' : undefined}>View Library</LinkButton>
        <LinkButton variant="ghost" icon="sliders" to={paths.sharing(friend.id)} aria-label={`Manage what ${friend.name} can watch`}>Permissions</LinkButton>
      </div>
      <Icon name="lock" className="friend-card__lock" size="1em" aria-hidden />
    </article>
  );
}
