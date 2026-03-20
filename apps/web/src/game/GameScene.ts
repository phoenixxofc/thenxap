import * as Phaser from 'phaser';
import { GameEngine, PlayerInput, HeroClassType, ObstacleType } from '@arena-dash/engine';
import { useGameStore, gameData } from '../store/useGameStore';

const TINT_SHADER = `
precision mediump float;
varying vec2 outTexCoord;
uniform sampler2D uMainSampler;
uniform vec3 uTint;

void main() {
    vec4 texel = texture2D(uMainSampler, outTexCoord);
    // Gray scale intensity
    float intensity = (texel.r + texel.g + texel.b) / 3.0;
    // Apply tint to the grayscale
    gl_FragColor = vec4(intensity * uTint, texel.a);
}
`;

export class GameScene extends Phaser.Scene {
  private engine!: GameEngine;
  private heroContainer!: Phaser.GameObjects.Container;
  private heroSprite!: Phaser.GameObjects.Rectangle; // Placeholder for high-fidelity humanoid
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

    // Create hero representation (Humanoid Placeholder)
    this.heroContainer = this.add.container(400, 300);
    this.heroSprite = this.add.rectangle(0, 0, 30, 50, 0xffffff); // Grayscale body
    const head = this.add.circle(0, -30, 10, 0xdddddd);
    this.heroContainer.add([this.heroSprite, head]);

    // Apply Tint Shader
    const customColor = useGameStore.getState().customHexColor;
    const color = Phaser.Display.Color.HexStringToColor(customColor);
    // Note: In a real shader setup, we'd use a PostFX or custom pipeline.
    // For this demonstration, we'll use Phaser's built-in tinting logic on the container's children.
    this.heroSprite.setTint(color.color);

    this.enemyGraphics = new Map();
    this.obstacleGraphics = new Map();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,S,A,D') as { [key: string]: Phaser.Input.Keyboard.Key };
    this.dashKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.cameras.main.setBackgroundColor('#050506');
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

    // Advanced VFX: Hit-stop & Screenshake
    if (this.engine.hero.health < prevHealth) {
        this.cameras.main.shake(200, 0.005);
        // Hit-stop simulation
        this.game.loop.sleep = true;
        setTimeout(() => { if (this.game) this.game.loop.sleep = false; }, 50);
    }

    // Class specific visual updates
    if (this.engine.hero.isInvisible) {
        this.heroContainer.setAlpha(0.3);
    } else {
        this.heroContainer.setAlpha(1.0);
    }

    // Sync to React State (Optimized)
    gameData.score = this.engine.getScore();
    gameData.health = Math.floor(this.engine.hero.health);
    gameData.maxHealth = this.engine.hero.maxHealth;
    gameData.omega = this.engine.omega;
    gameData.level = this.engine.level;
    gameData.kills = this.engine.kills;
    gameData.isGameOver = this.engine.isGameOver;

    if (this.engine.isGameOver && !useGameStore.getState().isGameOver) {
        useGameStore.getState().setGameState({ isGameOver: true });
    }

    this.renderEngine();
  }

  private renderEngine() {
    // Render Hero with Depth Sorting
    this.heroContainer.setPosition(this.engine.hero.body.position.x, this.engine.hero.body.position.y);
    this.heroContainer.setDepth(this.heroContainer.y);

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
      graphics.setDepth(enemy.position.y);
    });

    // Render Obstacles (Pillars vs Hazards)
    this.engine.obstacles.forEach((obstacle, index) => {
        let graphics = this.obstacleGraphics.get(index);
        if (!graphics) {
            graphics = this.add.graphics();
            this.obstacleGraphics.set(index, graphics);
        }
        graphics.clear();

        const type = (obstacle as any).obstacleType;
        if (type === ObstacleType.HAZARD) {
            graphics.fillStyle(0xFF9500, 0.5); // Orange hazard
            graphics.lineStyle(2, 0xFF9500, 1);
            graphics.strokeRect(obstacle.position.x - 20, obstacle.position.y - 20, 40, 40);
        } else {
            graphics.fillStyle(0x1A1A1B, 1); // Solid pillar
        }

        const vertices = obstacle.vertices;
        graphics.beginPath();
        graphics.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i++) graphics.lineTo(vertices[i].x, vertices[i].y);
        graphics.closePath();
        graphics.fillPath();
        graphics.setDepth(obstacle.position.y);
    });
  }
}
