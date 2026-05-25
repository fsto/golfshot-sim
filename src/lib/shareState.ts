import { useShotStore } from '../state/shotStore';
import type {
  BallLaunchInput,
  ClubDeliveryInput,
  EnvConditions,
} from '../physics/types';
import type { DispersionConfig, InputMode, Units } from '../state/shotStore';

/**
 * Snapshot of every "input" piece of state that defines what shot the user sees.
 * Saved/saved shots history and worker-derived results are intentionally not included —
 * those are output, not input.
 */
interface SharePayload {
  v: 1;
  mode: InputMode;
  units: Units;
  launch: BallLaunchInput;
  delivery: ClubDeliveryInput;
  env: EnvConditions;
  dispersion: DispersionConfig;
}

const PREFIX = 's=';

/** Returns a string like `s=<urlencoded-json>` suitable for use as a URL hash. */
export function encodeShareState(): string {
  const s = useShotStore.getState();
  const payload: SharePayload = {
    v: 1,
    mode: s.mode,
    units: s.units,
    launch: s.launch,
    delivery: s.delivery,
    env: s.env,
    dispersion: s.dispersion,
  };
  return PREFIX + encodeURIComponent(JSON.stringify(payload));
}

/** Strips an optional leading `#` or `?`, validates, and returns the parsed payload or null. */
export function decodeShareState(rawHash: string): SharePayload | null {
  if (!rawHash) return null;
  let h = rawHash;
  if (h.startsWith('#') || h.startsWith('?')) h = h.slice(1);
  if (!h.startsWith(PREFIX)) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(h.slice(PREFIX.length))) as Partial<SharePayload>;
    if (parsed.v !== 1) return null;
    if (!parsed.mode || !parsed.units || !parsed.launch || !parsed.delivery || !parsed.env || !parsed.dispersion) {
      return null;
    }
    return parsed as SharePayload;
  } catch {
    return null;
  }
}

/** Applies a decoded payload to the live store. */
export function applyShareState(payload: SharePayload): void {
  const s = useShotStore.getState();
  s.setMode(payload.mode);
  s.setUnits(payload.units);
  s.updateLaunch(payload.launch);
  s.updateDelivery(payload.delivery);
  // updateEnv handles undefined coriolisLatDeg deletion — but only triggers if the key is present in patch.
  // To match the source, set the field explicitly.
  s.updateEnv({
    ...payload.env,
    coriolisLatDeg: payload.env.coriolisLatDeg,
  });
  s.updateDispersion(payload.dispersion);
}

/** Convenience: returns a full shareable URL including current location. */
export function buildShareUrl(): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${window.location.pathname}#${encodeShareState()}`;
}
