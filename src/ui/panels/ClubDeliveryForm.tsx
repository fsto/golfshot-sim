import { useShotStore } from '../../state/shotStore';
import { NumericField } from '../controls/NumericField';
import { PresetPicker } from './PresetPicker';
import {
  speedDisplay, speedFromDisplay, speedUnit,
} from '../../lib/format';

export function ClubDeliveryForm() {
  const delivery = useShotStore((s) => s.delivery);
  const units = useShotStore((s) => s.units);
  const update = useShotStore((s) => s.updateDelivery);

  return (
    <section className="panel">
      <h2 className="panel-title">Club Delivery</h2>

      <PresetPicker />

      <NumericField
        label="Club speed"
        value={speedDisplay(delivery.clubSpeedMps, units)}
        min={40}
        max={140}
        step={0.1}
        decimals={1}
        unit={speedUnit(units)}
        onChange={(v) => update({ clubSpeedMps: speedFromDisplay(v, units) })}
      />

      <NumericField
        label="Attack angle"
        value={delivery.attackAngleDeg}
        min={-10}
        max={10}
        step={0.1}
        decimals={1}
        unit="°  (+up / −down)"
        onChange={(v) => update({ attackAngleDeg: v })}
      />

      <NumericField
        label="Club path"
        value={delivery.clubPathDeg}
        min={-15}
        max={15}
        step={0.1}
        decimals={1}
        unit="°  (+in-to-out)"
        onChange={(v) => update({ clubPathDeg: v })}
      />

      <NumericField
        label="Face angle"
        value={delivery.faceAngleDeg}
        min={-15}
        max={15}
        step={0.1}
        decimals={1}
        unit="°  (+open / −closed)"
        onChange={(v) => update({ faceAngleDeg: v })}
      />

      <NumericField
        label="Dynamic loft"
        value={delivery.dynamicLoftDeg}
        min={0}
        max={60}
        step={0.1}
        decimals={1}
        unit="°"
        onChange={(v) => update({ dynamicLoftDeg: v })}
      />
    </section>
  );
}
