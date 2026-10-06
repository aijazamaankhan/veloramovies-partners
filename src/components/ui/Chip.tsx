import type { ButtonHTMLAttributes } from 'react';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Chip({ selected, className, children, ...rest }: ChipProps) {
  return (
    <button type="button" aria-pressed={selected} className={['chip', selected && 'is-selected', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </button>
  );
}
