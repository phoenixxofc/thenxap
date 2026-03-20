import * as Phaser from 'phaser';

export const HUMANOID_TINT_SHADER = `
precision mediump float;
varying vec2 outTexCoord;
uniform sampler2D uMainSampler;
uniform vec3 uTint;

void main() {
    vec4 texel = texture2D(uMainSampler, outTexCoord);
    // Grayscale luminance
    float luma = dot(texel.rgb, vec3(0.299, 0.587, 0.114));
    // Apply user color to the grayscale base
    gl_FragColor = vec4(luma * uTint, texel.a);
}
`;

export class Humanoid extends Phaser.GameObjects.Container {
    private bodySprite: Phaser.GameObjects.Rectangle;
    private headSprite: Phaser.GameObjects.Arc;

    constructor(scene: Phaser.Scene, x: number, y: number, color: number) {
        super(scene, x, y);

        // Detailed humanoid construction (Placeholder for 16-frame sprites)
        this.bodySprite = scene.add.rectangle(0, 0, 30, 45, 0xffffff);
        this.headSprite = scene.add.circle(0, -25, 12, 0xeeeeee);

        this.add([this.bodySprite, this.headSprite]);
        this.setTint(color);

        scene.add.existing(this);
    }

    setTint(color: number) {
        // Simplified tint for non-shader version, can be expanded to custom pipeline
        this.bodySprite.setFillStyle(color);
    }

    playWalkAnimation(frame: number) {
        // High-fidelity walk cycle simulation (16 frames)
        const cycle = (frame % 16) / 16;
        const bob = Math.sin(cycle * Math.PI * 2) * 5;
        this.bodySprite.setY(bob);
        this.headSprite.setY(-25 + bob * 1.2);
    }
}
