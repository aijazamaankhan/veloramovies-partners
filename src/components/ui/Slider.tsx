import { useCallback, useRef, type KeyboardEvent, type PointerEvent } from 'react';

interface SliderProps {
  value: number;
  min?: number;
  max: number;
  step?: number;
  /** Step used by arrow keys (defaults to `step`). */
  keyStep?: number;
  /** Larger step for Page keys / long press. */
  bigStep?: number;
  onChange: (value: number) => void;
  label: string;
  /** Text announced by screen readers, e.g. "12:04 of 1:48:00". */
  valueText?: string;
  /** Secondary fill (buffered amount). */
  buffered?: number;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Accessible slider. Left/Right adjust the value; Up/Down are left alone so D-pad / arrow navigation
 * can still leave the control vertically.
 */
export function Slider({ value, min = 0, max, step = 1, keyStep, bigStep, onChange, label, valueText, buffered, size = 'md', className }: SliderProps) {
  const track = useRef<HTMLDivElement>(null);
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;

  const fromPointer = useCallback(
    (e: PointerEvent) => {
      const rect = track.current!.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const raw = min + ratio * (max - min);
      onChange(clamp(Math.round(raw / step) * step));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [min, max, step, onChange],
  );

  const onKeyDown = (e: KeyboardEvent) => {
    const ks = keyStep ?? step;
    const big = bigStep ?? ks * 10;
    const map: Record<string, number> = { ArrowLeft: -ks, ArrowRight: ks, PageDown: -big, PageUp: big };
    if (e.key in map) onChange(clamp(value + map[e.key]));
    else if (e.key === 'Home') onChange(min);
    else if (e.key === 'End') onChange(max);
    else return;
    e.preventDefault();
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      aria-valuetext={valueText}
      className={['slider', `slider--${size}`, className].filter(Boolean).join(' ')}
      onKeyDown={onKeyDown}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        fromPointer(e);
      }}
      onPointerMove={(e) => e.buttons === 1 && fromPointer(e)}
    >
      <div className="slider__track" ref={track}>
        {buffered !== undefined && <div className="slider__buffer" style={{ width: `${(buffered / (max - min)) * 100}%` }} />}
        <div className="slider__fill" style={{ width: `${pct}%` }} />
        <div className="slider__thumb" style={{ left: `${pct}%` }} />
      </div>
    </div>
  );
}
