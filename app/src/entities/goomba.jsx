import Entity from './Entity';
import Shell from './Shell';

import Goomba1 from '../assets/Sprites/Goomba_Walk1.png';
import Goomba2 from '../assets/Sprites/Goomba_Walk2.png';
import GoombaFlat from '../assets/Sprites/Goomba_Flat.png';
import Fireball from "./fireball.jsx";

export const GoombaFrames  = [Goomba1, Goomba2];
export const GoombaFlatFrames = [GoombaFlat];

export default class Goomba extends Entity {
  constructor(x, y, collision) {
    super(x, y, 32, 32);

    this.collision = collision;
    this.vx = -50;
    this.vy = 0;

    this.grounded = true;
    this.isDead = false;

    this.gravity = 1000;

    this.keys = { left: false, right: false, up: false, down: false, b: false };

    this.direction = 'left';

    this.currentAnimation = 'walk';
    this.animations = {};
    this.preloadAnimations();

    this.remove = false;
    this.deathTimer = 0;

    this.killedByFireball = false;
    this.flipY = false;
  }

  preloadAnimations() {
    this.animations.walk  = this.preloadImages(GoombaFrames);
    this.animations.flat  = this.preloadImages(GoombaFlatFrames);
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

  update(delta, entities) {
    if (this.start) {
      if (!this.isDead) {
        this.vy += this.gravity * delta;
        this.y += this.vy * delta;
        this.x += this.vx * delta;

        this.collision.checkHorizontalCollisions(this);
        this.collision.checkVerticalCollisions(this);

        entities.forEach(entity => {
          if (this.checkCollision(entity)) {
            if (entity instanceof Fireball) {
              entity.explode = true;
              this.dead(entity);
            } else if (entity instanceof Shell) {
              this.dead(entity);
            }
          }
        });

      } else {
        if (this.killedByFireball) {
          // Let it fall freely without collisions
          this.y += this.vy * delta;
          this.vy += this.gravity * delta;

          if (this.y > 1000) this.remove = true;

        } else {
          this.deathTimer += delta * 1000;
          if (this.deathTimer >= 250) {
            this.remove = true;
          }
        }
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

  dead(object) {
    if (object instanceof Fireball || object instanceof Shell) {
      this.isDead = true;
      this.killedByFireball = true;
      this.flipY = true;
      this.vx = 0;
      this.vy = -300;
      this.deathTimer = 0;
    } else {
      this.currentAnimation = 'flat';
      this.isDead = true;
      this.deathTimer = 0;
      this.vx = 0;
    }
  }

}