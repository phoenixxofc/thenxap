'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore, gameData } from '../store/useGameStore';

export const HUD: React.FC = () => {
  const { isGameOver, isLevelUpPending, selected_class, stats, setGameState } = useGameStore();
  const [localData, setLocalData] = useState(gameData);

  useEffect(() => {
    const interval = setInterval(() => {
      setLocalData({ ...gameData });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const { score, health, maxHealth, omega, level, kills } = localData;
  const healthColor = health / maxHealth > 0.3 ? '#32D74B' : '#FF3B30';
  const levelThreshold = 15 + level * 5;

  return (
    <div className="absolute inset-0 pointer-events-none p-6 font-mono z-10">
      <div className="absolute top-6 left-6">
        <div className="text-[#8E8E93] text-xs uppercase tracking-widest mb-1">{selected_class} UNIT ACTIVE</div>
        <div className="text-3xl font-bold text-[#00F2FF]">{score.toLocaleString()}</div>
      </div>

      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center">
        <div className="text-[#8E8E93] text-xs uppercase tracking-widest mb-1">Sector Depth: {level}</div>
        <div className="w-48 h-1 bg-[#1A1A1B]">
          <div
            className="h-full bg-[#39FF14] transition-all duration-300 shadow-[0_0_10px_#39FF14]"
            style={{ width: `${(kills / levelThreshold) * 100}%` }}
          />
        </div>
        <div className="text-[10px] mt-1 text-[#39FF14]">{kills}/{levelThreshold} TO NEXT SECTOR</div>
      </div>

      <div className="absolute top-6 right-6 text-right">
        <div className="text-[#8E8E93] text-xs uppercase tracking-widest mb-1">Entropy Factor</div>
        <div className="text-xl font-bold text-[#FFB800]">Ω {omega.toFixed(2)}</div>
        <div className="w-32 h-1 bg-[#1A1A1B] mt-1 ml-auto">
          <div
            className="h-full bg-[#FFB800] transition-all duration-500"
            style={{ width: `${Math.min(100, (omega - 1) * 20)}%` }}
          />
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-64 text-center">
        <div className="text-[#8E8E93] text-[10px] uppercase tracking-[0.2em] mb-2">Vitals Integrity</div>
        <div className="w-full h-2 bg-[#1A1A1B] rounded-full overflow-hidden border border-[#ffffff10]">
          <div
            className="h-full transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
            style={{
              width: `${(health / maxHealth) * 100}%`,
              backgroundColor: healthColor,
              boxShadow: `0 0 15px ${healthColor}80`
            }}
          />
        </div>
        <div className="text-[10px] mt-1 text-[#8E8E93]">{health}/{maxHealth}</div>
      </div>

      {isLevelUpPending && (
        <div className="absolute inset-0 bg-[#050506f0] pointer-events-auto flex flex-col items-center justify-center backdrop-blur-sm z-20">
          <h2 className="text-4xl font-black text-[#39FF14] mb-2 tracking-tighter italic">SECTOR BREACHED</h2>
          <p className="text-[#8E8E93] mb-8 uppercase tracking-[0.3em]">Select Neural Augment</p>
          <div className="grid grid-cols-1 gap-4 w-64">
            {['Kinetic Boost', 'Neural Shield', 'Thermal Gaze'].map(opt => (
              <button
                key={opt}
                onClick={() => setGameState({ isLevelUpPending: false })}
                className="border border-[#39FF14] text-[#39FF14] py-3 hover:bg-[#39FF14] hover:text-[#050506] transition-all uppercase text-xs font-bold"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {isGameOver && (
        <div className="absolute inset-0 bg-[#050506f0] pointer-events-auto flex flex-col items-center justify-center backdrop-blur-sm">
          <h2 className="text-5xl font-black text-[#FF0043] mb-2 tracking-tighter">NEURAL LINK SEVERED</h2>
          <p className="text-[#8E8E93] mb-2 uppercase tracking-[0.3em]">Sector {level} Breached | Final Score {score}</p>
          <div className="text-[10px] text-[#8E8E93] mb-8 uppercase">Total Career Kills: {stats.kills + kills}</div>
          <button
            onClick={() => window.location.reload()}
            className="border-2 border-[#00F2FF] text-[#00F2FF] px-10 py-3 font-bold hover:bg-[#00F2FF] hover:text-[#050506] transition-all uppercase tracking-widest"
          >
            Re-Synchronize
          </button>
        </div>
      )}
    </div>
  );
};
