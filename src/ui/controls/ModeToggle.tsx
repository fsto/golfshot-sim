import { useShotStore } from '../../state/shotStore';

export function ModeToggle() {
  const mode = useShotStore((s) => s.mode);
  const setMode = useShotStore((s) => s.setMode);
  return (
    <div className="units-toggle" role="group" aria-label="Input mode">
      <button
        type="button"
        className={mode === 'launch' ? 'is-active' : ''}
        onClick={() => setMode('launch')}
        aria-pressed={mode === 'launch'}
      >
        Ball Launch
      </button>
      <button
        type="button"
        className={mode === 'delivery' ? 'is-active' : ''}
        onClick={() => setMode('delivery')}
        aria-pressed={mode === 'delivery'}
      >
        Club Delivery
      </button>
    </div>
  );
}
