import { useMemo } from 'react';
import { useShotStore } from '../../state/shotStore';
import { useDispersionStore } from '../../state/dispersionStore';
import { useTrajectory } from '../../hooks/useTrajectory';
import { mean, stddev } from '../../lib/math/stats';
import {
  distanceDisplay, distanceUnit,
  shortDistanceDisplay, shortDistanceUnit,
} from '../../lib/format';

interface StatProps {
  label: string;
  value: string;
  unit?: string;
  hint?: string;       // small text under value (e.g., "± 4.1 yd")
}
function Stat({ label, value, unit, hint }: StatProps) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value}
        {unit && <span className="stat-unit"> {unit}</span>}
      </div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}

export function ReadoutPanel() {
  const units = useShotStore((s) => s.units);
  const r = useTrajectory();
  const dispersion = useDispersionStore((s) => s.result);
  const dUnit = distanceUnit(units);
  const sUnit = shortDistanceUnit(units);

  const dispersionStats = useMemo(() => {
    if (!dispersion || dispersion.landings.length === 0) return null;
    const sides = dispersion.rests.map((p) => p.z);
    return {
      carryMean: mean(dispersion.carries),
      carrySd: stddev(dispersion.carries),
      totalMean: mean(dispersion.totals),
      totalSd: stddev(dispersion.totals),
      sideMean: mean(sides),
      sideSd: stddev(sides),
      n: dispersion.landings.length,
    };
  }, [dispersion]);

  if (dispersionStats) {
    const fmt = (m: number) => distanceDisplay(m, units).toFixed(1);
    const sdFmt = (sd: number) => `± ${distanceDisplay(sd, units).toFixed(1)} ${dUnit}`;
    return (
      <section className="readout">
        <Stat label="Carry" value={fmt(dispersionStats.carryMean)} unit={dUnit} hint={sdFmt(dispersionStats.carrySd)} />
        <Stat label="Total" value={fmt(dispersionStats.totalMean)} unit={dUnit} hint={sdFmt(dispersionStats.totalSd)} />
        <Stat label="Side"  value={fmt(dispersionStats.sideMean)}  unit={dUnit} hint={sdFmt(dispersionStats.sideSd)} />
        <Stat label="N shots" value={String(dispersionStats.n)} />
        <Stat label="Apex"    value={shortDistanceDisplay(r.apexM, units).toFixed(1)} unit={sUnit} hint="(live shot)" />
        <Stat label="Descent" value={r.descentAngleDeg.toFixed(1)} unit="°" hint="(live shot)" />
      </section>
    );
  }

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
