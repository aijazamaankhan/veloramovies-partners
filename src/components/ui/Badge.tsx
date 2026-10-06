import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export type BadgeTone = 'neutral' | 'accent' | 'shared' | 'success' | 'warn' | 'danger' | 'quality' | 'private';

export function Badge({ tone = 'neutral', icon, children, title }: { tone?: BadgeTone; icon?: IconName; children: ReactNode; title?: string }) {
  return (
    <span className={`badge badge--${tone}`} title={title}>
      {icon && <Icon name={icon} size="1em" />}
      {children}
    </span>
  );
}
