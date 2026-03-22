import Matter from 'matter-js';

export interface GameConfig {
  seed: string;
  isServer: boolean;
  baseDifficulty?: number;
  heroClass?: HeroClassType;
}

export interface PlayerInput {
  frame: number;
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  dash: boolean;
  mousePos: { x: number; y: number };
}

export enum EnemyType {
  SWARMER = 'SWARMER',
  SENTINEL = 'SENTINEL',
  SEEKER = 'SEEKER',
  SNIPER = 'SNIPER',
  PULSAR = 'PULSAR'
}

export enum HeroClassType {
  TANK = 'TANK',
  FIGHTER = 'FIGHTER',
  ASSASSIN = 'ASSASSIN',
  MARKSMAN = 'MARKSMAN',
  MAGE = 'MAGE',
  SUPPORT = 'SUPPORT'
}

export enum ObstacleType {
    PILLAR = 'PILLAR',
    HAZARD = 'HAZARD'
}

// Seeded PRNG
class PRNG {
  private seed: number;
  constructor(seed: string) {
    this.seed = this.hashString(seed);
  }
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
  public next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) | 0;
    return (this.seed >>> 0) / 4294967296;
  }
}

export abstract class BaseHero {
  public body: Matter.Body;
  public health: number = 100;
  public maxHealth: number = 100;
  public dashCooldown: number = 60;
  public dashDuration: number = 24;
  public moveSpeed: number = 0.002;
  public lastDashFrame: number = -100;
  public isDashing: boolean = false;
  public isInvisible: boolean = false;
  public type: HeroClassType;

  constructor(x: number, y: number, type: HeroClassType) {
    this.type = type;
    this.body = Matter.Bodies.circle(x, y, 20, {
      label: 'player',
      frictionAir: 0.1,
      restitution: 0.2,
      inertia: Infinity
    });
    this.applyPassives();
  }

  abstract applyPassives(): void;
  abstract onDash(input: PlayerInput, frame: number): void;
  abstract update(frame: number): void;
}

export class TankHero extends BaseHero {
  constructor(x: number, y: number) { super(x, y, HeroClassType.TANK); }
  applyPassives() {
    this.maxHealth = 150;
    this.health = 150;
  }
  onDash(input: PlayerInput, frame: number) {
    const dashVector = Matter.Vector.sub(input.mousePos, this.body.position);
    const dashDirection = Matter.Vector.normalise(dashVector);
    const dashImpulse = Matter.Vector.mult(dashDirection, 0.08);
    this.body.frictionAir = 0;
    Matter.Body.applyForce(this.body, this.body.position, dashImpulse);
  }
  update(frame: number) {}
}

export class FighterHero extends BaseHero {
  constructor(x: number, y: number) { super(x, y, HeroClassType.FIGHTER); }
  applyPassives() {}
  onDash(input: PlayerInput, frame: number) {
    const dashVector = Matter.Vector.sub(input.mousePos, this.body.position);
    const dashDirection = Matter.Vector.normalise(dashVector);
    const dashImpulse = Matter.Vector.mult(dashDirection, 0.05);
    this.body.frictionAir = 0;
    Matter.Body.applyForce(this.body, this.body.position, dashImpulse);
  }
  update(frame: number) {}
}

export class AssassinHero extends BaseHero {
  private invisibilityEndFrame: number = -1;
  constructor(x: number, y: number) { super(x, y, HeroClassType.ASSASSIN); }
  applyPassives() {
    this.moveSpeed = 0.0024;
  }
  onDash(input: PlayerInput, frame: number) {
    const dashVector = Matter.Vector.sub(input.mousePos, this.body.position);
    const dashDirection = Matter.Vector.normalise(dashVector);
    const dashImpulse = Matter.Vector.mult(dashDirection, 0.1);
    this.body.frictionAir = 0;
    Matter.Body.applyForce(this.body, this.body.position, dashImpulse);
    this.invisibilityEndFrame = frame + this.dashDuration + 30;
  }
  update(frame: number) {
      this.isInvisible = frame < this.invisibilityEndFrame;
  }
}

