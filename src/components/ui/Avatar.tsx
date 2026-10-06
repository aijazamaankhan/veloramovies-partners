import type { AvatarSpec, Presence } from '@/models';

interface AvatarProps {
  spec: AvatarSpec;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'rounded';
  presence?: Presence;
  className?: string;
}

const PRESENCE_LABEL: Record<Presence, string> = { online: 'Online', away: 'Away', offline: 'Offline' };

export function Avatar({ spec, size = 'md', shape = 'circle', presence, className }: AvatarProps) {
  return (
    <span
      className={['avatar', `avatar--${size}`, `avatar--${shape}`, className].filter(Boolean).join(' ')}
      style={{ background: `linear-gradient(135deg, ${spec.colors[0]}, ${spec.colors[1]})` }}
    >
      <span aria-hidden="true">{spec.initials}</span>
      {presence && <span className={`avatar__presence avatar__presence--${presence}`} role="img" aria-label={PRESENCE_LABEL[presence]} />}
    </span>
  );
}
