import { create } from 'zustand';

export type ViewMode = 'real' | 'layers' | 'cutaway' | 'blueprint' | 'sleeptest';
export type SleeperPose = 'side' | 'back';
export type SleeperGender = 'woman' | 'man';
export type MattressCompareType = 'sleepworld' | 'typical';

interface ShowroomState {
  // Current view mode
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;

  // Selected mattress model index (0 to 14)
  selectedModelIndex: number;
  setSelectedModelIndex: (index: number) => void;

  // Selected exploded layer index (-1 = none)
  selectedLayerIndex: number;
  setSelectedLayerIndex: (index: number) => void;

  // Sleep test options
  sleeperPose: SleeperPose;
  setSleeperPose: (pose: SleeperPose) => void;
  sleeperGender: SleeperGender;
  setSleeperGender: (gender: SleeperGender) => void;
  compareType: MattressCompareType;
  setCompareType: (type: MattressCompareType) => void;
  showHeatmap: boolean;
  setShowHeatmap: (show: boolean) => void;

  // Cutaway slice position (-6 to +6)
  cutawaySlice: number;
  setCutawaySlice: (slice: number) => void;

  // Language
  language: 'en' | 'hi';
  toggleLanguage: () => void;

  // Guided Pitch Tour
  isPitchActive: boolean;
  setIsPitchActive: (active: boolean) => void;

  // Selected pressure point for deep inspection
  selectedPressurePointId: string | null;
  setSelectedPressurePointId: (id: string | null) => void;

  // Contact modal
  isContactModalOpen: boolean;
  setIsContactModalOpen: (open: boolean) => void;
}

export const useShowroomStore = create<ShowroomState>((set) => ({
  mode: 'real',
  setMode: (mode) => set({ mode, selectedLayerIndex: -1, isPitchActive: false }),

  selectedModelIndex: 0,
  setSelectedModelIndex: (index) => set({ selectedModelIndex: index, selectedLayerIndex: -1 }),

  selectedLayerIndex: -1,
  setSelectedLayerIndex: (index) => set({ selectedLayerIndex: index }),

  sleeperPose: 'side',
  setSleeperPose: (pose) => set({ sleeperPose: pose, selectedPressurePointId: null }),

  sleeperGender: 'woman',
  setSleeperGender: (gender) => set({ sleeperGender: gender }),

  compareType: 'sleepworld',
  setCompareType: (compareType) => set({ compareType }),

  showHeatmap: true,
  setShowHeatmap: (showHeatmap) => set({ showHeatmap }),

  cutawaySlice: 0,
  setCutawaySlice: (cutawaySlice) => set({ cutawaySlice }),

  language: 'en',
  toggleLanguage: () => set((state) => ({ language: state.language === 'en' ? 'hi' : 'en' })),

  isPitchActive: false,
  setIsPitchActive: (isPitchActive) => set({ isPitchActive }),

  selectedPressurePointId: null,
  setSelectedPressurePointId: (id) => set({ selectedPressurePointId: id }),

  isContactModalOpen: false,
  setIsContactModalOpen: (open) => set({ isContactModalOpen: open }),
}));

