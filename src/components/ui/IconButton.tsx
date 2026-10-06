import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  icon: IconName;
  /** Required: icon-only controls must have an accessible name. */
  label: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'glass' | 'solid' | 'accent';
  /** Toggle state (e.g. favourite, shuffle). */
  pressed?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, size = 'md', variant = 'ghost', pressed, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className={['icon-btn', `icon-btn--${size}`, `icon-btn--${variant}`, pressed && 'is-on', className].filter(Boolean).join(' ')}
      {...rest}
    >
      <Icon name={icon} />
    </button>
  );
});
