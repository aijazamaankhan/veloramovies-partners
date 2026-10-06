import { Children, isValidElement, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconButton, Icon } from '../ui';

interface ContentRowProps {
  title: string;
  subtitle?: string;
  seeAllTo?: string;
  children: ReactNode;
  /** Used to describe the row for assistive tech. */
  id?: string;
}

/** Titled horizontal rail of cards. Scrolls with mouse wheel, drag, scroll buttons, or D-pad focus movement. */
export function ContentRow({ title, subtitle, seeAllTo, children, id }: ContentRowProps) {
  const rail = useRef<HTMLUListElement>(null);
  const scroll = (dir: -1 | 1) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.85, behavior: 'smooth' });
  const headingId = id ?? `row-${title.replace(/\W+/g, '-').toLowerCase()}`;

  return (
    <section className="row-section" aria-labelledby={headingId}>
      <header className="row-section__head">
        <h2 id={headingId}>{title}</h2>
        {subtitle && <span className="dim">{subtitle}</span>}
        <span className="spacer" />
        {seeAllTo && (
          <Link to={seeAllTo} className="row-section__all">
            See all <Icon name="chevronRight" size="1em" />
          </Link>
        )}
      </header>
      <div className="row-section__rail-wrap">
        <IconButton className="rail-btn rail-btn--prev" icon="chevronLeft" label={`Scroll ${title} left`} variant="glass" size="lg" onClick={() => scroll(-1)} tabIndex={-1} data-nav-skip />
        <ul className="rail" ref={rail}>
          {Children.toArray(children).map((c, i) => (
            <li key={isValidElement(c) && c.key !== null ? c.key : i}>{c}</li>
          ))}
        </ul>
        <IconButton className="rail-btn rail-btn--next" icon="chevronRight" label={`Scroll ${title} right`} variant="glass" size="lg" onClick={() => scroll(1)} tabIndex={-1} data-nav-skip />
      </div>
    </section>
  );
}
