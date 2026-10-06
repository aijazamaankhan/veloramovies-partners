import type { CSSProperties } from 'react';

interface SkeletonProps {
  w?: string | number;
  h?: string | number;
  radius?: string;
  className?: string;
  style?: CSSProperties;
}

/** Shimmering placeholder block. */
export function Skeleton({ w, h = '1em', radius, className, style }: SkeletonProps) {
  return <span aria-hidden="true" className={['skeleton', className].filter(Boolean).join(' ')} style={{ width: w, height: h, borderRadius: radius, ...style }} />;
}
