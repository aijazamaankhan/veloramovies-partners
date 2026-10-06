/** Temporary VibeVault wordmark. Pure SVG + text, no external assets. */
export function Logo({ compact }: { compact?: boolean }) {
  return (
    <span className="logo" aria-label="VibeVault">
      <svg className="logo__mark" viewBox="0 0 32 32" aria-hidden="true">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--accent)" />
            <stop offset="1" stopColor="#ff7ac6" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill="url(#lg)" />
        <path d="M8.5 9.5L16 23l7.5-13.5" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="16" cy="9.5" r="1.6" fill="#fff" />
      </svg>
      {!compact && (
        <span className="logo__text">
          <b>Vibe</b>Vault
        </span>
      )}
    </span>
  );
}
