import Phaser from 'phaser';
import { GameEngine, PlayerInput, HeroClassType } from '@arena-dash/engine';
import { useGameStore, gameData } from '../store/useGameStore';

export class GameScene extends Phaser.Scene {
  private engine!: GameEngine;
  private heroSprite!: Phaser.GameObjects.Arc; // Placeholder for humanoid
  private enemyGraphics!: Map<number, Phaser.GameObjects.Graphics>;
  private obstacleGraphics!: Map<number, Phaser.GameObjects.Graphics>;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private dashKey!: Phaser.Input.Keyboard.Key;
  private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
  private heroClass: HeroClassType = HeroClassType.FIGHTER;

  constructor() {
    super('GameScene');
  }

  init(data: { heroClass?: HeroClassType }) {
    this.heroClass = data.heroClass || HeroClassType.FIGHTER;
  }

  create() {
    this.engine = new GameEngine({
        seed: 'test-seed-' + Date.now(),
        isServer: false,
        heroClass: this.heroClass
    });

    // Create hero representation
    this.heroSprite = this.add.circle(400, 300, 20, 0x00F2FF);
    // In a full implementation, we'd use this.add.sprite() and play walk/dash animations

    this.enemyGraphics = new Map();
    this.obstacleGraphics = new Map();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,S,A,D') as { [key: string]: Phaser.Input.Keyboard.Key };
    this.dashKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.cameras.main.setBackgroundColor('#050506');

    // Shader logic placeholder: would use a custom fragment shader to tint grayscale sprites
  }

  update() {
    const input: PlayerInput = {
      frame: this.engine.frame,
      up: this.cursors.up.isDown || this.wasd.W.isDown,
      down: this.cursors.down.isDown || this.wasd.S.isDown,
      left: this.cursors.left.isDown || this.wasd.A.isDown,
      right: this.cursors.right.isDown || this.wasd.D.isDown,
      dash: Phaser.Input.Keyboard.JustDown(this.dashKey) || this.input.activePointer.isDown,
      mousePos: { x: this.input.activePointer.x, y: this.input.activePointer.y }
    };

    const prevHealth = this.engine.hero.health;
    this.engine.update(input);

    // Hit-stop effect
    if (this.engine.hero.health < prevHealth) {
        this.cameras.main.shake(200, 0.005);
        this.game.loop.sleep = true;
        setTimeout(() => { if (this.game) this.game.loop.sleep = false; }, 50);
    }

    // Dash effect
    if (this.engine.hero.isDashing) {
        // Create dash ghost trail
    }

    // Update internal non-reactive state
    gameData.score = this.engine.getScore();
    gameData.health = Math.floor(this.engine.hero.health);
    gameData.maxHealth = this.engine.hero.maxHealth;
    gameData.omega = this.engine.omega;
    gameData.level = this.engine.level;
    gameData.kills = this.engine.kills;
    gameData.isGameOver = this.engine.isGameOver;

    // Trigger reactive update only for major events (like game over)
    if (this.engine.isGameOver && !useGameStore.getState().isGameOver) {
        useGameStore.getState().setGameState({ isGameOver: true });
    }

    this.renderEngine();
  }

  private renderEngine() {
    // Render Hero
    this.heroSprite.setPosition(this.engine.hero.body.position.x, this.engine.hero.body.position.y);
    this.heroSprite.setDepth(this.heroSprite.y); // Depth sorter

    // Render Enemies
    const currentEnemyIds = new Set(this.engine.enemies.map(e => (e as any).id));
    for (const [id, graphics] of this.enemyGraphics.entries()) {
      if (!currentEnemyIds.has(id)) {
        graphics.destroy();
        this.enemyGraphics.delete(id);
      }
    }
    this.engine.enemies.forEach(enemy => {
      let graphics = this.enemyGraphics.get((enemy as any).id);
      if (!graphics) {
        graphics = this.add.graphics();
        this.enemyGraphics.set((enemy as any).id, graphics);
      }
      graphics.clear();
      graphics.fillStyle(0xFF0043, 1);
      const vertices = enemy.vertices;
      graphics.beginPath();
      graphics.moveTo(vertices[0].x, vertices[0].y);
      for (let i = 1; i < vertices.length; i++) graphics.lineTo(vertices[i].x, vertices[i].y);
      graphics.closePath();
      graphics.fillPath();
      graphics.setDepth(enemy.position.y); // Depth sorter
    });

    // Render Obstacles
    this.engine.obstacles.forEach((obstacle, index) => {
        let graphics = this.obstacleGraphics.get(index);
        if (!graphics) {
            graphics = this.add.graphics();
            this.obstacleGraphics.set(index, graphics);
        }
        graphics.clear();
        graphics.fillStyle(0x1A1A1B, 1);
        const vertices = obstacle.vertices;
        graphics.beginPath();
        graphics.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i++) graphics.lineTo(vertices[i].x, vertices[i].y);
        graphics.closePath();
        graphics.fillPath();
        graphics.setDepth(obstacle.position.y); // Depth sorter
    });
  }
}
