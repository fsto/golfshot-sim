import { useShotStore } from '../../state/shotStore';
import { useHistoryStore } from '../../state/historyStore';
import { useTrajectory } from '../../hooks/useTrajectory';
import { CLUB_PRESETS } from '../../presets/pgaPresets';

/** Adds the currently-displayed shot to history with an auto-generated label. */
export function SaveShotButton() {
  const result = useTrajectory();
  const mode = useShotStore((s) => s.mode);
  const delivery = useShotStore((s) => s.delivery);
  const save = useHistoryStore((s) => s.save);

  const onClick = () => {
    const presetLabel = mode === 'delivery' ? CLUB_PRESETS[delivery.clubId].label : 'Launch';
    const existing = useHistoryStore.getState().shots.filter((s) =>
      s.label.startsWith(presetLabel),
    );
    save(result, `${presetLabel} #${existing.length + 1}`);
  };

  return (
    <button type="button" className="primary-btn" onClick={onClick}>
      Save Shot
    </button>
  );
}
