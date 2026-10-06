/** Thin progress indicator. `value` is 0–1. */
export function ProgressBar({ value, label, className }: { value: number; label?: string; className?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={['progress', className].filter(Boolean).join(' ')} role="progressbar" aria-label={label ?? 'Progress'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
      <div className="progress__fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
