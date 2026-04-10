import { create } from 'zustand';

export type ScreenState = 'menu' | 'char' | 'map' | 'hud' | 'death' | 'victory';

interface GameState {
  screen: ScreenState;
  setScreen: (screen: ScreenState) => void;
  
  // Modals
  showHowToPlay: boolean;
  setShowHowToPlay: (show: boolean) => void;
  showAbout: boolean;
  setShowAbout: (show: boolean) => void;
  showPause: boolean;
  setShowPause: (show: boolean) => void;
  showUpgrade: boolean;
  setShowUpgrade: (show: boolean) => void;

  // Game Data
  charIdx: number;
  setCharIdx: (idx: number) => void;
  level: number;
  setLevel: (level: number) => void;
  unlocked: number;
  setUnlocked: (unlocked: number) => void;
  score: number;
  setScore: (score: number) => void;
  
  // HUD Data
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  special: number;
  maxSpecial: number;
  spRdy: boolean;
  reloading: boolean;
  reloadPct: number;
  weapons: any[];
  gunIdx: number;
  bossName: string;
  bossHpPct: number;
  bossPhase: string;
  bossIcon: string;
  bossColor: string;
  
  // Transient UI
  announcement: { text: string; color: string; id: number } | null;
  setAnnouncement: (text: string, color: string) => void;
  killfeed: { text: string; color: string; id: number }[];
  addKillfeed: (text: string, color: string) => void;
  
  // Actions for Engine to update HUD
  updateHUD: (data: Partial<GameState>) => void;
  
  // Upgrades
  upgrades: Record<string, number>;
  addUpgrade: (id: string) => void;
  resetUpgrades: () => void;
}

let annId = 0;
let kfId = 0;

export const useGameStore = create<GameState>((set) => ({
  screen: 'menu',
  setScreen: (screen) => set({ screen }),
  
  showHowToPlay: false,
  setShowHowToPlay: (show) => set({ showHowToPlay: show }),
  showAbout: false,
  setShowAbout: (show) => set({ showAbout: show }),
  showPause: false,
  setShowPause: (show) => set({ showPause: show }),
  showUpgrade: false,
  setShowUpgrade: (show) => set({ showUpgrade: show }),

  charIdx: 0,
  setCharIdx: (charIdx) => set({ charIdx }),
  level: 0,
  setLevel: (level) => set({ level }),
  unlocked: 1,
  setUnlocked: (unlocked) => set({ unlocked }),
  score: 0,
  setScore: (score) => set({ score }),

  hp: 100, maxHp: 100, shield: 100, maxShield: 100,
  special: 0, maxSpecial: 100, spRdy: false,
  reloading: false, reloadPct: 0,
  weapons: [], gunIdx: 0,
  bossName: '', bossHpPct: 0, bossPhase: '', bossIcon: '', bossColor: '#ff4400',

  announcement: null,
  setAnnouncement: (text, color) => {
    const id = ++annId;
    set({ announcement: { text, color, id } });
    setTimeout(() => {
      set((state) => (state.announcement?.id === id ? { announcement: null } : state));
    }, 2900);
  },
  
  killfeed: [],
  addKillfeed: (text, color) => {
    const id = ++kfId;
    set((state) => {
      const newFeed = [...state.killfeed, { text, color, id }].slice(-5);
      return { killfeed: newFeed };
    });
    setTimeout(() => {
      set((state) => ({ killfeed: state.killfeed.filter((k) => k.id !== id) }));
    }, 3500);
  },

  updateHUD: (data) => set((state) => ({ ...state, ...data })),

  upgrades: { dmg: 0, speed: 0, shield: 0, reload: 0, special: 0 },
  addUpgrade: (id) => set((state) => ({ upgrades: { ...state.upgrades, [id]: (state.upgrades[id] || 0) + 1 } })),
  resetUpgrades: () => set({ upgrades: { dmg: 0, speed: 0, shield: 0, reload: 0, special: 0 } }),
}));