export class MarksmanHero extends BaseHero {
  constructor(x: number, y: number) { super(x, y, HeroClassType.MARKSMAN); }
  applyPassives() {}
  onDash(input: PlayerInput, frame: number) {
    const dashVector = Matter.Vector.sub(this.body.position, input.mousePos);
    const dashDirection = Matter.Vector.normalise(dashVector);
    const dashImpulse = Matter.Vector.mult(dashDirection, 0.05);
    this.body.frictionAir = 0;
    Matter.Body.applyForce(this.body, this.body.position, dashImpulse);
  }
  update(frame: number) {}
}

export class MageHero extends BaseHero {
  constructor(x: number, y: number) { super(x, y, HeroClassType.MAGE); }
  applyPassives() {}
  onDash(input: PlayerInput, frame: number) {
    const dashVector = Matter.Vector.sub(input.mousePos, this.body.position);
    const dashDirection = Matter.Vector.normalise(dashVector);
    Matter.Body.setPosition(this.body, Matter.Vector.add(this.body.position, Matter.Vector.mult(dashDirection, 150)));
  }
  update(frame: number) {}
}

export class SupportHero extends BaseHero {
  private invulnerabilityEndFrame: number = -1;
  constructor(x: number, y: number) { super(x, y, HeroClassType.SUPPORT); }
  applyPassives() {}
  onDash(input: PlayerInput, frame: number) {
    const dashVector = Matter.Vector.sub(input.mousePos, this.body.position);
    const dashDirection = Matter.Vector.normalise(dashVector);
    const dashImpulse = Matter.Vector.mult(dashDirection, 0.05);
    this.body.frictionAir = 0;
    Matter.Body.applyForce(this.body, this.body.position, dashImpulse);
    this.invulnerabilityEndFrame = frame + 120;
  }
  update(frame: number) {
    if (frame % 120 === 0) {
      this.health = Math.min(this.maxHealth, this.health + this.maxHealth * 0.03);
    }
  }
  public isInvulnerable(frame: number): boolean {
      return frame < this.invulnerabilityEndFrame;
  }
}

export class GameEngine {
  public world: Matter.World;
  public engine: Matter.Engine;
  public hero: BaseHero;
  public enemies: Matter.Body[] = [];
  public obstacles: Matter.Body[] = [];
  public frame: number = 0;
  public score: number = 0;
  public kills: number = 0;
  public level: number = 1;
  public isGameOver: boolean = false;
  public isLevelUpPending: boolean = false;
  public omega: number = 1;

  private config: GameConfig;
  private prng: PRNG;
  private inputLog: PlayerInput[] = [];

