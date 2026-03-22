import React, { useState } from 'react';
import { PhaserGame } from './game/PhaserGame';
import { HUD } from './components/HUD';
import { Forge } from './components/Forge';
import { useGameStore } from './store/useGameStore';
import { HeroClassType } from '@arena-dash/engine';

function App() {
  const [showForge, setShowForge] = useState(false);
  const selected_class = useGameStore((state) => state.selected_class);
  const heroClass = selected_class.toUpperCase() as HeroClassType;

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#050506] text-[#00F2FF] font-mono p-8 overflow-hidden">
      <div className="z-10 w-full max-w-5xl items-center justify-between text-sm flex mb-12">
        <h1 className="text-4xl font-bold tracking-tighter">ARENA DASH <span className="text-xs align-top bg-[#00F2FF] text-[#050506] px-1 ml-1">v2.1</span></h1>
        <div className="flex gap-4">
          <button onClick={() => setShowForge(true)} className="border border-[#00F2FF] px-4 py-2 hover:bg-[#00F2FF] hover:text-[#050506] transition-all">THE FORGE</button>
          <button className="border border-[#FFB800] text-[#FFB800] px-4 py-2 hover:bg-[#FFB800] hover:text-[#050506] transition-all">CONNECT NERVE-LINK</button>
        </div>
      </div>
      <div className="relative w-[800px] h-[600px] border-2 border-[#1A1A1B] shadow-[0_0_50px_rgba(0,242,255,0.1)] overflow-hidden">
        <PhaserGame selectedClass={heroClass} />
        <HUD />
      </div>
      {showForge && <Forge onClose={() => setShowForge(false)} />}
    </main>
  );
}

export default App;
