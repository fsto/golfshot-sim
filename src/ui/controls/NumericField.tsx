import { type ChangeEvent, useId } from 'react';

interface Props {
  label: string;
  /** Display-space value (already converted from SI). */
  value: number;
  /** Slider range in display units. */
  min: number;
  max: number;
  step: number;
  unit: string;
  /** Decimals shown next to the slider. */
  decimals?: number;
  onChange: (displayValue: number) => void;
}

/** Slider + number input + unit, all driving the same display-space value. */
export function NumericField({
  label, value, min, max, step, unit, decimals = 1, onChange,
}: Props) {
  const id = useId();
  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    const n = Number(e.target.value);
    if (Number.isFinite(n)) onChange(n);
  };
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        <span>{label}</span>
        <span className="field-value">
          {value.toFixed(decimals)} <span className="field-unit">{unit}</span>
        </span>
      </label>
      <div className="field-controls">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handle}
          className="field-range"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={Number(value.toFixed(decimals))}
          onChange={handle}
          className="field-number"
        />
      </div>
    </div>
  );
}
