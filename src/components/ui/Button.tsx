import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'glass';
type Size = 'md' | 'lg';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
  block?: boolean;
  children?: ReactNode;
}

export type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;
export type LinkButtonProps = CommonProps & Omit<LinkProps, 'children'>;

const cls = ({ variant = 'secondary', size = 'md', block }: CommonProps, extra?: string) =>
  ['btn', `btn--${variant}`, `btn--${size}`, block && 'btn--block', extra].filter(Boolean).join(' ');

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, icon, iconRight, block, children, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={cls({ variant, size, block }, className)} {...rest}>
      {icon && <Icon name={icon} />}
      {children && <span>{children}</span>}
      {iconRight && <Icon name={iconRight} />}
    </button>
  );
});

/** Same look as <Button>, but navigates (renders a real link). */
export function LinkButton({ variant, size, icon, iconRight, block, children, className, ...rest }: LinkButtonProps) {
  return (
    <Link className={cls({ variant, size, block }, className)} {...rest}>
      {icon && <Icon name={icon} />}
      {children && <span>{children}</span>}
      {iconRight && <Icon name={iconRight} />}
    </Link>
  );
}
