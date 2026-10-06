import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Badge, IconButton, Menu, ProgressBar, type MenuItem } from '../ui';
import { useSettings } from '@/state/settings';

export type CardVariant = 'poster' | 'landscape' | 'square' | 'round';

export interface MediaCardProps {
  variant: CardVariant;
  /** Where Select / click goes (usually the details page). */
  to: string;
  image: string;
  title: string;
  subtitle?: string;
  /** Extra line shown on hover/focus, e.g. "2024 · 2h 8m · 4K". */
  meta?: string;
  /** Short synopsis shown on hover/focus. */
  description?: string;
  /** Top-right badge, e.g. quality. */
  quality?: string;
  /** Owner display name — renders the “Shared by …” badge. */
  sharedBy?: string;
  progress?: number;
  /** Small text overlaid at the bottom-right of the artwork (e.g. a duration). */
  corner?: ReactNode;
  topLeft?: ReactNode;
  onPlay?: () => void;
  menu?: MenuItem[];
  dimmed?: boolean;
  className?: string;
}

/**
 * Base card for every kind of media. Specialised cards (MovieCard, ShowCard, MusicCard, VideoCard …)
 * only map their model onto these props, so hover/focus behaviour is identical everywhere.
 *
 * Interaction model (desktop + TV):
 *  - the whole card is ONE focusable link — D-pad users land on it, press Select, and open details;
 *  - hover and focus both reveal the same info overlay (never hover-only);
 *  - Play / More buttons are mouse + Tab conveniences and are skipped by directional navigation.
 */
export function MediaCard({ variant, to, image, title, subtitle, meta, description, quality, sharedBy, progress, corner, topLeft, onPlay, menu, dimmed, className }: MediaCardProps) {
  const { settings } = useSettings();
  const tv = settings.mode === 'tv';
  const label = [title, subtitle, sharedBy && `shared by ${sharedBy}`, progress !== undefined && `${Math.round(progress * 100)}% watched`].filter(Boolean).join(', ');

  return (
    <article className={['card', `card--${variant}`, dimmed && 'is-dimmed', className].filter(Boolean).join(' ')}>
      <Link to={to} className="card__link" aria-label={label}>
        <div className="card__frame">
          <img src={image} alt="" loading="lazy" draggable={false} />
          {sharedBy && (
            <span className="card__shared">
              <Badge tone="shared" icon="users">
                Shared by {sharedBy}
              </Badge>
            </span>
          )}
          {topLeft && <span className="card__top-left">{topLeft}</span>}
          {quality && (
            <span className="card__quality">
              <Badge tone="quality">{quality}</Badge>
            </span>
          )}
          {corner && <span className="card__corner">{corner}</span>}
          {(meta || description) && variant !== 'round' && (
            <div className="card__overlay" aria-hidden="true">
              {meta && <span className="card__meta">{meta}</span>}
              {description && <span className="card__desc clamp-3">{description}</span>}
            </div>
          )}
          {progress !== undefined && <ProgressBar value={progress} className="card__progress" label="Watch progress" />}
        </div>
        <div className="card__text">
          <h3 className="truncate">{title}</h3>
          {subtitle && <p className="truncate">{subtitle}</p>}
        </div>
      </Link>
      {(onPlay || menu) && (
        <div className="card__actions">
          {onPlay && <IconButton icon="play" label={`Play ${title}`} variant="solid" size="md" onClick={onPlay} data-nav-skip tabIndex={tv ? -1 : 0} />}
          {menu && (
            <Menu items={menu} title={title} align="end">
              <IconButton icon="more" label={`More options for ${title}`} variant="glass" size="md" data-nav-skip tabIndex={tv ? -1 : 0} />
            </Menu>
          )}
        </div>
      )}
    </article>
  );
}
