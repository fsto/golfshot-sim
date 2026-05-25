import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useShotStore, type Units } from '../../state/shotStore';
import { useHistoryStore } from '../../state/historyStore';
import { useTrajectory } from '../../hooks/useTrajectory';
import { useElementSize } from '../../lib/useElementSize';
import type { ShotResult } from '../../physics/types';
import {
  distanceDisplay, distanceUnit,
  shortDistanceDisplay, shortDistanceUnit,
} from '../../lib/format';

const MARGIN = { top: 10, right: 24, bottom: 28, left: 44 };
const CHART_HEIGHT = 200;

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

/**
 * Height-vs-distance side profile (the "shape" of the shot).
 *
 * Maintains 1:1 data aspect ratio: y-units-per-pixel == x-units-per-pixel. The chart height
 * is fixed and the plot width is measured live via ResizeObserver, so the Y domain expands
 * to match the X range scaled by (plotHeight / plotWidth). This keeps the trajectory shape
 * truthful (real golf shots are FLAT — apex is tiny vs carry) instead of stretched to fill
 * the plot rectangle.
 */
export function SideProfilePlot() {
  const units = useShotStore((s) => s.units);
  const traj = useTrajectory();
  const ghosts = useHistoryStore((s) => s.shots);
  const [wrapRef, { width: wrapW }] = useElementSize<HTMLDivElement>();

  const data = useMemo(() => {
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

  const xMax = useMemo(
    () => data.reduce((m, p) => Math.max(m, p.x), 0),
    [data],
  );
  const yDataMax = useMemo(
    () =>
      data.reduce(
        (m, p) => Math.max(m, p.carry ?? 0, p.ground ?? 0),
        0,
      ),
    [data],
  );

  // Equal-aspect Y domain: compute from measured plot dimensions
  const plotW = Math.max(1, wrapW - MARGIN.left - MARGIN.right);
  const plotH = Math.max(1, CHART_HEIGHT - MARGIN.top - MARGIN.bottom);
  const aspectFromData = plotH / plotW;          // y-units / x-unit pixel ratio target
  const yRange = xMax * aspectFromData;
  const yDomainMax = Math.max(yRange, yDataMax * 1.1, 1);

  return (
    <div className="plot" ref={wrapRef}>
      <div className="plot-title">Side profile (height vs distance — 1 : 1 scale)</div>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <LineChart data={data} margin={MARGIN}>
          <CartesianGrid stroke="#2a2f3a" strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, Math.max(xMax, 1)]}
            label={{ value: `Distance (${distanceUnit(units)})`, position: 'insideBottom', offset: -10, fill: '#9aa3b2' }}
            stroke="#9aa3b2"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => Math.round(v).toString()}
            allowDecimals={false}
          />
          <YAxis
            type="number"
            domain={[0, yDomainMax]}
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
