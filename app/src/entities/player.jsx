import Entity from './Entity';
import Fireball from './fireball.jsx';
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
import MarioBigCrouch from '../assets/Sprites/0/Mario_Big_Crouch.png';

import MarioFireIdle from '../assets/Sprites/0/Mario_Fire_Idle.png';
import MarioFireRun1 from '../assets/Sprites/0/Mario_Fire_Run1.png';
import MarioFireRun2 from '../assets/Sprites/0/Mario_Fire_Run2.png';
import MarioFireRun3 from '../assets/Sprites/0/Mario_Fire_Run3.png';
import MarioFireJump from '../assets/Sprites/0/Mario_Fire_Jump.png';
import MarioFireSlide from '../assets/Sprites/0/Mario_Fire_Slide.png';
import MarioFireCrouch from '../assets/Sprites/0/Mario_Fire_Crouch.png';
import MarioFireThrow from '../assets/Sprites/0/Mario_Fire_Throw.png';

import {Flower, Mushroom, Starman} from "../Blocks/item.jsx";
import {TILE_SIZE} from "../constants/constants.jsx";
import Goomba from "./goomba.jsx";
import Koopa from "./koopa.jsx";
import Shell from "./shell.jsx";

export const MarioSmallIdleFrames  = [MarioSmallIdle];
export const MarioSmallRunFrames   = [MarioSmallRun1, MarioSmallRun2, MarioSmallRun3];
export const MarioSmallJumpFrames  = [MarioSmallJump];
export const MarioSmallSlideFrames = [MarioSmallSlide];
export const MarioSmallDeathFrames = [MarioSmallDeath];

export const MarioBigIdleFrames   = [MarioBigIdle];
export const MarioBigRunFrames    = [MarioBigRun1, MarioBigRun2, MarioBigRun3];
export const MarioBigJumpFrames   = [MarioBigJump];
export const MarioBigSlideFrames  = [MarioBigSlide];
export const MarioBigCrouchFrames = [MarioBigCrouch];

export const MarioFireIdleFrames   = [MarioFireIdle];
export const MarioFireRunFrames    = [MarioFireRun1, MarioFireRun2, MarioFireRun3];
export const MarioFireJumpFrames   = [MarioFireJump];
export const MarioFireSlideFrames  = [MarioFireSlide];
export const MarioFireCrouchFrames = [MarioFireCrouch];
export const MarioFireThrowFrames = [MarioFireThrow];

export default class Player extends Entity {
  constructor(x, y, collision, addItemCallback, color = 0) {
    super(x, y, TILE_SIZE, TILE_SIZE);

    this.addItemCallback = addItemCallback;
    this.collision = collision;

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

    this.isFireMario = false;
    this.isBigMario = false;

    this.isInvincible = false;
    this.invincibilityTimer = 0;
    this.invincibilityDuration = 2000;
    this.visibilityToggle = true;
    this.flashInterval = 50;
    this.lastFlashTime = 0;
    this.starmanMode = false;

    this.prevY = this.y;
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

    const duration = this.map(Math.abs(this.vx), 0, MAX_WALK, 0.3, 0.15)
    super.animate(deltaTime, duration);
  }

