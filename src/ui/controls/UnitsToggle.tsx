import { useShotStore } from '../../state/shotStore';

export function UnitsToggle() {
  const units = useShotStore((s) => s.units);
  const setUnits = useShotStore((s) => s.setUnits);
  return (
    <div className="units-toggle" role="group" aria-label="Units">
      <button
        type="button"
        className={units === 'imperial' ? 'is-active' : ''}
        onClick={() => setUnits('imperial')}
        aria-pressed={units === 'imperial'}
      >
        Imperial
      </button>
      <button
        type="button"
        className={units === 'metric' ? 'is-active' : ''}
        onClick={() => setUnits('metric')}
        aria-pressed={units === 'metric'}
      >
        Metric
      </button>
    </div>
  );
}
