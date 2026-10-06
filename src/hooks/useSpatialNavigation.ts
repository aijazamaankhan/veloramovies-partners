import { useEffect } from 'react';

/**
 * Directional (D-pad / arrow-key) focus navigation.
 *
 * Works for Android TV remotes (which arrive as ArrowUp/Down/Left/Right, Enter and Back) and for
 * desktop keyboards. Instead of hand-wiring neighbours, the next focus target is the focusable element
 * that is closest in the pressed direction.
 *
 * Contract for components:
 *  - anything focusable participates automatically (links, buttons, inputs, [role=slider], [tabindex=0]);
 *  - `data-nav-skip` removes an element from directional navigation (it stays reachable by Tab/mouse);
 *  - an element with `data-focus-scope` (modals, menus) captures navigation: only focusables inside the
 *    last such scope are candidates;
 *  - handlers that consume an arrow key must call `preventDefault()` (sliders, menus, text inputs).
 */

type Direction = 'left' | 'right' | 'up' | 'down';

const KEY_TO_DIRECTION: Record<string, Direction> = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };

const FOCUSABLE = 'a[href], button, input, select, textarea, [role="slider"], [tabindex]:not([tabindex="-1"]), [data-focusable]';
const TEXT_INPUT = 'input:not([type="range"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]), textarea';

function isUsable(el: HTMLElement, scope: ParentNode): boolean {
  if ((el as HTMLButtonElement).disabled) return false;
  if (el.hasAttribute('data-nav-skip') || el.tabIndex < 0) return false;
  if (el.closest('[inert], [aria-hidden="true"], [data-nav-skip]')) return false;
  if (scope === document && el.closest('[data-focus-scope]')) return false; // covered by a modal/menu
  if (el.getClientRects().length === 0) return false;
  const vis = (el as HTMLElement & { checkVisibility?: (o?: object) => boolean }).checkVisibility;
  return vis ? vis.call(el, { visibilityProperty: true }) : true;
}

function overlap(a1: number, a2: number, b1: number, b2: number): number {
  return Math.max(0, Math.min(a2, b2) - Math.max(a1, b1));
}

function score(from: DOMRect, to: DOMRect, dir: Direction): number | null {
  const horizontal = dir === 'left' || dir === 'right';
  const fcx = from.left + from.width / 2;
  const fcy = from.top + from.height / 2;
  const tcx = to.left + to.width / 2;
  const tcy = to.top + to.height / 2;

  // Must lie in the pressed direction (compare centres, tolerate 1px).
  if (dir === 'right' && tcx <= fcx + 1) return null;
  if (dir === 'left' && tcx >= fcx - 1) return null;
  if (dir === 'down' && tcy <= fcy + 1) return null;
  if (dir === 'up' && tcy >= fcy - 1) return null;

  const gap = horizontal
    ? Math.max(0, dir === 'right' ? to.left - from.right : from.left - to.right)
    : Math.max(0, dir === 'down' ? to.top - from.bottom : from.top - to.bottom);
  const lateralOverlap = horizontal ? overlap(from.top, from.bottom, to.top, to.bottom) : overlap(from.left, from.right, to.left, to.right);
  const lateralOffset = horizontal ? Math.abs(tcy - fcy) : Math.abs(tcx - fcx);
  // Prefer targets that line up; penalise ones that merely sit "somewhere that way".
  return gap + lateralOffset * (lateralOverlap > 0 ? 0.5 : 2.5) + (lateralOverlap > 0 ? 0 : 200);
}

export function focusElement(el: HTMLElement) {
  el.focus({ preventScroll: true });
  const tv = document.documentElement.dataset.mode === 'tv';
  el.scrollIntoView({ block: tv ? 'center' : 'nearest', inline: 'nearest', behavior: tv ? 'smooth' : 'auto' });
}

export function moveFocus(dir: Direction): boolean {
  const scope: ParentNode = [...document.querySelectorAll<HTMLElement>('[data-focus-scope]')].pop() ?? document;
  const candidates = [...scope.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => isUsable(el, scope));
  if (!candidates.length) return false;

  const active = document.activeElement as HTMLElement | null;
  const current = active && active !== document.body && scope.contains(active) ? (active.closest<HTMLElement>(FOCUSABLE) ?? active) : null;

  if (!current) {
    const start = candidates.find((c) => c.hasAttribute('data-autofocus')) ?? candidates.find((c) => c.closest('main')) ?? candidates[0];
    focusElement(start);
    return true;
  }

  const from = current.getBoundingClientRect();
  let best: HTMLElement | null = null;
  let bestScore = Infinity;
  for (const c of candidates) {
    if (c === current) continue;
    const s = score(from, c.getBoundingClientRect(), dir);
    if (s !== null && s < bestScore) {
      best = c;
      bestScore = s;
    }
  }
  if (best) focusElement(best);
  return true;
}

export function useSpatialNavigation(onBack: () => void) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement;
      const inText = target.matches?.(TEXT_INPUT);

      const dir = KEY_TO_DIRECTION[e.key];
      if (dir) {
        if (inText && (dir === 'left' || dir === 'right')) return; // caret movement
        if (moveFocus(dir)) e.preventDefault();
        return;
      }

      const isBack = e.key === 'GoBack' || e.key === 'BrowserBack' || e.key === 'Escape' || (e.key === 'Backspace' && !inText);
      if (isBack && !document.querySelector('[data-focus-scope]')) {
        if (inText && e.key === 'Escape') (target as HTMLInputElement).blur();
        else {
          e.preventDefault();
          onBack();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onBack]);
}
