import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useShotStore } from '../../state/shotStore';
import { useTrajectory } from '../../hooks/useTrajectory';
import { distanceDisplay, distanceUnit } from '../../lib/format';

/** Top-down: lateral (z) vs distance (x). Reveals draw/fade curvature. */
export function TopDownPlot() {
  const units = useShotStore((s) => s.units);
  const traj = useTrajectory();

  const data = useMemo(() => {
    const samples = traj.flight.samples;
    const stride = Math.max(1, Math.floor(samples.length / 120));
    const out: Array<{ x: number; z: number }> = [];
    for (let i = 0; i < samples.length; i += stride) {
      const s = samples[i]!;
      out.push({
        x: distanceDisplay(s.pos.x, units),
        z: distanceDisplay(s.pos.z, units),
      });
    }
    const last = samples[samples.length - 1];
    if (last) {
      out.push({
        x: distanceDisplay(last.pos.x, units),
        z: distanceDisplay(last.pos.z, units),
      });
    }
    return out;
  }, [traj, units]);

  const carryDisplay = distanceDisplay(traj.carryM, units);
  const yDomain: [number, number] = (() => {
    const maxAbs = data.reduce((m, p) => Math.max(m, Math.abs(p.z)), 1);
    const padded = Math.max(maxAbs * 1.3, 8);
    return [-padded, padded];
  })();

  return (
    <div className="plot">
      <div className="plot-title">Top-down (lateral vs distance)</div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 10, right: 24, bottom: 28, left: 36 }}>
          <CartesianGrid stroke="#2a2f3a" strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, Math.max(carryDisplay * 1.05, 50)]}
            label={{ value: `Distance (${distanceUnit(units)})`, position: 'insideBottom', offset: -10, fill: '#9aa3b2' }}
            stroke="#9aa3b2"
            tick={{ fontSize: 11 }}
          />
          <YAxis
            type="number"
            domain={yDomain}
            label={{ value: `Lateral (${distanceUnit(units)})`, angle: -90, position: 'insideLeft', offset: 10, fill: '#9aa3b2' }}
            stroke="#9aa3b2"
            tick={{ fontSize: 11 }}
          />
          <ReferenceLine y={0} stroke="#3d8a4a" strokeDasharray="2 4" opacity={0.7} />
          <Tooltip
            contentStyle={{ background: '#1a1f2a', border: '1px solid #2a2f3a', color: '#e6ebf4' }}
            formatter={(value) => {
              const n = Number(value);
              return Number.isFinite(n) ? n.toFixed(1) : String(value);
            }}
            labelFormatter={(label) => {
              const n = Number(label);
              return Number.isFinite(n) ? `${n.toFixed(0)} ${distanceUnit(units)}` : String(label);
            }}
          />
          <Line
            type="monotone"
            dataKey="z"
            stroke="#c4b5fd"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
