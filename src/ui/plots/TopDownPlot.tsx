import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useShotStore, type Units } from '../../state/shotStore';
import { useHistoryStore } from '../../state/historyStore';
import { useDispersionStore } from '../../state/dispersionStore';
import { useTrajectory } from '../../hooks/useTrajectory';
import type { ShotResult } from '../../physics/types';
import { distanceDisplay, distanceUnit } from '../../lib/format';
import { Scatter } from 'recharts';

function sampleTopDown(result: ShotResult, units: Units): Array<{ x: number; z: number }> {
  const flight = result.flight.samples;
  const stride = Math.max(1, Math.floor(flight.length / 80));
  const out: Array<{ x: number; z: number }> = [];
  for (let i = 0; i < flight.length; i += stride) {
    const s = flight[i]!;
    out.push({ x: distanceDisplay(s.pos.x, units), z: distanceDisplay(s.pos.z, units) });
  }
  const last = flight[flight.length - 1];
  if (last) out.push({ x: distanceDisplay(last.pos.x, units), z: distanceDisplay(last.pos.z, units) });
  const ground = result.rollPath;
  const gStride = Math.max(1, Math.floor(ground.length / 60));
  for (let i = 0; i < ground.length; i += gStride) {
    const p = ground[i]!;
    out.push({ x: distanceDisplay(p.x, units), z: distanceDisplay(p.z, units) });
  }
  return out;
}

/** Top-down: lateral (z) vs distance (x). Reveals draw/fade curvature. */
export function TopDownPlot() {
  const units = useShotStore((s) => s.units);
  const traj = useTrajectory();
  const ghosts = useHistoryStore((s) => s.shots);
  const dispersion = useDispersionStore((s) => s.result);
  const scatterData = useMemo(
    () =>
      dispersion?.rests.map((p) => ({
        x: distanceDisplay(p.x, units),
        z: distanceDisplay(p.z, units),
      })) ?? [],
    [dispersion, units],
  );

  const data = useMemo(() => {
    const flight = traj.flight.samples;
    const fStride = Math.max(1, Math.floor(flight.length / 120));
    const out: Array<{ x: number; carry: number | null; ground: number | null }> = [];
    for (let i = 0; i < flight.length; i += fStride) {
      const s = flight[i]!;
      out.push({
        x: distanceDisplay(s.pos.x, units),
        carry: distanceDisplay(s.pos.z, units),
        ground: null,
      });
    }
    const last = flight[flight.length - 1];
    if (last) {
      out.push({
        x: distanceDisplay(last.pos.x, units),
        carry: distanceDisplay(last.pos.z, units),
        ground: distanceDisplay(last.pos.z, units),
      });
    }
    const ground = traj.rollPath;
    const gStride = Math.max(1, Math.floor(ground.length / 80));
    for (let i = 0; i < ground.length; i += gStride) {
      const p = ground[i]!;
      out.push({
        x: distanceDisplay(p.x, units),
        carry: null,
        ground: distanceDisplay(p.z, units),
      });
    }
    return out;
  }, [traj, units]);

  const totalDisplay = distanceDisplay(traj.totalM, units);
  const yDomain: [number, number] = (() => {
    const maxAbs = data.reduce(
      (m, p) => Math.max(m, Math.abs(p.carry ?? 0), Math.abs(p.ground ?? 0)),
      1,
    );
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
            domain={[0, Math.max(totalDisplay * 1.05, 50)]}
            label={{ value: `Distance (${distanceUnit(units)})`, position: 'insideBottom', offset: -10, fill: '#9aa3b2' }}
            stroke="#9aa3b2"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => Math.round(v).toString()}
            allowDecimals={false}
          />
          <YAxis
            type="number"
            domain={yDomain}
            label={{ value: `Lateral (${distanceUnit(units)})`, angle: -90, position: 'insideLeft', offset: 10, fill: '#9aa3b2' }}
            stroke="#9aa3b2"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => Math.round(v).toString()}
            allowDecimals={false}
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
          {ghosts.map((g) => (
            <Line
              key={g.id}
              data={sampleTopDown(g.result, units)}
              type="monotone"
              dataKey="z"
              stroke={g.color}
              strokeWidth={1.2}
              strokeOpacity={0.5}
              dot={false}
              isAnimationActive={false}
            />
          ))}
          {scatterData.length > 0 && (
            <Scatter data={scatterData} fill="#facc15" fillOpacity={0.6} dataKey="z" />
          )}
          <Line
            type="monotone"
            dataKey="carry"
            stroke="#c4b5fd"
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
