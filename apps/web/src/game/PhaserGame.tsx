'use client';

import React, { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { GameScene } from './GameScene';
import { HeroClassType } from '@arena-dash/engine';

interface PhaserGameProps {
  selectedClass: HeroClassType;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ selectedClass }) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && gameContainerRef.current && !gameRef.current) {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: gameContainerRef.current,
        scene: [GameScene],
        physics: {
          default: 'arcade',
          arcade: { debug: false }
        },
        backgroundColor: '#050506',
      };

      gameRef.current = new Phaser.Game(config);

      // Start scene with selected class
      gameRef.current.scene.start('GameScene', { heroClass: selectedClass });
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [selectedClass]);

  return <div ref={gameContainerRef} className="rounded-lg overflow-hidden border-2 border-[#1A1A1B] shadow-[0_0_20px_rgba(0,242,255,0.2)]" />;
};
