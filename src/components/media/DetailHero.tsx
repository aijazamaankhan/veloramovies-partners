import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '../ui';

interface DetailHeroProps {
  backdrop: string;
  poster?: string;
  posterAlt?: string;
  eyebrow?: ReactNode;
  title: string;
  meta?: ReactNode;
  description: string;
  actions: ReactNode;
  /** Right-hand extras (e.g. facts grid). */
  aside?: ReactNode;
  tagline?: string;
}

/** Full-bleed backdrop + poster + primary actions. Shared by movie, show and video details. */
export function DetailHero({ backdrop, poster, eyebrow, title, meta, description, actions, aside, tagline }: DetailHeroProps) {
  const navigate = useNavigate();
  return (
    <header className="detail-hero">
      <img className="detail-hero__backdrop" src={backdrop} alt="" draggable={false} />
      <div className="detail-hero__shade" />
      <div className="detail-hero__back">
        <IconButton icon="arrowLeft" label="Go back" variant="glass" onClick={() => navigate(-1)} />
      </div>
      <div className="detail-hero__inner">
        {poster && <img className="detail-hero__poster" src={poster} alt={`${title} poster`} draggable={false} />}
        <div className="detail-hero__text">
          {eyebrow && <div className="detail-hero__eyebrow">{eyebrow}</div>}
          <h1 className="detail-hero__title">{title}</h1>
          {tagline && <p className="detail-hero__tagline">{tagline}</p>}
          {meta && <div className="hero__meta">{meta}</div>}
          <p className="detail-hero__desc">{description}</p>
          <div className="detail-hero__actions">{actions}</div>
        </div>
        {aside && <aside className="detail-hero__aside">{aside}</aside>}
      </div>
    </header>
  );
}

export function Facts({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="facts">
      {items.map((f) => (
        <div key={f.label} className="facts__row">
          <dt>{f.label}</dt>
          <dd>{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}
