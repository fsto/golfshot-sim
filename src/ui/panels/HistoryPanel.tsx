import { useShotStore } from '../../state/shotStore';
import { useHistoryStore } from '../../state/historyStore';
import { distanceDisplay, distanceUnit } from '../../lib/format';

export function HistoryPanel() {
  const shots = useHistoryStore((s) => s.shots);
  const remove = useHistoryStore((s) => s.remove);
  const clear = useHistoryStore((s) => s.clear);
  const units = useShotStore((s) => s.units);

  if (shots.length === 0) return null;

  return (
    <section className="history-panel">
      <div className="history-header">
        <span className="panel-title">Saved shots ({shots.length})</span>
        <button type="button" className="ghost-btn" onClick={clear}>
          Clear all
        </button>
      </div>
      <div className="history-list">
        {shots.map((s) => (
          <div key={s.id} className="history-chip" style={{ borderLeftColor: s.color }}>
            <span className="chip-swatch" style={{ background: s.color }} />
            <span className="chip-label">{s.label}</span>
            <span className="chip-value">
              {distanceDisplay(s.result.totalM, units).toFixed(0)} {distanceUnit(units)}
            </span>
            <button
              type="button"
              className="chip-remove"
              onClick={() => remove(s.id)}
              aria-label={`Remove ${s.label}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
