interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  /** Visually hide the label (it is still announced). */
  hideLabel?: boolean;
}

export function Toggle({ checked, onChange, label, disabled, hideLabel = true }: ToggleProps) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={hideLabel ? label : undefined} disabled={disabled} className={`toggle ${checked ? 'is-on' : ''}`} onClick={() => onChange(!checked)}>
      <span className="toggle__thumb" />
      {!hideLabel && <span className="toggle__label">{label}</span>}
    </button>
  );
}
