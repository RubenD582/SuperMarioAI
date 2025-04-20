import Entity from './Entity';

import Goomba1 from '../assets/Sprites/Goomba_Walk1.png';
import Goomba2 from '../assets/Sprites/Goomba_Walk2.png';
import GoombaFlat from '../assets/Sprites/Goomba_Flat.png';

export const GoombaFrames  = [Goomba1, Goomba2];
export const GoombaFlatFrames = [GoombaFlat];

export default class Goomba extends Entity {
  constructor(x, y, collision) {
    super(x, y, 32, 32);

    this.collision = collision;
    this.vx = -75;
    this.vy = 0;

    this.grounded = true;
    this.isDead = false;

    this.keys = { left: false, right: false, up: false, down: false, b: false };

    this.currentAnimation = 'walk';
    this.animations = {};
    this.preloadAnimations();
  }

  preloadAnimations() {
    this.animations.walk  = this.preloadImages(GoombaFrames);
    this.animations.flat   = this.preloadImages(GoombaFlatFrames);
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

  update(delta) {
    this.vy += this.gravity * delta;
    this.x += this.vx * delta;

    this.collision.checkHorizontalCollisions(this);
    this.collision.checkVerticalCollisions(this);
  }

  dead() {
    this.isDead = true;
  }
}