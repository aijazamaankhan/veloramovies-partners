import { forwardRef, type InputHTMLAttributes } from 'react';
import { Icon } from './Icon';

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  shortcutHint?: string;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar({ value, onChange, onSubmit, shortcutHint, className, ...rest }, ref) {
  return (
    <form
      role="search"
      className={['searchbar', className].filter(Boolean).join(' ')}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      <Icon name="search" />
      <input ref={ref} type="search" value={value} onChange={(e) => onChange(e.target.value)} aria-label="Search" autoComplete="off" spellCheck={false} {...rest} />
      {value ? (
        <button type="button" className="searchbar__clear" aria-label="Clear search" onClick={() => onChange('')}>
          <Icon name="close" size="1em" />
        </button>
      ) : (
        shortcutHint && <kbd className="kbd">{shortcutHint}</kbd>
      )}
    </form>
  );
});
