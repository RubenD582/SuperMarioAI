import Entity from './Entity';
import Shell from './Shell';
import Player from './Player';

import Goomba1 from '../assets/Sprites/Goomba_Walk1.png';
import Goomba2 from '../assets/Sprites/Goomba_Walk2.png';
import GoombaFlat from '../assets/Sprites/Goomba_Flat.png';

import GoombaUnderground1 from '../assets/Sprites/Goomba_Walk_underground1.png';
import GoombaUnderground2 from '../assets/Sprites/Goomba_Walk_underground2.png';
import GoombaFlatUnderground from '../assets/Sprites/Goomba_Flat_underground.png';

import Fireball from "./fireball.jsx";
import {mapType, scores} from "../screens/game.jsx";
import Score from "../utils/score.jsx";

export let GoombaFrames  = [Goomba1, Goomba2];
export let GoombaFlatFrames = [GoombaFlat];

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
    this.remove = false;
    this.deathTimer = 0;
    this.animateFlip = false;
    this.flipY = false;
    if (mapType === 'underground') {
      GoombaFrames  = [GoombaUnderground1, GoombaUnderground2];
      GoombaFlatFrames = [GoombaFlatUnderground];
    }
    this.score = 100;
    this.preloadAnimations();
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
        // Initialize collision cooldown if it doesn't exist
        if (this.collisionCooldown === undefined) {
          this.collisionCooldown = 0;
        }

        // Decrease cooldown timer if it's active
        if (this.collisionCooldown > 0) {
          this.collisionCooldown -= delta;
        }

        this.vy += this.gravity * delta;
        this.y += this.vy * delta;
        this.x += this.vx * delta;

        this.collision.checkHorizontalCollisions(this);
        this.collision.checkVerticalCollisions(this);

        entities.forEach(entity => {
          if (entity === this) return;

          if (this.checkCollision(entity) && this.collisionCooldown <= 0) {
            this.collisionCooldown = 0.5;

            // Determine which side of the collision occurred to push appropriately
            const overlapX = Math.min(
              this.x + this.width - entity.x,
              entity.x + entity.width - this.x
            );

            if (this.x < entity.x) {
              this.x -= overlapX / 2;
              this.collision.checkHorizontalCollisions(this);
            } else {
              this.x += overlapX / 2;
              this.collision.checkHorizontalCollisions(this);
            }

            // Reverse direction
            this.vx = -this.vx;

            // Handle special collision cases
            if (entity instanceof Fireball) {
              entity.explode = true;
              this.dead(entity);
            } else if (
              entity instanceof Shell &&
              Math.abs(entity.vx) > 0 &&
              !entity.hasOwnProperty('explode')
            ) {
              this.dead(entity);
            }
          }
        });

        if (this.vx < 0) this.facing = "right";
        if (this.vx > 0) this.facing = "left";
      } else {
        // If the Goomba is dead, check the timer
        if (this.animateFlip) {
          this.y += this.vy * delta;
          this.vy += this.gravity * delta;

          // If the Goomba falls too far, remove it
          if (this.y > 1000) {
            this.remove = true;
          }
        }

        if (!this.animateFlip) {
          if (this.deathTimer < 0.1) {
            this.deathTimer += delta;
          } else {
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
    if (object instanceof Fireball || object instanceof Shell || (object instanceof Player && object.starmanMode)) {
      this.isDead = true;
      this.animateFlip = true;
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

    scores.push(new Score(this.x + this.width / 2, this.y, this.score));
  }
}