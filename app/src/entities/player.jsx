import Entity from './Entity';
import {
  ACC_RUN,
  ACC_WALK,
  DEC_REL,
  DEC_SKID,
  MAX_FALL,
  MAX_RUN,
  MAX_WALK,
  MIN_WALK,
  RUN_FALL,
  RUN_FALL_A,
  SCALE,
  STOP_FALL,
  STOP_FALL_A,
  WALK_FALL,
  WALK_FALL_A
} from "../constants/physicsConstants.jsx";

import MarioSmallIdle from '../assets/Sprites/0/Mario_Small_Idle.png';
import MarioSmallRun1 from '../assets/Sprites/0/Mario_Small_Run1.png';
import MarioSmallRun2 from '../assets/Sprites/0/Mario_Small_Run2.png';
import MarioSmallRun3 from '../assets/Sprites/0/Mario_Small_Run3.png';
import MarioSmallJump from '../assets/Sprites/0/Mario_Small_Jump.png';
import MarioSmallSlide from '../assets/Sprites/0/Mario_Small_Slide.png';
import MarioSmallDeath from '../assets/Sprites/0/Mario_Small_Death.png';

import MarioBigIdle from '../assets/Sprites/0/Mario_Big_Idle.png';
import MarioBigRun1 from '../assets/Sprites/0/Mario_Big_Run1.png';
import MarioBigRun2 from '../assets/Sprites/0/Mario_Big_Run2.png';
import MarioBigRun3 from '../assets/Sprites/0/Mario_Big_Run3.png';
import MarioBigJump from '../assets/Sprites/0/Mario_Big_Jump.png';
import MarioBigSlide from '../assets/Sprites/0/Mario_Big_Slide.png';

import {Mushroom} from "../Blocks/item.jsx";
import {TILE_SIZE} from "../constants/constants.jsx";

export const MarioSmallIdleFrames  = [MarioSmallIdle];
export const MarioSmallRunFrames   = [MarioSmallRun1, MarioSmallRun2, MarioSmallRun3];
export const MarioSmallJumpFrames  = [MarioSmallJump];
export const MarioSmallSlideFrames = [MarioSmallSlide];
export const MarioSmallDeathFrames = [MarioSmallDeath];

export const MarioBigIdleFrames  = [MarioBigIdle];
export const MarioBigRunFrames   = [MarioBigRun1, MarioBigRun2, MarioBigRun3];
export const MarioBigJumpFrames  = [MarioBigJump];
export const MarioBigSlideFrames = [MarioBigSlide];

export default class Player extends Entity {
  constructor(x, y, collision, color = 0) {
    super(x, y, 32, 32);

    this.collision = collision;
    this.y = y;
    this.x = x;

    this.vx = 0;
    this.vy = 0;

    this.grounded = true;
    this.color = color;
    this.isDead = false;
    this.keys = { left: false, right: false, up: false, down: false, b: false };

    this.fallAcceleration = STOP_FALL;

    this.animations = {};
    this.preloadAnimations();

    this.growTimer = 0;
    this.growing = false;
    this.growCount = 0;

    this.big = false;
  }

  preloadAnimations() {
    this.animations.idle  = this.preloadImages(MarioSmallIdleFrames);
    this.animations.run   = this.preloadImages(MarioSmallRunFrames);
    this.animations.jump  = this.preloadImages(MarioSmallJumpFrames);
    this.animations.skid  = this.preloadImages(MarioSmallSlideFrames);
    this.animations.dead  = this.preloadImages(MarioSmallDeathFrames);
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
    super.animate(deltaTime, frames);
  }