  update(delta, entities) {
    this.prevY = this.y;
    this.prevX = this.x;

    if (this.currentAnimation !== 'dead') {
      if (this.isInvincible) {
        // Convert delta to milliseconds if it's in seconds
        const deltaMs = delta * 1000;

        this.invincibilityTimer += deltaMs;
        this.lastFlashTime += deltaMs;

        // Flash effect - toggle visibility every flashInterval ms
        if (this.lastFlashTime >= this.flashInterval) {
          this.visibilityToggle = !this.visibilityToggle;
          this.lastFlashTime = 0;
        }

        // End invincibility after duration
        if (this.invincibilityTimer >= this.invincibilityDuration) {
          this.isInvincible = false;
          this.visibilityToggle = true; // Ensure player is visible
        }
      }

      if (this.keys.down && this.isBigMario && this.grounded) {
        this.animations.crouch = this.preloadImages(this.isFireMario ? MarioFireCrouchFrames : MarioBigCrouchFrames);
        this.currentAnimation = 'crouch';
        this.vx = 0;

        return;
      }

      if (this.growing) {
        this.currentAnimation = 'idle';

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

          this.y = bottomY - this.height;

          this.animations.idle = this.preloadImages(MarioBigIdleFrames);
          this.animations.run = this.preloadImages(MarioBigRunFrames);
          this.animations.jump = this.preloadImages(MarioBigJumpFrames);
          this.animations.skid = this.preloadImages(MarioBigSlideFrames);
          this.animations.crouch = this.preloadImages(MarioBigCrouchFrames);

          this.isBigMario = true;
        }
      } else {
        const isMoving = Math.abs(this.vx) > 0;

        if (this.grounded) {
          this.currentAnimation = isMoving ? 'run' : 'idle';

          this.handleMovement(delta);

          // Removed duplicate gravity application here

          if (this.keys.up) {
            if (Math.abs(this.vx) < 50) {
              this.vy = -260;
              this.fallAcceleration = STOP_FALL;
            } else if (Math.abs(this.vx) < 100) {
              this.vy = -270;
              this.fallAcceleration = WALK_FALL;
            } else {
              this.vy = -290;
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

        if (this.vx < 0) this.facing = "left";
        if (this.vx > 0) this.facing = "right";

        if (this.keys.b && this.isFireMario) {
          this.animations.throw = this.preloadImages(MarioFireThrowFrames);
          this.currentAnimation = 'throw';

          this.shootFireball(this.keys.b);
        }

        this.entityCollision(entities);

        this.animate(delta);
      }
    } else {
      this.vy += STOP_FALL_A * delta;
      this.y += this.vy * delta * SCALE; // Added SCALE here too
    }
  }

  shootFireball() {
    const now = performance.now();

    // Reset fireball count if cooldown passed
    if (!this.lastFireTime || now - this.lastFireTime > 1000) {
      this.shotsFired = 0;
      this.lastFireTime = now;
    }

    // Allow only two shots max in the 1s window, spaced by at least 500ms
    if (this.shotsFired < 2 && (!this.lastShotTime || now - this.lastShotTime >= 500)) {
      this._spawnFireball();
      this.lastShotTime = now;
      this.shotsFired++;

      if (this.shotsFired === 2) {
        setTimeout(() => {
          this.shotsFired = 0;
          this.lastFireTime = 0;
        }, 1000);
      }
    }
  }

  _spawnFireball() {
    const fireballX = this.facing === 'right'
      ? this.x + this.width
      : this.x - TILE_SIZE * 0.6;

    const fireballY = this.y + this.height * 0.1;

    const fireball = new Fireball(fireballX, fireballY, this.facing, this.collision, this.vx);
    this.addItemCallback(fireball);
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

  entityCollision(entities) {
    // Check for player colliding with enemies
    for (const entity of entities) {
      // Basic collision detection
      if (
        this.x < entity.x + entity.width &&
        this.x + this.width > entity.x &&
        this.y < entity.y + entity.height &&
        this.y + this.height > entity.y
      ) {
        const playerBottom = this.y + this.height;
        const entityTop = entity.y;

        const wasAboveEntity = this.prevY + this.height <= entity.y + 5;

        const isMovingDownward = this.vy > 0;

        const isTouchingTop = playerBottom >= entityTop && playerBottom <= entityTop + 15;

        const isSuccessfulTopHit = wasAboveEntity && isMovingDownward && isTouchingTop;

        if (entity instanceof Starman) {
          this.starmanMode = false;
          entity.isCollected = true;
        }

        if (entity instanceof Shell) {
          if (entity.vx === 0) {
            entity.shoot(this.facing);
            this.vy = -175;
          } else if (Math.abs(entity.vx) > 0) {
            if (isSuccessfulTopHit) {
              this.vy = -175;
              break;
            } else {
              if (this.isBigMario) {
                this.shrink();
              } else {
                if (!this.isInvincible) {
                  this.dead();
                }
              }
            }
          }
        }

        if ((entity instanceof Goomba || entity instanceof Koopa) && !entity.isDead) {
          if (isSuccessfulTopHit) {
            entity.dead(this);
            this.vy = -200;

            if (entity instanceof Koopa) this.vx *= 1.1;
            break;
          } else if (!entity.isDead) {
            if (this.isBigMario) {
              this.shrink();
            } else {
              if (!this.isInvincible) {
                this.dead();
              }
            }
          }
        }

        if (entity instanceof Mushroom) {
          entity.collect();

          if (!this.isBigMario) {
            this.grow();
          }
        }

        if (entity instanceof Flower) {
          entity.collect();

          if (this.isBigMario) {
            this.isFireMario = true;

            this.animations.idle   = this.preloadImages(MarioFireIdleFrames);
            this.animations.run    = this.preloadImages(MarioFireRunFrames);
            this.animations.jump   = this.preloadImages(MarioFireJumpFrames);
            this.animations.skid   = this.preloadImages(MarioFireSlideFrames);
            this.animations.crouch = this.preloadImages(MarioFireCrouchFrames);
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
      this.growthStage = 0;
      this.growthTimer = 0;
      this.originalY = this.y;

      // Define growth stages
      this.growthStages = [
        { isBig: false, duration: 0.5 },  // Small (initial state)
        { isBig: true,  duration: 0.5 },   // Big (first flash)
        { isBig: false, duration: 0.5 },  // Small (flash back)
        { isBig: true,  duration: 0.5 },   // Big (second flash)
        { isBig: false, duration: 0.5 },  // Small (flash back)
        { isBig: true,  duration: 0.5 }    // Big (final state)
      ];
    }

    // Update growth timer
    this.growthTimer -= delta;

    // Time to move to the next growth stage
    if (this.growthTimer <= 0 && this.growthStage < this.growthStages.length) {
      // Get current stage configuration
      const stage = this.growthStages[this.growthStage];

      // Apply the appropriate size for this stage
      if (stage.isBig) {
        // Make Mario big
        this.animations.idle = this.preloadImages(MarioBigIdleFrames);
        this.height = TILE_SIZE * 1.5;
        this.y = this.originalY - TILE_SIZE * 0.5;
      } else {
        // Make Mario small
        this.animations.idle = this.preloadImages(MarioSmallIdleFrames);
        this.height = TILE_SIZE;
        this.y = this.originalY;
      }

      // Set the timer for this stage
      this.growthTimer = stage.duration;

      // Move to the next stage
      this.growthStage++;

      // Check if growth animation has completed
      if (this.growthStage >= this.growthStages.length) {
        this.finishGrowth();
      }
    }
  }

  finishGrowth() {
    // Ensure Mario ends in the big state
    this.growing = false;
    this.height = TILE_SIZE * 1.5;
    this.y = this.originalY - TILE_SIZE * 0.5;

    // Set all animations to big Mario versions
    this.animations.idle = this.preloadImages(MarioBigIdleFrames);
    this.animations.run = this.preloadImages(MarioBigRunFrames);
    this.animations.jump = this.preloadImages(MarioBigJumpFrames);
    this.animations.skid = this.preloadImages(MarioBigSlideFrames);

    this.isBigMario = true;
  }

  shrink() {
    if (this.isInvincible) return;

    this.growing = false;
    this.growthStage = 0;
    this.growthTimer = 0;

    this.isBigMario = false;

    this.isInvincible = true;
    this.invincibilityTimer = 0;
    this.visibilityToggle = true;
    this.lastFlashTime = 0;

    this.animations.idle = this.preloadImages(MarioSmallIdleFrames);
    this.animations.run  = this.preloadImages(MarioSmallRunFrames);
    this.animations.jump = this.preloadImages(MarioSmallJumpFrames);
    this.animations.skid = this.preloadImages(MarioSmallSlideFrames);

    this.height = TILE_SIZE;

    this.originalY = this.y;
  }

  dead() {
    this.currentAnimation = 'dead';
    this.vx = 0;
    this.vy = -200;

    this.isDead = true;
  }
}