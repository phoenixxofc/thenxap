import * as Phaser from 'phaser';

export class Humanoid extends Phaser.GameObjects.Container {
    private bodyPart: Phaser.GameObjects.Rectangle;
    private headPart: Phaser.GameObjects.Arc;
    private armL: Phaser.GameObjects.Rectangle;
    private armR: Phaser.GameObjects.Rectangle;
    private legL: Phaser.GameObjects.Rectangle;
    private legR: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene, x: number, y: number, color: number) {
        super(scene, x, y);

        this.legL = scene.add.rectangle(-8, 15, 8, 15, 0x333333);
        this.legR = scene.add.rectangle(8, 15, 8, 15, 0x333333);
        this.bodyPart = scene.add.rectangle(0, 0, 24, 35, 0xffffff);
        this.armL = scene.add.rectangle(-16, -5, 8, 20, 0xeeeeee);
        this.armR = scene.add.rectangle(16, -5, 8, 20, 0xeeeeee);
        this.headPart = scene.add.circle(0, -25, 10, 0xdddddd);

        this.add([this.legL, this.legR, this.bodyPart, this.armL, this.armR, this.headPart]);
        this.setTint(color);

        scene.add.existing(this);
    }

    setTint(color: number) {
        this.bodyPart.setFillStyle(color);
        this.armL.setFillStyle(color, 0.8);
        this.armR.setFillStyle(color, 0.8);
    }

    playWalkAnimation(frame: number) {
        const cycle = (frame % 16) / 16;
        const angle = Math.sin(cycle * Math.PI * 2) * 30;

        this.legL.setAngle(angle);
        this.legR.setAngle(-angle);
        this.armL.setAngle(-angle * 0.8);
        this.armR.setAngle(angle * 0.8);

        const bob = Math.abs(Math.sin(cycle * Math.PI * 2)) * 3;
        this.bodyPart.setY(-bob);
        this.headPart.setY(-25 - bob);
    }
}
