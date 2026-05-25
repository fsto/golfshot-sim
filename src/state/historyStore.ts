import { create } from 'zustand';
import type { ShotResult } from '../physics/types';

export const MAX_HISTORY = 10;

/** Distinct, dimmer-than-active colors so saved shots don't fight the live trace. */
const GHOST_PALETTE = [
  '#f87171', // red-400
  '#fbbf24', // amber-400
  '#fb923c', // orange-400
  '#a3e635', // lime-400
  '#34d399', // emerald-400
  '#22d3ee', // cyan-400
  '#a78bfa', // violet-400
  '#f472b6', // pink-400
  '#e879f9', // fuchsia-400
  '#facc15', // yellow-400
];

export interface SavedShot {
  id: string;
  label: string;
  timestamp: number;
  color: string;
  result: ShotResult;
}

interface HistoryStore {
  shots: SavedShot[];           // newest first
  colorCursor: number;
  save: (result: ShotResult, label?: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

let idCounter = 0;
const nextId = () => `shot-${Date.now()}-${++idCounter}`;

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  shots: [],
  colorCursor: 0,

  save: (result, label) =>
    set((s) => {
      const color = GHOST_PALETTE[s.colorCursor % GHOST_PALETTE.length]!;
      const shot: SavedShot = {
        id: nextId(),
        label: label ?? `Shot #${s.shots.length + 1}`,
        timestamp: Date.now(),
        color,
        result,
      };
      const next = [shot, ...s.shots].slice(0, MAX_HISTORY);
      return { shots: next, colorCursor: s.colorCursor + 1 };
    }),

  remove: (id) => set((s) => ({ shots: s.shots.filter((x) => x.id !== id) })),

  clear: () => set({ shots: [], colorCursor: get().colorCursor }),
}));
