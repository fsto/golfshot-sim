import { useShotStore } from '../../state/shotStore';
import { useTrajectory } from '../../hooks/useTrajectory';
import {
  distanceDisplay, distanceUnit,
  shortDistanceDisplay, shortDistanceUnit,
} from '../../lib/format';

interface StatProps {
  label: string;
  value: string;
  unit?: string;
}
function Stat({ label, value, unit }: StatProps) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value}
        {unit && <span className="stat-unit"> {unit}</span>}
      </div>
    </div>
  );
}

export function ReadoutPanel() {
  const units = useShotStore((s) => s.units);
  const r = useTrajectory();
  const dUnit = distanceUnit(units);
  const sUnit = shortDistanceUnit(units);

  return (
    <section className="readout">
      <Stat label="Carry"        value={distanceDisplay(r.carryM, units).toFixed(1)}      unit={dUnit} />
      <Stat label="Total"        value={distanceDisplay(r.totalM, units).toFixed(1)}      unit={dUnit} />
      <Stat label="Apex"         value={shortDistanceDisplay(r.apexM, units).toFixed(1)}  unit={sUnit} />
      <Stat label="Descent"      value={r.descentAngleDeg.toFixed(1)}                     unit="°" />
      <Stat label="Hang time"    value={r.hangTimeS.toFixed(2)}                           unit="s" />
      <Stat label="Lateral"      value={distanceDisplay(r.lateralM, units).toFixed(1)}    unit={dUnit} />
    </section>
  );
}
