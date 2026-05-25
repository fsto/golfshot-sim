import { useShotStore } from '../../state/shotStore';
import { NumericField } from '../controls/NumericField';
import { SurfacePicker } from '../controls/SurfacePicker';
import {
  tempDisplay, tempFromDisplay, tempUnit,
  pressureDisplay, pressureFromDisplay, pressureUnit,
  altitudeDisplay, altitudeFromDisplay, altitudeUnit,
  speedDisplay, speedFromDisplay, speedUnit,
} from '../../lib/format';

export function EnvPanel() {
  const env = useShotStore((s) => s.env);
  const units = useShotStore((s) => s.units);
  const update = useShotStore((s) => s.updateEnv);

  return (
    <section className="panel">
      <h2 className="panel-title">Environment</h2>

      <NumericField
        label="Temperature"
        value={tempDisplay(env.tempK, units)}
        min={units === 'imperial' ? 0 : -20}
        max={units === 'imperial' ? 120 : 50}
        step={units === 'imperial' ? 1 : 0.5}
        decimals={1}
        unit={tempUnit(units)}
        onChange={(v) => update({ tempK: tempFromDisplay(v, units) })}
      />

      <NumericField
        label="Pressure"
        value={pressureDisplay(env.pressurePa, units)}
        min={units === 'imperial' ? 24 : 800}
        max={units === 'imperial' ? 32 : 1080}
        step={units === 'imperial' ? 0.01 : 1}
        decimals={units === 'imperial' ? 2 : 0}
        unit={pressureUnit(units)}
        onChange={(v) => update({ pressurePa: pressureFromDisplay(v, units) })}
      />

      <NumericField
        label="Humidity"
        value={env.humidityPct}
        min={0}
        max={100}
        step={1}
        decimals={0}
        unit="%"
        onChange={(v) => update({ humidityPct: v })}
      />

      <NumericField
        label="Altitude"
        value={altitudeDisplay(env.altitudeM, units)}
        min={0}
        max={units === 'imperial' ? 12000 : 3700}
        step={units === 'imperial' ? 50 : 10}
        decimals={0}
        unit={altitudeUnit(units)}
        onChange={(v) => update({ altitudeM: altitudeFromDisplay(v, units) })}
      />

      <NumericField
        label="Wind speed"
        value={speedDisplay(env.windSpeedMps, units)}
        min={0}
        max={units === 'imperial' ? 40 : 18}
        step={0.1}
        decimals={1}
        unit={speedUnit(units)}
        onChange={(v) => update({ windSpeedMps: speedFromDisplay(v, units) })}
      />

      <NumericField
        label="Wind direction"
        value={env.windDirDeg}
        min={0}
        max={359}
        step={1}
        decimals={0}
        unit="° (FROM; 0=head, 180=tail)"
        onChange={(v) => update({ windDirDeg: v })}
      />

      <SurfacePicker />
    </section>
  );
}