  update(delta, entities) {
    if (this.currentAnimation !== 'dead') {
      if (this.growing) {
        this.currentAnimation = 'idle';
        this.y = this.y;

        let bottomY = this.y + this.height;

        if (this.growTimer <= 0) {
          if (this.growCount < 6) {
            // Toggle between small and big idle animations
            if (this.growCount % 2 === 0) {
              this.animations.idle = this.preloadImages(MarioBigIdleFrames);
              this.height = TILE_SIZE * 2; // More consistent to multiply
            } else {
              this.animations.idle = this.preloadImages(MarioSmallIdleFrames);
              this.height = TILE_SIZE;
            }

            // Always position based on the bottom to maintain ground contact
            this.y = bottomY - this.height;

            this.growCount++;
            this.growTimer = 0.09;
          }
        } else {
          this.growTimer -= delta;
        }

        if (this.growCount >= 6) {
          this.growing = false;
          this.height = TILE_SIZE * 2;

          // Ensure final position is correct
          this.y = bottomY - this.height;

          this.animations.idle = this.preloadImages(MarioBigIdleFrames);
          this.animations.run = this.preloadImages(MarioBigRunFrames);
          this.animations.jump = this.preloadImages(MarioBigJumpFrames);
          this.animations.skid = this.preloadImages(MarioBigSlideFrames);

          this.big = true;
        }
      } else {
        const isMoving = Math.abs(this.vx) > 0;

        if (this.grounded) {
          this.currentAnimation = isMoving ? 'run' : 'idle';

          this.handleMovement(delta);

          // Removed duplicate gravity application here

          if (this.keys.up) {
            if (Math.abs(this.vx) < 16) {
              this.vy = -350;
              this.fallAcceleration = STOP_FALL;
            } else if (Math.abs(this.vx) < 40) {
              this.vy = -350;
              this.fallAcceleration = WALK_FALL;
            } else {
              this.vy = -400;
              this.fallAcceleration = RUN_FALL;
            }

            this.currentAnimation = 'jump';
            this.grounded = false;
          }
        } else {
          if (this.vy < 0 && this.keys.up) { // holding A while jumping jumps higher
            if (this.fallAcceleration === STOP_FALL) this.vy -= (STOP_FALL - STOP_FALL_A) * delta;
            if (this.fallAcceleration === WALK_FALL) this.vy -= (WALK_FALL - WALK_FALL_A) * delta;
            if (this.fallAcceleration === RUN_FALL) this.vy -= (RUN_FALL - RUN_FALL_A) * delta;
          }

          if (this.keys.right && !this.keys.left) {
            if (Math.abs(this.vx) > MAX_WALK) {
              this.vx += ACC_RUN * delta;
            } else {
              this.vx += ACC_WALK * delta;
            }
          } else if (this.keys.left && !this.keys.right) {
            if (Math.abs(this.vx) > MAX_WALK) {
              this.vx -= ACC_RUN * delta;
            } else {
              this.vx -= ACC_WALK * delta;
            }
          }
        }

        // Only apply gravity once per update
        this.vy += this.fallAcceleration * delta;
        this.clampVelocity();

        this.x += this.vx * delta * SCALE;
        this.collision.checkHorizontalCollisions(this);

        this.y += this.vy * delta * SCALE;
        this.collision.checkVerticalCollisions(this);

        // Check for player colliding with enemies
        for (const entity of entities) {
          if (
            this.x < entity.x + entity.width &&
            this.x + this.width > entity.x &&
            this.y < entity.y + entity.height &&
            this.y + this.height > entity.y
          ) {
            if (entity instanceof Mushroom) {
              entity.collect();

              if (!this.big) {
                this.grow();
              }
            }
          }
        }

        if (this.vx < 0) this.facing = "left";
        if (this.vx > 0) this.facing = "right";

        this.animate(delta);
      }
    } else {
      this.vy += STOP_FALL_A * delta;
      this.y += this.vy * delta * SCALE; // Added SCALE here too
    }
  }

