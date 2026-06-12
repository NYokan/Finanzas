import { create } from 'zustand';

// Zustand guarda solo estado de UI. La data vive siempre en SQLite:
// dataVersion es un contador que las pantallas usan como señal de refetch
// después de cada escritura a la base.
interface UIState {
  dataVersion: number;
  bumpDataVersion: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  dataVersion: 0,
  bumpDataVersion: () => set((s) => ({ dataVersion: s.dataVersion + 1 })),
}));

/** Llamar después de cada insert/update/delete para refrescar las pantallas. */
export function notifyDataChanged() {
  useUIStore.getState().bumpDataVersion();
}
