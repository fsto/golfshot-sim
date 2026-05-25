import { useId } from 'react';
import { useShotStore } from '../../state/shotStore';
import { presetList } from '../../presets/pgaPresets';
import type { ClubId } from '../../physics/types';

export function PresetPicker() {
  const id = useId();
  const clubId = useShotStore((s) => s.delivery.clubId);
  const setClub = useShotStore((s) => s.setClub);
  return (
    <div className="preset-picker">
      <label htmlFor={id} className="field-label">
        <span>Club preset</span>
      </label>
      <select
        id={id}
        value={clubId}
        onChange={(e) => setClub(e.target.value as ClubId)}
        className="preset-select"
      >
        {presetList.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>
    </div>
  );
}
