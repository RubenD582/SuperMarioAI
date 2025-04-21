import Entity from './Entity';

import Koopa1 from '../assets/Sprites/Koopa_Walk1.png';
import Koopa2 from '../assets/Sprites/Koopa_Walk2.png';
import KoopaShell from '../assets/Sprites/Koopa_Shell.png';

export const KoopaFrames  = [Koopa1, Koopa2];
export const KoopaShellFrames = [KoopaShell];

export default class Koopa extends Entity {
  constructor(x, y, collision) {
    super(x, y, 32, 32);

    this.collision = collision;
    this.vx = -40;
    this.vy = 0;

    this.grounded = true;
    this.isDead = false;

    this.gravity = 1000;

    this.keys = { left: false, right: false, up: false, down: false, b: false };

    this.currentAnimation = 'walk';
    this.animations = {};
    this.preloadAnimations();

    this.remove = false;
    this.deathTimer = 0;

    this.killedByFireball = false;
    this.flipY = false;
  }

  preloadAnimations() {
    this.animations.walk  = this.preloadImages(KoopaFrames);
    this.animations.shell  = this.preloadImages(KoopaShellFrames);
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
          this.dead('fireball');
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

  checkCollision(other) {
    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }

  dead(reason = 'jump') {
    if (reason === 'fireball') {
      this.isDead = true;
      this.killedByFireball = true;
      this.flipY = true;
      this.vx = 0;
      this.vy = -300;
      this.deathTimer = 0;
    } else {
      this.currentAnimation = 'shell';
      this.isDead = true;
      this.deathTimer = 0;
      this.vx = 0;
    }
  }

}