import { useShotStore } from '../../state/shotStore';
import { useTrajectory } from '../../hooks/useTrajectory';
import { speedDisplay, speedUnit } from '../../lib/format';

/** Read-only display of the ball launch derived from the club-delivery inputs via D-plane. */
export function DerivedLaunchPanel() {
  const units = useShotStore((s) => s.units);
  const mode = useShotStore((s) => s.mode);
  const result = useTrajectory();
  if (mode !== 'delivery') return null;

  const dl = result.derivedLaunch;
  return (
    <section className="panel derived">
      <h2 className="panel-title">Derived ball launch (D-plane)</h2>
      <div className="derived-grid">
        <Row label="Ball speed" value={speedDisplay(dl.ballSpeedMps, units).toFixed(1)} unit={speedUnit(units)} />
        <Row label="Launch angle" value={dl.launchAngleDeg.toFixed(1)} unit="°" />
        <Row label="Backspin" value={dl.backspinRpm.toFixed(0)} unit="rpm" />
        <Row label="Start direction" value={dl.azimuthDeg.toFixed(1)} unit="°" />
        <Row label="Spin axis" value={dl.spinAxisDeg.toFixed(1)} unit="°" />
      </div>
    </section>
  );
}

function Row({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="derived-row">
      <span className="derived-label">{label}</span>
      <span className="derived-value">
        {value} <span className="derived-unit">{unit}</span>
      </span>
    </div>
  );
}
