import { useShotStore } from '../../state/shotStore';
import { NumericField } from '../controls/NumericField';
import {
  speedDisplay, speedFromDisplay, speedUnit,
} from '../../lib/format';

export function BallLaunchForm() {
  const launch = useShotStore((s) => s.launch);
  const units = useShotStore((s) => s.units);
  const update = useShotStore((s) => s.updateLaunch);

  return (
    <section className="panel">
      <h2 className="panel-title">Ball Launch</h2>

      <NumericField
        label="Ball speed"
        value={speedDisplay(launch.ballSpeedMps, units)}
        min={60}
        max={200}
        step={0.1}
        decimals={1}
        unit={speedUnit(units)}
        onChange={(v) => update({ ballSpeedMps: speedFromDisplay(v, units) })}
      />

      <NumericField
        label="Launch angle"
        value={launch.launchAngleDeg}
        min={-5}
        max={50}
        step={0.1}
        decimals={1}
        unit="°"
        onChange={(v) => update({ launchAngleDeg: v })}
      />

      <NumericField
        label="Azimuth (start direction)"
        value={launch.azimuthDeg}
        min={-20}
        max={20}
        step={0.1}
        decimals={1}
        unit="°"
        onChange={(v) => update({ azimuthDeg: v })}
      />

      <NumericField
        label="Backspin"
        value={launch.backspinRpm}
        min={0}
        max={12000}
        step={10}
        decimals={0}
        unit="rpm"
        onChange={(v) => update({ backspinRpm: v })}
      />

      <NumericField
        label="Spin axis"
        value={launch.spinAxisDeg}
        min={-45}
        max={45}
        step={0.1}
        decimals={1}
        unit="°  (+right / −left)"
        onChange={(v) => update({ spinAxisDeg: v })}
      />
    </section>
  );
}
