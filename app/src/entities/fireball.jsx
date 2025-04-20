import Entity from './Entity';

import Fireball1 from '../assets/Sprites/Fireball1.png';
import Fireball2 from '../assets/Sprites/Fireball2.png';
import Fireball3 from '../assets/Sprites/Fireball3.png';
import Fireball4 from '../assets/Sprites/Fireball4.png';

import Explotion1 from '../assets/Sprites/Explode1.png';
import Explotion2 from '../assets/Sprites/Explode2.png';
import Explotion3 from '../assets/Sprites/Explode3.png';

export const FireballFrames   = [Fireball1, Fireball2, Fireball3, Fireball4];
export const ExplodeFrames = [Explotion1, Explotion2, Explotion3]

import { TILE_SIZE } from '../constants/constants.jsx';
import {blocks} from "../screens/game.jsx";

export default class Fireball extends Entity {
  constructor(x, y, direction, collision) {
    super(x, y, TILE_SIZE * 0.5, TILE_SIZE * 0.5);

    this.vx = direction === 'right' ? 360 : -360;
    this.vy = 500;
    this.gravity = 1000;
    this.bouncePower = -200;
    this.maxBounces = 4;
    this.bounces = 0;
    this.collision = collision;

    this.explode = false;
    this.grounded = false;

    this.currentAnimation = "throw";
    this.animations = {};
    this.preloadAnimations();

    this.frameIndex = 0;
    this.frameTime = 0;
    this.frameDuration = 0.2;
    this.animationRepeat = 0;

    this.remove = false;
  }

  preloadAnimations() {
    this.animations.throw   = this.preloadImages(FireballFrames);
    this.animations.explode = this.preloadImages(ExplodeFrames);
  }

  preloadImages(srcArray) {
    return srcArray.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
  }

  animate(deltaTime) {
    this.currentFrames = this.getCurrentAnimationFrames();
    this.currentFrame = this.currentFrame ?? 0;

    super.animate?.(deltaTime, this.explode ? 0.1 : 0.1);

    this.frameIndex = this.currentFrame;

    if (this.currentAnimation === "explode") {
      console.log(this.frameTime);
    }

    if (
      this.frameTime >= 0.09 &&
      this.explode
    ) {
      this.animationRepeat += 1;

      if (this.animationRepeat >= 5)
      {
        this.animationRepeat = 0;
        this.remove = true;
      }

      this.frameIndex = 0;
    }
  }

  getCurrentAnimationFrames() {
    return this.animations[this.currentAnimation] || this.animations.idle;
  }

  update(deltaTime) {
    if (!this.explode) {
      this.vy += this.gravity * deltaTime;

      this.x += this.vx * deltaTime;
      const horizontalCollision = this.collision.checkHorizontalCollisions(this);

      // Store the collision type to use for explosion orientation
      if (horizontalCollision) {
        this.collisionDirection = this.vx > 0 ? 'right' : 'left';
        this.explode = true;
      }

      const wasGrounded = this.grounded;

      this.y += this.vy * deltaTime;
      const verticalCollision = this.collision.checkVerticalCollisions(this);

      if (verticalCollision && !this.grounded) {
        this.collisionDirection = 'bottom';
      }

      if (!wasGrounded && this.grounded && this.bounces < this.maxBounces) {
        this.vy = this.bouncePower;
        this.bounces++;
      }

      if (this.bounces >= this.maxBounces || this.y > blocks.length * TILE_SIZE) {
        this.explode = true;
        this.collisionDirection = 'max-bounce';
      }

      if (this.explode) {
        this.vy = 0;
        this.vx = 0;

        this.currentAnimation = "explode";
        this.height = TILE_SIZE;
        this.width = TILE_SIZE;

        this.currentFrame = 0;
      }
    }

    this.animate(deltaTime);
  }

  draw(ctx) {
    const frames = this.getCurrentAnimationFrames();
    const frame = frames[this.frameIndex];

    if (!frame) return;

    // Normal drawing without flipping
    if (!this.explode || this.collisionDirection === 'max-bounce' || this.collisionDirection === 'bottom') {
      ctx.drawImage(frame, this.x, this.y, this.width, this.height);
    }
    // Flip the explosion horizontally when hitting side walls
    else if (this.collisionDirection === 'left' || this.collisionDirection === 'right') {
      ctx.save();
      ctx.translate(this.x + this.width, this.y);
      ctx.scale(-1, 1);
      ctx.drawImage(frame, 0, 0, this.width, this.height);
      ctx.restore();
    }
  }
}