  constructor(config: GameConfig) {
    this.config = config;
    this.prng = new PRNG(config.seed);
    this.engine = Matter.Engine.create({
      enableSleeping: false,
      gravity: { x: 0, y: 0 }
    });
    this.world = this.engine.world;

    const heroClass = config.heroClass || HeroClassType.FIGHTER;
    switch (heroClass) {
      case HeroClassType.TANK: this.hero = new TankHero(400, 300); break;
      case HeroClassType.ASSASSIN: this.hero = new AssassinHero(400, 300); break;
      case HeroClassType.MARKSMAN: this.hero = new MarksmanHero(400, 300); break;
      case HeroClassType.MAGE: this.hero = new MageHero(400, 300); break;
      case HeroClassType.SUPPORT: this.hero = new SupportHero(400, 300); break;
      default: this.hero = new FighterHero(400, 300); break;
    }
    Matter.World.add(this.world, this.hero.body);

    const thickness = 100;
    const width = 800;
    const height = 600;
    const walls = [
      Matter.Bodies.rectangle(width / 2, -thickness / 2, width + thickness * 2, thickness, { isStatic: true, label: 'wall' }),
      Matter.Bodies.rectangle(width / 2, height + thickness / 2, width + thickness * 2, thickness, { isStatic: true, label: 'wall' }),
      Matter.Bodies.rectangle(-thickness / 2, height / 2, thickness, height + thickness * 2, { isStatic: true, label: 'wall' }),
      Matter.Bodies.rectangle(width + thickness / 2, height / 2, thickness, height + thickness * 2, { isStatic: true, label: 'wall' })
    ];
    Matter.World.add(this.world, walls);

    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        this.handleCollision(pair.bodyA, pair.bodyB);
      });
    });

    this.generateObstacles();
  }

  private generateObstacles() {
    const density = this.level >= 10 ? 8 : (this.level >= 4 ? 4 : 0);
    for (let i = 0; i < density; i++) {
      const x = 100 + this.prng.next() * 600;
      const y = 100 + this.prng.next() * 400;
      const type = this.prng.next() > 0.7 ? ObstacleType.HAZARD : ObstacleType.PILLAR;
      const obstacle = Matter.Bodies.rectangle(x, y, 40, 40, {
          isStatic: true,
          label: 'obstacle',
          isSensor: type === ObstacleType.HAZARD
      });
      (obstacle as any).obstacleType = type;
      this.obstacles.push(obstacle);
      Matter.World.add(this.world, obstacle);
    }
  }

  public update(input: PlayerInput) {
    if (this.isGameOver) return;

    this.frame++;
    this.inputLog.push({ ...input, frame: this.frame });

    this.handleMovement(input);
    this.handleDash(input);
    this.hero.update(this.frame);
    this.updateEnemies();
    this.spawnEnemies();
    this.handleHazards();

    Matter.Engine.update(this.engine, 1000 / 60);

    this.updateEntropy();
    this.checkLevelUp();

    if (this.hero.health <= 0) {
      this.isGameOver = true;
    }
  }

  private handleMovement(input: PlayerInput) {
    if (this.hero.isDashing) return;

    const FP_STEP = 1000;
    const force = { x: 0, y: 0 };
    if (input.up) force.y -= Math.floor(this.hero.moveSpeed * FP_STEP) / FP_STEP;
    if (input.down) force.y += Math.floor(this.hero.moveSpeed * FP_STEP) / FP_STEP;
    if (input.left) force.x -= Math.floor(this.hero.moveSpeed * FP_STEP) / FP_STEP;
    if (input.right) force.x += Math.floor(this.hero.moveSpeed * FP_STEP) / FP_STEP;

    Matter.Body.applyForce(this.hero.body, this.hero.body.position, force);
  }

  private handleDash(input: PlayerInput) {
    const canDash = this.frame - this.hero.lastDashFrame > this.hero.dashCooldown;

    if (input.dash && canDash && !this.hero.isDashing) {
      this.hero.isDashing = true;
      this.hero.lastDashFrame = this.frame;
      this.hero.onDash(input, this.frame);
    }

    if (this.hero.isDashing && this.frame - this.hero.lastDashFrame > this.hero.dashDuration) {
      this.hero.isDashing = false;
      this.hero.body.frictionAir = 0.1;
    }
  }

  private spawnEnemies() {
    const healthPercent = this.hero.health / this.hero.maxHealth;
    let spawnMultiplier = 1;
    if (healthPercent > 0.8) spawnMultiplier = 1.5;
    if (healthPercent < 0.2) spawnMultiplier = 0.5;

    const baseSpawnRate = 120;
    const k = 0.5;
    const t = this.frame / 60;
    const spawnInterval = Math.max(15, Math.floor((baseSpawnRate - k * t) / spawnMultiplier));

    if (this.frame % spawnInterval === 0) {
      const type = this.getRandomEnemyType();
      this.createEnemy(type);
    }
  }

  private getRandomEnemyType(): EnemyType {
    const types = [EnemyType.SWARMER, EnemyType.SENTINEL, EnemyType.SEEKER, EnemyType.SNIPER, EnemyType.PULSAR];
    return types[Math.floor(this.prng.next() * types.length)];
  }

  private createEnemy(type: EnemyType) {
    const width = 800;
    const height = 600;
    let x, y;

    if (this.prng.next() > 0.5) {
      x = this.prng.next() > 0.5 ? -20 : width + 20;
      y = this.prng.next() * height;
    } else {
      x = this.prng.next() * width;
      y = this.prng.next() > 0.5 ? -20 : height + 20;
    }

    let enemy;
    if (type === EnemyType.SWARMER) {
      enemy = Matter.Bodies.polygon(x, y, 3, 15, { label: 'enemy', frictionAir: 0.05 });
    } else if (type === EnemyType.SENTINEL) {
      enemy = Matter.Bodies.rectangle(x, y, 30, 30, { label: 'enemy', isStatic: true });
    } else {
      enemy = Matter.Bodies.circle(x, y, 15, { label: 'enemy', frictionAir: 0.03 });
    }

    (enemy as any).id = this.frame + this.prng.next();
    (enemy as any).enemyType = type;
    (enemy as any).health = 1;

    this.enemies.push(enemy);
    Matter.World.add(this.world, enemy);
  }

  private updateEnemies() {
    // Director AI: Increase enemy speed in "Escape" scenarios (Health < 20%)
    const healthPercent = this.hero.health / this.hero.maxHealth;
    const speedMultiplier = healthPercent < 0.2 ? 1.5 : 1.0;

    this.enemies.forEach(enemy => {
      const type = (enemy as any).enemyType;
      const target = this.hero.body.position;

      if (type === EnemyType.SWARMER || type === EnemyType.SEEKER) {
        const forceMagnitude = type === EnemyType.SWARMER ? 0.0005 : 0.0003;
        const vector = Matter.Vector.sub(target, enemy.position);
        const direction = Matter.Vector.normalise(vector);
        const force = Matter.Vector.mult(direction, forceMagnitude * this.omega * speedMultiplier);
        Matter.Body.applyForce(enemy, enemy.position, force);
      }
    });
  }

  private handleCollision(bodyA: Matter.Body, bodyB: Matter.Body) {
    const labels = [bodyA.label, bodyB.label];

    if (labels.includes('player') && labels.includes('enemy')) {
      const enemy = bodyA.label === 'enemy' ? bodyA : bodyB;

      if (this.hero.type === HeroClassType.SUPPORT && (this.hero as SupportHero).isInvulnerable(this.frame)) {
          return;
      }

      if (this.hero.isDashing) {
        let damageMultiplier = 1;
        if (this.hero.type === HeroClassType.TANK) {
            damageMultiplier = 2.0;
            const force = Matter.Vector.mult(Matter.Vector.normalise(Matter.Vector.sub(enemy.position, this.hero.body.position)), 0.05);
            Matter.Body.applyForce(enemy, enemy.position, force);
        }
        if (this.hero.type === HeroClassType.ASSASSIN) {
            damageMultiplier = 4.0;
        }
        this.killEnemy(enemy, damageMultiplier);
      } else {
        let damage = 10;
        if (this.hero.type === HeroClassType.TANK) damage *= 0.85;
        this.hero.health -= damage;
      }
    }
  }

  private handleHazards() {
      if (this.hero.type === HeroClassType.SUPPORT && (this.hero as SupportHero).isInvulnerable(this.frame)) {
          return;
      }
      this.obstacles.forEach(obstacle => {
          if ((obstacle as any).obstacleType === ObstacleType.HAZARD) {
              const distance = Matter.Vector.magnitude(Matter.Vector.sub(this.hero.body.position, obstacle.position));
              if (distance < 40) {
                  this.hero.health -= 0.1;
              }
          }
      });
  }

  private killEnemy(enemy: Matter.Body, multiplier: number = 1) {
    Matter.World.remove(this.world, enemy);
    this.enemies = this.enemies.filter(e => e !== enemy);
    this.score += Math.floor(25 * multiplier);
    this.kills++;

    if (this.hero.type === HeroClassType.FIGHTER) {
      this.hero.health = Math.min(this.hero.maxHealth, this.hero.health + this.hero.maxHealth * 0.1);
    }
  }

  private updateEntropy() {
    const t = this.frame / 60;
    this.omega = 1 + 2 * Math.log(1 + 0.2 * t) + (this.level - 1) * 0.5;
  }

  private checkLevelUp() {
    const threshold = 15 + this.level * 5;
    if (this.kills >= threshold) {
      this.level++;
      this.kills = 0;
      this.isLevelUpPending = true;
      this.obstacles.forEach(o => Matter.World.remove(this.world, o));
      this.obstacles = [];
      this.generateObstacles();
    }
  }

  public getScore(): number {
    return Math.floor(this.score + (this.frame / 60) * 10);
  }

  public getInputLog(): PlayerInput[] {
    return this.inputLog;
  }

  public acknowledgeLevelUp() {
      this.isLevelUpPending = false;
  }
}