  handleMovement(delta) {
    if (Math.abs(this.vx) < MIN_WALK) {
      this.vx = 0;
      this.currentAnimation = 'idle';

      if (this.keys.left && !this.keys.down) {
        this.vx -= MIN_WALK;
        this.facing = 'left';
      }
      if (this.keys.right && !this.keys.down) {
        this.vx += MIN_WALK;
        this.facing = 'right';
      }
    } else if (Math.abs(this.vx) >= MIN_WALK) {
      if (this.facing === 'right') {
        if (this.keys.right && !this.keys.left && !this.keys.down) {
          if (this.keys.b) {
            this.vx += ACC_RUN * delta;
          } else {
            this.vx += ACC_WALK * delta;
          }
        } else if (this.keys.left && !this.keys.right && !this.keys.down) {
          this.vx -= DEC_SKID * delta;
          this.currentAnimation = 'skid';

          if (this.vx <= 0) {
            this.vx = 0;
            this.facing = 'left';
          }
        } else {
          this.vx -= DEC_REL * delta;
          if (this.vx < 0) {
            this.vx = 0;
          }
        }
      }

      if (this.facing === 'left') {
        if (this.keys.left && !this.keys.right && !this.keys.down) {
          if (this.keys.b) {
            this.vx -= ACC_RUN * delta;
          } else {
            this.vx -= ACC_WALK * delta;
          }
        } else if (this.keys.right && !this.keys.left && !this.keys.down) {
          this.vx += DEC_SKID * delta;
          this.currentAnimation = 'skid';

          if (this.vx >= 0) {
            this.vx = 0;
            this.facing = 'right';
          }
        } else {
          this.vx += DEC_REL * delta;
          if (this.vx > 0) {
            this.vx = 0;
          }
        }
      }
    }
  }

  clampVelocity() {
    if (this.vy >= MAX_FALL) this.vy = MAX_FALL;
    if (this.vy <= -MAX_FALL) this.vy = -MAX_FALL;
    if (this.vx >= MAX_RUN) this.vx = MAX_RUN;
    if (this.vx <= -MAX_RUN) this.vx = -MAX_RUN;

    // Ensure the player does not exceed walking speed when not running
    if (this.vx >= MAX_WALK && !this.keys.b) this.vx = MAX_WALK;
    if (this.vx <= -MAX_WALK && !this.keys.b) this.vx = -MAX_WALK;
  }

  grow(delta) {
    if (!this.growing) {
      this.growing = true;
      this.growCount = 0;
      this.growTimer = 0;
      this.originalHeight = this.height; // Store the original height
      this.originalY = this.y; // Store the original y position
    }

    if (this.growTimer <= 0) {
      if (this.growCount < 6) {
        // Toggle between small and big idle animations
        if (this.growCount % 2 === 0) {
          // Make Mario grow
          this.animations.idle = this.preloadImages(MarioBigIdleFrames);
          this.height = TILE_SIZE * 1.5; // Increase height to 24
          this.y = this.originalY - TILE_SIZE * 0.5; // Adjust Mario's position upwards
        } else {
          // Make Mario shrink
          this.animations.idle = this.preloadImages(MarioSmallIdleFrames);
          this.height = TILE_SIZE; // Reset height to 16
          this.y = this.originalY + TILE_SIZE * 0.5; // Adjust Mario's position downwards
        }

        this.growCount++;
        this.growTimer = 0.1; // Reset timer for next growth step
      }
    } else {
      this.growTimer -= delta;
    }

    if (this.growCount >= 6) {
      // After 3 full growth steps (6 toggles), finalize the growth
      this.growing = false;
      this.height = TILE_SIZE * 1.5; // Final height of Mario
      this.y = this.originalY - TILE_SIZE * 0.5; // Final Y position after growth

      // Switch animations to Big
      this.animations.idle = this.preloadImages(MarioBigIdleFrames);
      this.animations.run = this.preloadImages(MarioBigRunFrames);
      this.animations.jump = this.preloadImages(MarioBigJumpFrames);
      this.animations.skid = this.preloadImages(MarioBigSlideFrames);

      this.big = true;
    }
  }

  dead() {
    this.currentAnimation = 'dead';
    this.vx = 0;
    this.vy = -0x0400;  // Scale the death kick
    this.isDead = true;
  }
}