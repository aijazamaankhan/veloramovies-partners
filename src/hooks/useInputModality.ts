import { useEffect } from 'react';

let keyboard = false;
/** True when the most recent interaction came from a keyboard / remote rather than a pointer. */
export const lastInputWasKeyboard = () => keyboard;

/** Tracks keyboard vs pointer use so we only auto-focus (and show focus rings) for keyboard / D-pad users. */
export function useInputModality() {
  useEffect(() => {
    const k = () => (keyboard = true);
    const p = () => (keyboard = false);
    window.addEventListener('keydown', k, true);
    window.addEventListener('pointerdown', p, true);
    return () => {
      window.removeEventListener('keydown', k, true);
      window.removeEventListener('pointerdown', p, true);
    };
  }, []);
}
