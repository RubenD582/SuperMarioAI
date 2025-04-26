import Entity from './Entity';

import KoopaShell from '../assets/Sprites/Koopa_Shell_Green.png';
import KoopaShellUnderground from '../assets/Sprites/Koopa_Shell_underground.png';
import {mapType} from "../screens/game.jsx";

export let ShellFrames  = [KoopaShell];

export default class Shell extends Entity {
  constructor(x, y, collision) {
    super(x, y, 32, 32);

    this.speed = 450;
    this.collision = collision;
    this.vx = 0;
    this.vy = 0;

    this.grounded = true;
    this.isDead = false;

    this.gravity = 1000;

    this.keys = { left: false, right: false, up: false, down: false, b: false };

    this.currentAnimation = 'shell';
    this.animations = {};

    this.remove = false;

    this.killedByFireball = false;
    this.flipY = false;

    if (mapType === 'underground') {
      ShellFrames = [KoopaShellUnderground];
    }
    this.preloadAnimations();
  }

  preloadAnimations() {
    this.animations.shell  = this.preloadImages(ShellFrames);
  }

  preloadImages(srcArray) {
    return srcArray.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
  }

  getCurrentAnimationFrames() {
    return this.animations[this.currentAnimation] || this.animations.idle;
  }

  animate(deltaTime) {
    const frames = this.getCurrentAnimationFrames();
    this.setAnimationFrames(frames);

    super.animate(deltaTime, 0.1);
  }

  update(delta, fireballs) {
    if (!this.isDead) {
      this.vy += this.gravity * delta;
      this.y += this.vy * delta;
      this.x += this.vx * delta;

      this.collision.checkHorizontalCollisions(this);
      this.collision.checkVerticalCollisions(this);

      fireballs.forEach(fireball => {
        if (!fireball.explode && this.checkCollision(fireball)) {
          fireball.explode = true;
          this.dead = true;
        }
      });

      if (this.vx < 0) this.facing = "right";
      if (this.vx > 0) this.facing = "left";
    } else {
      if (this.killedByFireball) {
        this.y += this.vy * delta;
        this.vy += this.gravity * delta;

        if (this.y > 1000) this.remove = true;
      }
    }
  }

  shoot(direction) {
    this.vx = direction === 'left' ? this.vx = -this.speed : this.vx = this.speed;
  }

  checkCollision(other) {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }

  dead() {
    this.remove = true;
  }
}