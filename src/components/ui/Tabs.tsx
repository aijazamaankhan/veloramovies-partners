import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: IconName;
  count?: number;
  badge?: ReactNode;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  variant?: 'underline' | 'pill';
}

export function Tabs<T extends string>({ items, value, onChange, label, variant = 'pill' }: TabsProps<T>) {
  return (
    <div role="tablist" aria-label={label} className={`tabs tabs--${variant}`}>
      {items.map((t) => (
        <button key={t.id} role="tab" type="button" aria-selected={t.id === value} className={`tab ${t.id === value ? 'is-active' : ''}`} onClick={() => onChange(t.id)}>
          {t.icon && <Icon name={t.icon} size="1.05em" />}
          <span>{t.label}</span>
          {t.count !== undefined && <span className="tab__count">{t.count}</span>}
          {t.badge}
        </button>
      ))}
    </div>
  );
}
