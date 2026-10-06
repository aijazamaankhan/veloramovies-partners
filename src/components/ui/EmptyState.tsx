import type { ReactNode } from 'react';
import type { AccessDenial } from '@/models';
import { Icon, type IconName } from './Icon';
import { Button } from './Button';

interface StateProps {
  icon: IconName;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  tone?: 'neutral' | 'danger' | 'warn' | 'private';
}

function StateBase({ icon, title, description, action, compact, tone = 'neutral', role }: StateProps & { role?: 'alert' | 'status' }) {
  return (
    <div className={`state state--${tone} ${compact ? 'state--compact' : ''}`} role={role}>
      <div className="state__art" aria-hidden="true">
        <span className="state__ring state__ring--1" />
        <span className="state__ring state__ring--2" />
        <Icon name={icon} size="2.2rem" />
      </div>
      <h2>{title}</h2>
      {description && <p className="muted">{description}</p>}
      {action && <div className="state__actions">{action}</div>}
    </div>
  );
}

/** Friendly "nothing here yet" screen. */
export const EmptyState = (props: StateProps) => <StateBase {...props} role="status" />;

/** Friendly "something went wrong" screen. */
export const ErrorState = (props: StateProps) => <StateBase {...props} tone={props.tone ?? 'danger'} role="alert" />;

const DENIAL_COPY: Record<AccessDenial, { icon: IconName; title: string; description: string; tone: StateProps['tone'] }> = {
  'owner-offline': { icon: 'wifiOff', title: 'The owner is offline', description: "Streaming starts again as soon as they're back online. Titles stay here in the meantime.", tone: 'warn' },
  revoked: { icon: 'ban', title: 'Access to this media has been revoked', description: 'The owner has stopped sharing this with you. Ask them if you think this is a mistake.', tone: 'danger' },
  'not-shared': { icon: 'lock', title: 'This media is not shared with you', description: 'The owner has not allowed this category for your account.', tone: 'private' },
  unavailable: { icon: 'alert', title: 'This media is currently unavailable', description: 'It may have been moved, renamed or taken offline by the owner. Try again in a moment.', tone: 'danger' },
};

export function AccessDeniedState({ reason, action, compact }: { reason: AccessDenial; action?: ReactNode; compact?: boolean }) {
  const c = DENIAL_COPY[reason];
  return <ErrorState icon={c.icon} title={c.title} description={c.description} tone={c.tone} action={action} compact={compact} />;
}

export function RetryButton({ onClick, label = 'Try again' }: { onClick: () => void; label?: string }) {
  return (
    <Button variant="primary" icon="repeat" onClick={onClick} data-autofocus>
      {label}
    </Button>
  );
}
