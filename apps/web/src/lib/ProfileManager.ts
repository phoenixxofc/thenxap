export interface UserProfile {
  selected_class: string;
  custom_hex_color: string;
  unlocked_levels: number;
  stats: { kills: number; games_played: number };
  inventory: string[];
}

const STORAGE_KEY = 'arena_dash_profile';

export class ProfileManager {
  public static load(): UserProfile {
    if (typeof window === 'undefined') return this.getDefaults();
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return this.getDefaults();
    return JSON.parse(saved);
  }

  public static save(profile: Partial<UserProfile>) {
    if (typeof window === 'undefined') return;
    const current = this.load();
    const updated = { ...current, ...profile };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  public static getDefaults(): UserProfile {
    return {
      selected_class: 'Fighter',
      custom_hex_color: '#00F2FF',
      unlocked_levels: 1,
      stats: { kills: 0, games_played: 0 },
      inventory: ['basic_skin']
    };
  }
}
