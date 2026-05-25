import { useShotStore } from '../../state/shotStore';
import { useDispersionStore } from '../../state/dispersionStore';
import { NumericField } from '../controls/NumericField';
import {
  distanceDisplay, distanceUnit,
  speedDisplay, speedFromDisplay, speedUnit,
} from '../../lib/format';
import { mean } from '../../lib/math/stats';

export function DispersionPanel() {
  const mode = useShotStore((s) => s.mode);
  const cfg = useShotStore((s) => s.dispersion);
  const units = useShotStore((s) => s.units);
  const update = useShotStore((s) => s.updateDispersion);
  const run = useDispersionStore((s) => s.run);
  const clear = useDispersionStore((s) => s.clear);
  const running = useDispersionStore((s) => s.running);
  const result = useDispersionStore((s) => s.result);
  const error = useDispersionStore((s) => s.error);

  const onRun = () => {
    const sigmas =
      mode === 'launch'
        ? {
            ballSpeedMps: cfg.ballSpeedMps,
            launchAngleDeg: cfg.launchAngleDeg,
            spinAxisDeg: cfg.spinAxisDeg,
          }
        : {
            clubSpeedMps: cfg.clubSpeedMps,
            faceAngleDeg: cfg.faceAngleDeg,
            ballSpeedMps: 0,
          };
    run(sigmas, cfg.n, cfg.seed);
  };

  return (
    <section className="panel">
      <h2 className="panel-title">Dispersion (Monte-Carlo)</h2>

      {mode === 'launch' ? (
        <>
          <NumericField
            label="σ Ball speed"
            value={speedDisplay(cfg.ballSpeedMps, units)}
            min={0}
            max={units === 'imperial' ? 10 : 4.5}
            step={0.1}
            decimals={1}
            unit={speedUnit(units)}
            onChange={(v) => update({ ballSpeedMps: speedFromDisplay(v, units) })}
          />
          <NumericField
            label="σ Launch angle"
            value={cfg.launchAngleDeg}
            min={0}
            max={5}
            step={0.1}
            decimals={1}
            unit="°"
            onChange={(v) => update({ launchAngleDeg: v })}
          />
          <NumericField
            label="σ Spin axis"
            value={cfg.spinAxisDeg}
            min={0}
            max={15}
            step={0.1}
            decimals={1}
            unit="°"
            onChange={(v) => update({ spinAxisDeg: v })}
          />
        </>
      ) : (
        <>
          <NumericField
            label="σ Club speed"
            value={speedDisplay(cfg.clubSpeedMps, units)}
            min={0}
            max={units === 'imperial' ? 8 : 3.5}
            step={0.1}
            decimals={1}
            unit={speedUnit(units)}
            onChange={(v) => update({ clubSpeedMps: speedFromDisplay(v, units) })}
          />
          <NumericField
            label="σ Face angle"
            value={cfg.faceAngleDeg}
            min={0}
            max={5}
            step={0.1}
            decimals={1}
            unit="°"
            onChange={(v) => update({ faceAngleDeg: v })}
          />
        </>
      )}

      <NumericField
        label="N (samples)"
        value={cfg.n}
        min={10}
        max={500}
        step={10}
        decimals={0}
        unit="shots"
        onChange={(v) => update({ n: Math.round(v) })}
      />

      <div className="dispersion-actions">
        <button type="button" className="primary-btn" onClick={onRun} disabled={running}>
          {running ? 'Running…' : 'Run dispersion'}
        </button>
        {result && (
          <button type="button" className="ghost-btn" onClick={clear}>
            Clear
          </button>
        )}
      </div>

      {error && <div className="dispersion-error">{error}</div>}

      {result && (
        <div className="dispersion-summary">
          <div>
            <span className="summary-label">Mean carry</span>
            <span className="summary-value">
              {distanceDisplay(mean(result.carries), units).toFixed(1)} {distanceUnit(units)}
            </span>
          </div>
          <div>
            <span className="summary-label">Mean total</span>
            <span className="summary-value">
              {distanceDisplay(mean(result.totals), units).toFixed(1)} {distanceUnit(units)}
            </span>
          </div>
          <div>
            <span className="summary-label">N</span>
            <span className="summary-value">{result.landings.length}</span>
          </div>
        </div>
      )}
    </section>
  );
}
