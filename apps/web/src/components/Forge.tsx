'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';
import { HeroClassType } from '@arena-dash/engine';

const CoreShape: React.FC<{ shapeType: string; color: string }> = ({ shapeType, color }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.z += 0.005;
    }
  });

  return (
    <mesh ref={meshRef}>
      {shapeType === HeroClassType.TANK && <boxGeometry args={[1.2, 1.2, 1.2]} />}
      {shapeType === HeroClassType.ASSASSIN && <tetrahedronGeometry args={[1, 0]} />}
      {shapeType === HeroClassType.MARKSMAN && <octahedronGeometry args={[1, 0]} />}
      {(shapeType === HeroClassType.FIGHTER || shapeType === HeroClassType.MAGE || shapeType === HeroClassType.SUPPORT) && <dodecahedronGeometry args={[1, 0]} />}
      <MeshDistortMaterial color={color} speed={2} distort={0.2} radius={1} />
    </mesh>
  );
};

export const Forge: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { selectedClass, customHexColor, setGameState } = useGameStore();

  return (
    <div className="fixed inset-0 bg-[#050506] z-50 flex">
      {/* Sidebar */}
      <div className="w-80 border-r border-[#1A1A1B] p-8 flex flex-col">
        <h2 className="text-2xl font-bold mb-8 tracking-tighter">THE FORGE</h2>

        <div className="mb-8 overflow-y-auto pr-2">
          <label className="text-xs text-[#8E8E93] uppercase tracking-widest block mb-4">Hero Class Selection</label>
          <div className="grid grid-cols-1 gap-2">
            {Object.values(HeroClassType).map(hero => (
              <button
                key={hero}
                onClick={() => setGameState({ selectedClass: hero })}
                className={`py-3 text-left pl-4 text-xs uppercase border ${selectedClass === hero ? 'border-[#00F2FF] text-[#00F2FF]' : 'border-[#1A1A1B] text-[#8E8E93]'} hover:border-[#00F2FF]/50 transition-colors`}
              >
                {hero}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="text-xs text-[#8E8E93] uppercase tracking-widest block mb-4">Core Hue</label>
          <div className="grid grid-cols-4 gap-2">
            {['#00F2FF', '#FF0043', '#7000FF', '#39FF14', '#FFB800', '#FFFFFF'].map(c => (
              <button
                key={c}
                onClick={() => setGameState({ customHexColor: c })}
                className={`w-full aspect-square border-2 ${customHexColor === c ? 'border-white' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="mt-auto">
          <button
            onClick={onClose}
            className="w-full py-4 bg-[#00F2FF] text-[#050506] font-bold uppercase tracking-widest text-sm hover:brightness-110 transition-all"
          >
            Equip & Sync
          </button>
        </div>
      </div>

      {/* 3D Preview */}
      <div className="flex-1 relative">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 4]} />
          <OrbitControls enableZoom={false} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color={customHexColor} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />

          <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <CoreShape shapeType={selectedClass} color={customHexColor} />
          </Float>

          {/* Grid Helper for Cyber Feel */}
          <gridHelper args={[10, 10, '#1A1A1B', '#1A1A1B']} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -1]} />
        </Canvas>

        <div className="absolute bottom-8 right-8 text-right">
            <div className="text-[10px] text-[#8E8E93] uppercase tracking-[0.5em] mb-2">Biometric Alignment: Optimal</div>
            <div className="text-xs text-white max-w-[200px] leading-relaxed opacity-50 uppercase tracking-tighter">
                {selectedClass === HeroClassType.TANK && "Juggernaut Pattern: +50% HP, Damage Reduction."}
                {selectedClass === HeroClassType.ASSASSIN && "Shadow Pattern: Critical Hits, Speed Boost."}
                {selectedClass === HeroClassType.FIGHTER && "Duelist Pattern: Vampiric Melee Strikes."}
                {selectedClass === HeroClassType.MAGE && "Arcanist Pattern: Arcane Blink, Chill Debuffs."}
                {selectedClass === HeroClassType.SUPPORT && "Guardian Pattern: Ethereal Invulnerability, Passive Regen."}
                {selectedClass === HeroClassType.MARKSMAN && "Ranger Pattern: Ranged Disengage, Velocity Boost."}
            </div>
        </div>
      </div>
    </div>
  );
};
