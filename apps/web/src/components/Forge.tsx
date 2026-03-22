'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';
import { HeroClassType } from '@arena-dash/engine';

const HumanoidModel: React.FC<{ color: string; classType: string }> = ({ color, classType }) => {
  const meshRef = useRef<THREE.Group>(null);
  const heroType = classType.toUpperCase() as HeroClassType;

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={meshRef}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={heroType === HeroClassType.TANK ? [1, 1.5, 0.8] : [0.8, 1.2, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#dddddd" />
      </mesh>
      {heroType === HeroClassType.MARKSMAN && (
          <mesh position={[0.5, 0.2, 0.5]}>
              <boxGeometry args={[0.1, 0.1, 1]} />
              <meshStandardMaterial color="#444" />
          </mesh>
      )}
      {heroType === HeroClassType.MAGE && (
           <mesh position={[0, 1, 0]}>
           <sphereGeometry args={[0.4, 32, 32]} />
           <meshBasicMaterial color={color} transparent opacity={0.3} />
         </mesh>
      )}
    </group>
  );
};

export const Forge: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { selected_class, custom_hex_color, setGameState, stats } = useGameStore();

  const HERO_DETAILS: Record<string, any> = {
    [HeroClassType.TANK]: {
        title: "The Juggernaut",
        ability: "Shield Charge: High-weight dash with knockback and 2x damage.",
        passive: "Colossus: +50% HP, 15% damage reduction."
    },
    [HeroClassType.FIGHTER]: {
        title: "The Duelist",
        ability: "Blade Whirl: Melee sweep on dash completion.",
        passive: "Vampiric Strike: Heals on enemy neutralization."
    },
    [HeroClassType.ASSASSIN]: {
        title: "The Shadow",
        ability: "Shadow Step: Teleport dash, invisibility post-dash.",
        passive: "Lethality: Critical backstab damage, increased speed."
    },
    [HeroClassType.MARKSMAN]: {
        title: "The Ranger",
        ability: "Disengage: Backwards dash with piercing projectile.",
        passive: "Ballistics: Increased attack range and projectile speed."
    },
    [HeroClassType.MAGE]: {
        title: "The Arcanist",
        ability: "Arcane Blink: Instant displacement with Frost Nova slow.",
        passive: "Chilling Touch: Attacks apply slow debuff."
    },
    [HeroClassType.SUPPORT]: {
        title: "The Guardian",
        ability: "Ether Shift: 2 seconds of pure invulnerability.",
        passive: "Harmony Aura: Continuous HP regeneration."
    }
  };

  const currentHeroType = selected_class.toUpperCase();

  return (
    <div className="fixed inset-0 bg-[#050506] z-50 flex">
      <div className="w-96 border-r border-[#1A1A1B] p-8 flex flex-col overflow-y-auto">
        <h2 className="text-2xl font-bold mb-8 tracking-tighter text-[#00F2FF]">THE FORGE</h2>
        <div className="mb-4 flex justify-between items-end border-b border-[#1A1A1B] pb-4">
             <div>
                <div className="text-[10px] text-[#8E8E93] uppercase">Kills</div>
                <div className="text-xl font-bold">{stats.kills.toLocaleString()}</div>
             </div>
             <div className="text-right">
                <div className="text-[10px] text-[#8E8E93] uppercase">Ops</div>
                <div className="text-xl font-bold">{stats.games_played}</div>
             </div>
        </div>
        <div className="mb-8">
          <label className="text-xs text-[#8E8E93] uppercase tracking-widest block mb-4">Hero Pattern</label>
          <div className="grid grid-cols-1 gap-2">
            {Object.values(HeroClassType).map(hero => (
              <button
                key={hero}
                onClick={() => setGameState({ selected_class: hero.toLowerCase() })}
                className={`group py-3 text-left pl-4 border ${currentHeroType === hero ? 'border-[#00F2FF] bg-[#00F2FF]/5' : 'border-[#1A1A1B] hover:border-[#ffffff20]'} transition-all`}
              >
                <div className={`text-[10px] uppercase tracking-widest ${currentHeroType === hero ? 'text-[#00F2FF]' : 'text-[#8E8E93]'}`}>{hero}</div>
                <div className={`text-xs font-bold ${currentHeroType === hero ? 'text-white' : 'text-[#8E8E93]'}`}>{HERO_DETAILS[hero].title}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-8 p-4 bg-[#1A1A1B]/50 border border-[#1A1A1B] rounded">
             <div className="text-[10px] text-[#00F2FF] uppercase tracking-widest mb-2 italic">Class Intel</div>
             <div className="text-xs text-white mb-2 leading-relaxed font-bold">{HERO_DETAILS[currentHeroType]?.ability}</div>
             <div className="text-xs text-[#8E8E93] leading-relaxed">{HERO_DETAILS[currentHeroType]?.passive}</div>
        </div>
        <div className="mb-8">
          <label className="text-xs text-[#8E8E93] uppercase tracking-widest block mb-4">Aura Hue</label>
          <div className="grid grid-cols-6 gap-2">
            {['#00F2FF', '#FF0043', '#7000FF', '#39FF14', '#FFB800', '#FFFFFF'].map(c => (
              <button
                key={c}
                onClick={() => setGameState({ custom_hex_color: c })}
                className={`w-full aspect-square border-2 ${custom_hex_color === c ? 'border-white' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div className="mt-auto pt-8">
          <button onClick={onClose} className="w-full py-4 bg-[#00F2FF] text-[#050506] font-bold uppercase tracking-widest text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,242,255,0.3)]">Deploy Unit</button>
        </div>
      </div>
      <div className="flex-1 relative">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 4]} />
          <OrbitControls enableZoom={false} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color={custom_hex_color} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}><HumanoidModel color={custom_hex_color} classType={selected_class} /></Float>
          <gridHelper args={[10, 10, '#1A1A1B', '#1A1A1B']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -1]} />
        </Canvas>
        <div className="absolute bottom-8 right-8 text-right pointer-events-none">
            <div className="text-[10px] text-[#8E8E93] uppercase tracking-[0.5em] mb-2 opacity-50">Sync Integrity: Green</div>
            <div className="text-4xl font-black text-white italic opacity-10 tracking-tighter uppercase select-none">{selected_class}</div>
        </div>
      </div>
    </div>
  );
};
