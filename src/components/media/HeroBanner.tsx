import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Badge, Icon, LinkButton, Button } from '../ui';
import { useFocusOnMount } from '@/hooks/useFocusOnMount';

export interface HeroItem {
  id: string;
  eyebrow?: string;
  title: string;
  description: string;
  backdrop: string;
  /** e.g. ["2024", "2h 8m", "PG-13"] */
  meta: string[];
  genres: string[];
  quality: string[];
  score?: number;
  sharedBy?: string;
  detailsTo: string;
  onPlay: () => void;
  playLabel?: string;
}

interface HeroBannerProps {
  items: HeroItem[];
  /** Autoplay rotation interval (ms). 0 disables. */
  interval?: number;
  compact?: boolean;
  children?: ReactNode;
}

/** Large cinematic hero with crossfading slides. Rotation pauses on hover / focus and for reduced-motion users. */
export function HeroBanner({ items, interval = 9000, compact }: HeroBannerProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const root = useRef<HTMLElement>(null);
  useFocusOnMount(root);

  useEffect(() => {
    if (items.length < 2 || paused || !interval || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % items.length), interval);
    return () => window.clearTimeout(t);
  }, [index, items.length, paused, interval]);

  return (
    <section
      ref={root}
      className={`hero ${compact ? 'hero--compact' : ''}`}
      aria-roledescription="carousel"
      aria-label="Featured titles"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {items.map((item, i) => {
        const active = i === index;
        return (
          <div key={item.id} className={`hero__slide ${active ? 'is-active' : ''}`} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${items.length}`} aria-hidden={!active} inert={!active}>
            <img className="hero__img" src={item.backdrop} alt="" draggable={false} />
            <div className="hero__shade" />
            <div className="hero__content">
              {item.eyebrow && <span className="eyebrow hero__eyebrow">{item.eyebrow}</span>}
              <h1 className="hero__title">{item.title}</h1>
              <div className="hero__meta">
                {item.score !== undefined && (
                  <span className="hero__score">
                    <Icon name="star" size="1em" /> {item.score.toFixed(1)}
                  </span>
                )}
                {item.meta.map((m) => (
                  <span key={m}>{m}</span>
                ))}
                {item.quality.map((q) => (
                  <Badge key={q} tone="quality">
                    {q}
                  </Badge>
                ))}
                {item.sharedBy && (
                  <Badge tone="shared" icon="users">
                    Shared by {item.sharedBy}
                  </Badge>
                )}
              </div>
              <p className="hero__genres">{item.genres.join('  •  ')}</p>
              <p className="hero__desc clamp-3">{item.description}</p>
              <div className="hero__actions">
                <Button variant="primary" size="lg" icon="play" onClick={item.onPlay} data-autofocus={active ? '' : undefined}>
                  {item.playLabel ?? 'Play'}
                </Button>
                <LinkButton variant="glass" size="lg" icon="info" to={item.detailsTo}>
                  More Info
                </LinkButton>
              </div>
            </div>
          </div>
        );
      })}
      {items.length > 1 && (
        <div className="hero__dots" role="tablist" aria-label="Choose featured title">
          {items.map((item, i) => (
            <button key={item.id} type="button" role="tab" aria-selected={i === index} aria-label={`Show ${item.title}`} className={`hero__dot ${i === index ? 'is-active' : ''}`} onClick={() => setIndex(i)} data-nav-skip />
          ))}
        </div>
      )}
    </section>
  );
}
