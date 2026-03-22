import { create } from 'zustand';
import { HeroClassType } from '@arena-dash/engine';
import { ProfileManager, UserProfile } from '../lib/ProfileManager';

interface GameState extends UserProfile {
  score: number;
  health: number;
  maxHealth: number;
  omega: number;
  level: number;
  kills: number;
  isGameOver: boolean;
  isLevelUpPending: boolean;
  isSubmitting: boolean;
  setGameState: (state: Partial<GameState>) => void;
  resetGame: () => void;
  submitScore: (wallet: string, inputLog: any[], seed: string) => Promise<void>;
}

export const gameData = {
    score: 0,
    health: 100,
    maxHealth: 100,
    omega: 1,
    level: 1,
    kills: 0,
    isGameOver: false
};

export const useGameStore = create<GameState>((set, get) => ({
  score: 0,
  health: 100,
  maxHealth: 100,
  omega: 1,
  level: 1,
  kills: 0,
  isGameOver: false,
  isLevelUpPending: false,
  isSubmitting: false,
  ...ProfileManager.load(),
  setGameState: (state) => {
    set((prev) => {
      const newState = { ...prev, ...state };
      if (state.selected_class || state.custom_hex_color || state.unlocked_levels || state.stats || state.inventory) {
          ProfileManager.save(newState);
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
      set({ score: 0, health: 100, maxHealth: 100, omega: 1, level: 1, kills: 0, isGameOver: false, isSubmitting: false, isLevelUpPending: false });
  },
  submitScore: async (wallet, inputLog, seed) => {
      set({ isSubmitting: true });
      try {
          const response = await fetch('http://localhost:3001/validate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  playerWallet: wallet,
                  reportedScore: get().score,
                  inputLog,
                  seed
              })
          });
          const data = await response.json();
          if (data.valid) {
              const currentStats = get().stats;
              get().setGameState({
                  stats: {
                      kills: currentStats.kills + get().kills,
                      games_played: currentStats.games_played + 1
                  }
              });
          }
      } catch (e) {
          console.error("Submission failed", e);
      } finally {
          set({ isSubmitting: false });
      }
  }
}));
