import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useShotStore } from '../../state/shotStore';
import { useTrajectory } from '../../hooks/useTrajectory';
import {
  distanceDisplay, distanceUnit,
  shortDistanceDisplay, shortDistanceUnit,
} from '../../lib/format';

/** Height-vs-distance side profile (the "shape" of the shot). */
export function SideProfilePlot() {
  const units = useShotStore((s) => s.units);
  const traj = useTrajectory();

  const data = useMemo(() => {
    // Downsample to ~120 points for chart performance / readability.
    const samples = traj.flight.samples;
    const stride = Math.max(1, Math.floor(samples.length / 120));
    const out: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < samples.length; i += stride) {
      const s = samples[i]!;
      out.push({
        x: distanceDisplay(s.pos.x, units),
        y: shortDistanceDisplay(s.pos.y, units),
      });
    }
    const last = samples[samples.length - 1];
    if (last) {
      out.push({
        x: distanceDisplay(last.pos.x, units),
        y: shortDistanceDisplay(last.pos.y, units),
      });
    }
    return out;
  }, [traj, units]);

  return (
    <div className="plot">
      <div className="plot-title">Side profile (height vs distance)</div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 10, right: 24, bottom: 28, left: 36 }}>
          <CartesianGrid stroke="#2a2f3a" strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, 'dataMax']}
            label={{ value: `Distance (${distanceUnit(units)})`, position: 'insideBottom', offset: -10, fill: '#9aa3b2' }}
            stroke="#9aa3b2"
            tick={{ fontSize: 11 }}
          />
          <YAxis
            type="number"
            domain={[0, 'dataMax']}
            label={{ value: `Height (${shortDistanceUnit(units)})`, angle: -90, position: 'insideLeft', offset: 10, fill: '#9aa3b2' }}
            stroke="#9aa3b2"
            tick={{ fontSize: 11 }}
          />
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
            dataKey="y"
            stroke="#7dd3fc"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
