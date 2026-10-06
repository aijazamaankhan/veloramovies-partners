import { Skeleton } from '../ui';

const Card = ({ variant = 'poster' }: { variant?: 'poster' | 'landscape' | 'square' }) => (
  <div className={`card card--${variant} card--skeleton`}>
    <Skeleton className="card__frame" h="auto" radius="var(--r-md)" />
    <Skeleton h="0.9rem" w="70%" style={{ marginTop: '0.6rem' }} />
    <Skeleton h="0.75rem" w="45%" style={{ marginTop: '0.4rem' }} />
  </div>
);

export function RowSkeleton({ variant = 'poster', count = 8 }: { variant?: 'poster' | 'landscape' | 'square'; count?: number }) {
  return (
    <section className="row-section" aria-hidden="true">
      <header className="row-section__head">
        <Skeleton h="1.4rem" w="12rem" />
      </header>
      <div className="rail">
        {Array.from({ length: count }, (_, i) => (
          <Card key={i} variant={variant} />
        ))}
      </div>
    </section>
  );
}

export function GridSkeleton({ variant = 'poster', count = 18 }: { variant?: 'poster' | 'landscape' | 'square'; count?: number }) {
  return (
    <div className={`grid ${variant === 'landscape' ? 'grid--land' : variant === 'square' ? 'grid--square' : ''}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} variant={variant} />
      ))}
    </div>
  );
}

export function HeroSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div className={`hero hero--skeleton ${compact ? 'hero--compact' : ''}`} aria-hidden="true">
      <div className="hero__content">
        <Skeleton h="3.2rem" w="min(26rem, 70%)" />
        <Skeleton h="1rem" w="min(18rem, 60%)" style={{ marginTop: '1rem' }} />
        <Skeleton h="1rem" w="min(34rem, 90%)" style={{ marginTop: '1rem' }} />
        <Skeleton h="1rem" w="min(30rem, 80%)" style={{ marginTop: '0.4rem' }} />
        <div className="row" style={{ marginTop: '1.5rem' }}>
          <Skeleton h="3.3rem" w="9rem" radius="99px" />
          <Skeleton h="3.3rem" w="10rem" radius="99px" />
        </div>
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div role="status" aria-label="Loading home">
      <HeroSkeleton />
      <div className="page">
        <RowSkeleton variant="landscape" count={6} />
        <RowSkeleton />
        <RowSkeleton />
      </div>
    </div>
  );
}

export function BrowseSkeleton({ variant = 'poster' }: { variant?: 'poster' | 'landscape' | 'square' }) {
  return (
    <div role="status" aria-label="Loading">
      <HeroSkeleton compact />
      <div className="page">
        <div className="toolbar">
          <Skeleton h="2.5rem" w="16rem" radius="99px" />
          <Skeleton h="2.5rem" w="9rem" radius="99px" />
          <Skeleton h="2.5rem" w="9rem" radius="99px" />
        </div>
        <GridSkeleton variant={variant} />
      </div>
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="page__header" aria-hidden="true">
      <div className="page__header-text">
        <Skeleton h="2.2rem" w="16rem" />
        <Skeleton h="1rem" w="26rem" style={{ marginTop: '0.7rem', maxWidth: '100%' }} />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="stack" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="row" style={{ gap: '1rem' }}>
          <Skeleton h="3rem" w="3rem" />
          <div style={{ flex: 1 }}>
            <Skeleton h="0.9rem" w="40%" />
            <Skeleton h="0.75rem" w="25%" style={{ marginTop: '0.4rem' }} />
          </div>
          <Skeleton h="0.8rem" w="3rem" />
        </div>
      ))}
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div role="status" aria-label="Loading details">
      <div className="detail-hero detail-hero--skeleton">
        <div className="detail-hero__inner">
          <Skeleton className="detail-hero__poster" h="auto" radius="var(--r-md)" />
          <div className="detail-hero__text">
            <Skeleton h="3rem" w="22rem" />
            <Skeleton h="1rem" w="16rem" style={{ marginTop: '1rem' }} />
            <Skeleton h="1rem" w="32rem" style={{ marginTop: '1rem', maxWidth: '100%' }} />
            <Skeleton h="1rem" w="28rem" style={{ marginTop: '0.4rem', maxWidth: '100%' }} />
            <div className="row" style={{ marginTop: '1.5rem' }}>
              <Skeleton h="3.3rem" w="9rem" radius="99px" />
              <Skeleton h="3.3rem" w="9rem" radius="99px" />
            </div>
          </div>
        </div>
      </div>
      <div className="page">
        <RowSkeleton variant="landscape" count={5} />
      </div>
    </div>
  );
}

export function FriendLibrarySkeleton() {
  return (
    <div className="page page--top" role="status" aria-label="Loading library">
      <div className="row" style={{ gap: '1.25rem', marginBottom: '2rem' }}>
        <Skeleton h="5rem" w="5rem" radius="50%" />
        <div>
          <Skeleton h="2rem" w="14rem" />
          <Skeleton h="1rem" w="20rem" style={{ marginTop: '0.6rem' }} />
        </div>
      </div>
      <RowSkeleton />
      <RowSkeleton variant="landscape" count={5} />
      <RowSkeleton variant="square" />
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div role="status" aria-label="Searching" className="stack" style={{ gap: '1.5rem' }}>
      <RowSkeleton count={6} />
      <RowSkeleton variant="landscape" count={4} />
    </div>
  );
}
