import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useShotStore, type Units } from '../../state/shotStore';
import { useHistoryStore } from '../../state/historyStore';
import { useTrajectory } from '../../hooks/useTrajectory';
import type { ShotResult } from '../../physics/types';
import {
  distanceDisplay, distanceUnit,
  shortDistanceDisplay, shortDistanceUnit,
} from '../../lib/format';

function sampleProfile(result: ShotResult, units: Units): Array<{ x: number; y: number }> {
  const flight = result.flight.samples;
  const stride = Math.max(1, Math.floor(flight.length / 80));
  const out: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < flight.length; i += stride) {
    const s = flight[i]!;
    out.push({ x: distanceDisplay(s.pos.x, units), y: shortDistanceDisplay(s.pos.y, units) });
  }
  const last = flight[flight.length - 1];
  if (last) out.push({ x: distanceDisplay(last.pos.x, units), y: shortDistanceDisplay(last.pos.y, units) });
  const ground = result.rollPath;
  const gStride = Math.max(1, Math.floor(ground.length / 60));
  for (let i = 0; i < ground.length; i += gStride) {
    const p = ground[i]!;
    out.push({ x: distanceDisplay(p.x, units), y: shortDistanceDisplay(p.y, units) });
  }
  return out;
}

/** Height-vs-distance side profile (the "shape" of the shot). */
export function SideProfilePlot() {
  const units = useShotStore((s) => s.units);
  const traj = useTrajectory();
  const ghosts = useHistoryStore((s) => s.shots);

  const data = useMemo(() => {
    // Carry phase: downsampled to ~120 points
    const flight = traj.flight.samples;
    const stride = Math.max(1, Math.floor(flight.length / 120));
    const out: Array<{ x: number; carry: number | null; ground: number | null }> = [];
    for (let i = 0; i < flight.length; i += stride) {
      const s = flight[i]!;
      out.push({
        x: distanceDisplay(s.pos.x, units),
        carry: shortDistanceDisplay(s.pos.y, units),
        ground: null,
      });
    }
    const last = flight[flight.length - 1];
    if (last) {
      out.push({
        x: distanceDisplay(last.pos.x, units),
        carry: shortDistanceDisplay(last.pos.y, units),
        ground: shortDistanceDisplay(last.pos.y, units),
      });
    }
    // Ground phase (bounces + roll), downsampled
    const ground = traj.rollPath;
    const gStride = Math.max(1, Math.floor(ground.length / 80));
    for (let i = 0; i < ground.length; i += gStride) {
      const p = ground[i]!;
      out.push({
        x: distanceDisplay(p.x, units),
        carry: null,
        ground: shortDistanceDisplay(p.y, units),
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
            tickFormatter={(v: number) => Math.round(v).toString()}
            allowDecimals={false}
          />
          <YAxis
            type="number"
            domain={[0, 'dataMax']}
            label={{ value: `Height (${shortDistanceUnit(units)})`, angle: -90, position: 'insideLeft', offset: 10, fill: '#9aa3b2' }}
            stroke="#9aa3b2"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => Math.round(v).toString()}
            allowDecimals={false}
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
          {ghosts.map((g) => (
            <Line
              key={g.id}
              data={sampleProfile(g.result, units)}
              type="monotone"
              dataKey="y"
              stroke={g.color}
              strokeWidth={1.2}
              strokeOpacity={0.5}
              dot={false}
              isAnimationActive={false}
            />
          ))}
          <Line
            type="monotone"
            dataKey="carry"
            stroke="#7dd3fc"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="ground"
            stroke="#86efac"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
