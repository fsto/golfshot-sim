import { useShotStore } from '../../state/shotStore';
import type { Surface } from '../../physics/types';

const SURFACES: Array<{ id: Surface; label: string }> = [
  { id: 'green', label: 'Green' },
  { id: 'fairway', label: 'Fairway' },
  { id: 'rough', label: 'Rough' },
];

export function SurfacePicker() {
  const surface = useShotStore((s) => s.env.surface);
  const updateEnv = useShotStore((s) => s.updateEnv);
  return (
    <div className="field">
      <label className="field-label">
        <span>Landing surface</span>
        <span className="field-value">
          <span className="field-unit">bounce + roll</span>
        </span>
      </label>
      <div className="units-toggle surface-picker" role="group" aria-label="Landing surface">
        {SURFACES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={surface === s.id ? 'is-active' : ''}
            onClick={() => updateEnv({ surface: s.id })}
            aria-pressed={surface === s.id}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
