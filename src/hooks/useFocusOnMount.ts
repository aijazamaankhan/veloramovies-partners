import { useEffect, type RefObject } from 'react';
import { lastInputWasKeyboard } from './useInputModality';
import { focusElement } from './useSpatialNavigation';

/**
 * After a screen's content appears, move focus to its primary action (`[data-autofocus]`) so a D-pad user
 * lands somewhere useful. Skipped for mouse users so we never steal focus or flash focus rings.
 */
export function useFocusOnMount(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!lastInputWasKeyboard()) return;
    const el = ref.current?.querySelector<HTMLElement>('[data-autofocus]');
    if (el) focusElement(el);
  }, [ref]);
}
