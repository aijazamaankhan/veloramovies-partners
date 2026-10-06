import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  leading?: ReactNode;
}

export function PageHeader({ title, description, eyebrow, actions, leading }: PageHeaderProps) {
  return (
    <header className="page__header">
      {leading}
      <div className="page__header-text">
        {eyebrow && <div className="eyebrow" style={{ marginBottom: '0.4rem' }}>{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="row row--wrap">{actions}</div>}
    </header>
  );
}
