import Entity from './Entity';

import Koopa1 from '../assets/Sprites/Koopa_Walk1.png';
import Koopa2 from '../assets/Sprites/Koopa_Walk2.png';
import Shell from "./shell.jsx";
import Fireball from "./fireball.jsx";

export const KoopaFrames  = [Koopa1, Koopa2];

export default class Koopa extends Entity {
  constructor(x, y, collision, addItemCallback) {
    super(x, y, 32, 32);

    this.addItemCallback = addItemCallback;
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

    this.killedByFireball = false;
    this.flipY = false;
  }

  preloadAnimations() {
    this.animations.walk  = this.preloadImages(KoopaFrames);
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
          if (!entity.explode && this.checkCollision(entity)) {

            if (entity instanceof Fireball) {
              entity.explode = true;
              this.dead(entity);
            }
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
    if (object instanceof Fireball) {
      this.isDead = true;
      this.killedByFireball = true;
      this.flipY = true;
      this.vx = 0;
      this.vy = -300;
    } else {
      this.addItemCallback(new Shell(
        this.x,
        this.y,
        this.collision,
      ));

      this.remove = true;
      this.isDead = true;
      this.vx = 0;
    }
  }

}