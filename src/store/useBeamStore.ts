import { create } from 'zustand';

export type Mode = 'Analyze' | 'Compare' | 'Solve';

export interface PlankConfig {
  b: number; // width mm
  h: number; // height mm
  woodClass: string; // e.g. "C24"
}

export interface BeamState {
  // Shared Loading Configuration
  span: number; // meters
  liveLoad: number; // kN/m2
  tributaryWidth: number; // meters
  deadLoad: number; // kN/m2
  safetyFactor: number;
  deflectionLimitDivider: number; // e.g. 300 for L/300

  // UI State
  currentMode: Mode;
  showWorkPanelVisible: boolean;

  // Analyze Mode Config
  plankA: PlankConfig;

  // Compare Mode Config (plankA serves as Design A)
  plankB: PlankConfig;

  // Solve Mode Config (Target Ratios)
  targetURBending: number;
  targetURShear: number;

  // Actions
  setSpan: (val: number) => void;
  setLiveLoad: (val: number) => void;
  setTributaryWidth: (val: number) => void;
  setDeadLoad: (val: number) => void;
  setSafetyFactor: (val: number) => void;
  setDeflectionLimitDivider: (val: number) => void;
  setCurrentMode: (mode: Mode) => void;
  setShowWorkPanelVisible: (visible: boolean) => void;
  setPlankA: (config: Partial<PlankConfig>) => void;
  setPlankB: (config: Partial<PlankConfig>) => void;
  setTargetURBending: (val: number) => void;
  setTargetURShear: (val: number) => void;
}

export const useBeamStore = create<BeamState>((set) => ({
  span: 4.0,
  liveLoad: 2.0,
  tributaryWidth: 0.6,
  deadLoad: 0.5,
  safetyFactor: 1.0, 
  deflectionLimitDivider: 300,

  currentMode: 'Analyze',
  showWorkPanelVisible: false,

  plankA: { b: 45, h: 195, woodClass: 'C24' },
  plankB: { b: 45, h: 220, woodClass: 'C24' },

  targetURBending: 0.9,
  targetURShear: 0.9,

  setSpan: (span) => set({ span }),
  setLiveLoad: (liveLoad) => set({ liveLoad }),
  setTributaryWidth: (tributaryWidth) => set({ tributaryWidth }),
  setDeadLoad: (deadLoad) => set({ deadLoad }),
  setSafetyFactor: (safetyFactor) => set({ safetyFactor }),
  setDeflectionLimitDivider: (deflectionLimitDivider) => set({ deflectionLimitDivider }),
  setCurrentMode: (currentMode) => set({ currentMode }),
  setShowWorkPanelVisible: (showWorkPanelVisible) => set({ showWorkPanelVisible }),
  setPlankA: (config) => set((state) => ({ plankA: { ...state.plankA, ...config } })),
  setPlankB: (config) => set((state) => ({ plankB: { ...state.plankB, ...config } })),
  setTargetURBending: (targetURBending) => set({ targetURBending }),
  setTargetURShear: (targetURShear) => set({ targetURShear }),
}));
