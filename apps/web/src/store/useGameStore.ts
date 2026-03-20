import { create } from 'zustand';
import { HeroClassType } from '@arena-dash/engine';

interface GameState {
  score: number;
  health: number;
  maxHealth: number;
  omega: number;
  level: number;
  kills: number;
  isGameOver: boolean;
  selectedClass: HeroClassType;
  customHexColor: string;
  setGameState: (state: Partial<GameState>) => void;
  resetGame: () => void;
}

const STORAGE_KEY = 'arena_dash_profile';

const loadProfile = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  }
  return {
    selectedClass: HeroClassType.FIGHTER,
    customHexColor: '#00F2FF',
  };
};

// Internal non-reactive state for high-frequency updates
export const gameData = {
    score: 0,
    health: 100,
    maxHealth: 100,
    omega: 1,
    level: 1,
    kills: 0,
    isGameOver: false
};

export const useGameStore = create<GameState>((set) => ({
  score: 0,
  health: 100,
  maxHealth: 100,
  omega: 1,
  level: 1,
  kills: 0,
  isGameOver: false,
  ...loadProfile(),
  setGameState: (state) => {
    set((prev) => {
      const newState = { ...prev, ...state };
      if (typeof window !== 'undefined' && (state.selectedClass || state.customHexColor)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          selectedClass: newState.selectedClass,
          customHexColor: newState.customHexColor,
        }));
      }
      return newState;
    });
  },
  resetGame: () => {
      gameData.score = 0;
      gameData.health = 100;
      gameData.maxHealth = 100;
      gameData.omega = 1;
      gameData.level = 1;
      gameData.kills = 0;
      gameData.isGameOver = false;
      set({ score: 0, health: 100, maxHealth: 100, omega: 1, level: 1, kills: 0, isGameOver: false });
  },
}));
