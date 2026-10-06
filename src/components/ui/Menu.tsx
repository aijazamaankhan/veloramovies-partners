import { cloneElement, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon, type IconName } from './Icon';

export interface MenuItem {
  id: string;
  label: string;
  icon?: IconName;
  hint?: string;
  selected?: boolean;
  disabled?: boolean;
  tone?: 'default' | 'danger';
  separatorBefore?: boolean;
  onSelect: () => void;
}

interface MenuProps {
  items: MenuItem[];
  /** The trigger element. It receives aria + click handlers. */
  children: ReactElement<{ onClick?: (e: React.MouseEvent) => void; 'aria-haspopup'?: string; 'aria-expanded'?: boolean; 'aria-controls'?: string }>;
  title?: string;
  align?: 'start' | 'end';
}

/**
 * Dropdown menu rendered in a portal (so it is never clipped by scrolling rails).
 * Arrow keys move through items, Escape closes and returns focus to the trigger.
 */
export function Menu({ items, children, title, align = 'start' }: MenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; minWidth: number } | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const close = useCallback((restore = true) => {
    setOpen(false);
    if (restore) triggerRef.current?.focus();
  }, []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const menuW = menuRef.current?.offsetWidth ?? 220;
    const menuH = menuRef.current?.offsetHeight ?? 200;
    let left = align === 'end' ? r.right - menuW : r.left;
    left = Math.max(8, Math.min(left, window.innerWidth - menuW - 8));
    let top = r.bottom + 6;
    if (top + menuH > window.innerHeight - 8) top = Math.max(8, r.top - menuH - 6);
    setPos({ top, left, minWidth: r.width });
  }, [open, align, items.length]);

  // Move focus into the menu once it has been positioned (hidden elements cannot take focus).
  const positioned = pos !== null;
  useEffect(() => {
    if (open && positioned) menuRef.current?.querySelector<HTMLElement>('[aria-checked="true"], [role^="menuitem"]:not(:disabled)')?.focus();
  }, [open, positioned]);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) close(false);
    };
    const dismiss = () => close(false);
    document.addEventListener('mousedown', away);
    window.addEventListener('resize', dismiss);
    return () => {
      document.removeEventListener('mousedown', away);
      window.removeEventListener('resize', dismiss);
    };
  }, [open, close]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const nodes = [...(menuRef.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not(:disabled)') ?? [])];
    const i = nodes.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') nodes[(i + 1) % nodes.length]?.focus();
    else if (e.key === 'ArrowUp') nodes[(i - 1 + nodes.length) % nodes.length]?.focus();
    else if (e.key === 'Home') nodes[0]?.focus();
    else if (e.key === 'End') nodes[nodes.length - 1]?.focus();
    else if (e.key === 'Escape' || e.key === 'ArrowLeft' || e.key === 'GoBack') close();
    else if (e.key === 'Tab') close(false);
    else return;
    e.preventDefault();
    e.stopPropagation();
  };

  const trigger = cloneElement(children, {
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': open ? id : undefined,
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      triggerRef.current = e.currentTarget as HTMLElement;
      setPos(null);
      setOpen((o) => !o);
    },
  });

  return (
    <>
      {trigger}
      {open &&
        createPortal(
          <div
            ref={menuRef}
            id={id}
            role="menu"
            aria-label={title}
            className="menu"
            data-focus-scope
            style={{ top: pos?.top ?? 0, left: pos?.left ?? 0, minWidth: pos?.minWidth, visibility: pos ? 'visible' : 'hidden' }}
            onKeyDown={onKeyDown}
            onClick={(e) => e.stopPropagation()}
          >
            {title && <div className="menu__title">{title}</div>}
            {items.map((it) => (
              <div key={it.id} role="none">
                {it.separatorBefore && <div className="menu__sep" role="separator" />}
                <button
                  type="button"
                  role={it.selected !== undefined ? 'menuitemradio' : 'menuitem'}
                  aria-checked={it.selected}
                  disabled={it.disabled}
                  className={`menu__item ${it.tone === 'danger' ? 'menu__item--danger' : ''}`}
                  onClick={() => {
                    close();
                    it.onSelect();
                  }}
                >
                  {it.icon ? <Icon name={it.icon} /> : <span className="menu__icon-gap" />}
                  <span className="menu__label">{it.label}</span>
                  {it.hint && <span className="menu__hint">{it.hint}</span>}
                  {it.selected && <Icon name="check" size="1em" />}
                </button>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

interface SelectProps<T extends string> {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (v: T) => void;
  icon?: IconName;
  /** Show "Label: value" in the button (toolbar style) rather than just the value. */
  prefixLabel?: boolean;
  align?: 'start' | 'end';
}

/** Labelled single-choice dropdown built on Menu. */
export function Select<T extends string>({ label, value, options, onChange, icon, prefixLabel = true, align }: SelectProps<T>): ReactNode {
  const current = options.find((o) => o.value === value);
  return (
    <Menu
      title={label}
      align={align}
      items={options.map((o) => ({ id: o.value, label: o.label, selected: o.value === value, onSelect: () => onChange(o.value) }))}
    >
      <button type="button" className="select" aria-label={`${label}: ${current?.label ?? ''}`}>
        {icon && <Icon name={icon} />}
        {prefixLabel && <span className="select__label">{label}</span>}
        <span className="select__value">{current?.label}</span>
        <Icon name="chevronDown" size="1em" />
      </button>
    </Menu>
  );
}
