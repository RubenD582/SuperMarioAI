import PipeTop from "../Blocks/pipeTop.jsx";

const DEBUG_MODE = false;

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
import {TILE_SIZE} from "../constants/constants.jsx";
import {Flower, Mushroom, Starman} from "../Blocks/item.jsx";
import Goomba from "./goomba.jsx";
import Koopa from "./koopa.jsx";
import Shell from "./shell.jsx";
import PiranhaPlant from "./piranhaPlant.jsx";
import {setLevel} from "../utils/levelManager.jsx";
import Flagpole from "./flagpole.jsx";
import {mapWidth, scores} from "../screens/game.jsx";
import Score from "../utils/score.jsx";
import Flag from "./flag.jsx";

// Dynamic import of all sprite assets
const spriteImports = import.meta.glob('../assets/Sprites/0/*.png', { eager: true });

const starmanSpriteImports = {
  green: import.meta.glob('../assets/Sprites/0/starman/0/*.png', { eager: true }),
  red: import.meta.glob('../assets/Sprites/0/starman/1/*.png', { eager: true }),
  black: import.meta.glob('../assets/Sprites/0/starman/2/*.png', { eager: true }),
};

// Helper to get the actual image path from the import
const getSprite = (name) => {
  const key = Object.keys(spriteImports).find(path => path.includes(name));
  return key ? spriteImports[key].default : null;
};

const getStarmanSprite = (color, name) => {
  const spriteImports = starmanSpriteImports[color];
  const key = Object.keys(spriteImports).find(path => path.includes(name));
  return key ? spriteImports[key].default : null;
};

// Organize sprites by state and type
export const MarioSmallIdleFrames  = [getSprite('Mario_Small_Idle')];
export const MarioSmallRunFrames   = [getSprite('Mario_Small_Run1'), getSprite('Mario_Small_Run2'), getSprite('Mario_Small_Run3')];
export const MarioSmallJumpFrames  = [getSprite('Mario_Small_Jump')];
export const MarioSmallSlideFrames = [getSprite('Mario_Small_Slide')];
export const MarioSmallDeathFrames = [getSprite('Mario_Small_Death')];
export const MarioSmallClimbFrames = [getSprite('Mario_Small_Climb1'), getSprite('Mario_Small_Climb2')];

export const MarioBigIdleFrames   = [getSprite('Mario_Big_Idle')];
export const MarioBigRunFrames    = [getSprite('Mario_Big_Run1'), getSprite('Mario_Big_Run2'), getSprite('Mario_Big_Run3')];
export const MarioBigJumpFrames   = [getSprite('Mario_Big_Jump')];
export const MarioBigSlideFrames  = [getSprite('Mario_Big_Slide')];
export const MarioBigCrouchFrames = [getSprite('Mario_Big_Crouch')];
export const MarioBigClimbFrames = [getSprite('Mario_Big_Climb1'), getSprite('Mario_Big_Climb2')];

export const MarioFireIdleFrames   = [getSprite('Mario_Fire_Idle')];
export const MarioFireRunFrames    = [getSprite('Mario_Fire_Run1'), getSprite('Mario_Fire_Run2'), getSprite('Mario_Fire_Run3')];
export const MarioFireJumpFrames   = [getSprite('Mario_Fire_Jump')];
export const MarioFireSlideFrames  = [getSprite('Mario_Fire_Slide')];
export const MarioFireCrouchFrames = [getSprite('Mario_Fire_Crouch')];
export const MarioFireThrowFrames  = [getSprite('Mario_Fire_Throw')];
export const MarioFireClimbFrames = [getSprite('Mario_Fire_Climb1'), getSprite('Mario_Fire_Climb2')];

export default class Player extends Entity {
  constructor(x, y, collision, addItemCallback, color = 0) {
    super(x, y, TILE_SIZE, TILE_SIZE, TILE_SIZE, 2);

    this.heightTolerance = 5;
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
    this.starmanCycleTimer = 0;
    this.starmanColorIndex = 0;
    this.starmanCycleDuration = 500;
    this.starmanTotalDuration = 10000;
    this.starmanTimer = 0;

    this.maxJumpVelocity = -155;

    this.prevY = this.y;

    this.inPipeAnimation = false;
    this.pipeDirection = null;
    this.pipeTargetLevel = null;
    this.pipeTargetX = null;
    this.pipeTargetY = null;
    this.pipeAnimationSpeed = 30;

    this.finishedLevel = false;
    let flagPoints = 0;

    if (DEBUG_MODE) {
      this.activateStarman();
      this.starmanTotalDuration = Math.infinity;
    }
  }

  preloadAnimations() {
    this.animations.idle  = this.preloadImages(MarioSmallIdleFrames);
    this.animations.run   = this.preloadImages(MarioSmallRunFrames);
    this.animations.jump  = this.preloadImages(MarioSmallJumpFrames);
    this.animations.skid  = this.preloadImages(MarioSmallSlideFrames);
    this.animations.dead  = this.preloadImages(MarioSmallDeathFrames);
    this.animations.climb  = this.preloadImages(MarioSmallClimbFrames);
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

    // Modify animation speed based on movement speed, but maintain consistent timing during starman mode
    let clampedSpeed = Math.min(Math.abs(this.vx), MAX_WALK);
    let duration = this.map(clampedSpeed, 0, MAX_RUN, 0.3, 0.1);

    // Call the parent Entity animation method
    super.animate(deltaTime, duration);
  }

  update(delta, entities) {
    this.prevY = this.y;
    this.prevX = this.x;

    if (this.currentAnimation !== 'dead') {
      if (this.finishedLevel) {
        this.currentAnimation = 'climb';
        this.vx = 0;

        const flag = entities.filter((entity) => entity instanceof Flag);

        const isFlagOnGround = this.collision.checkVerticalCollisions(flag[0], entities);
        const isMarioOnGround = this.collision.checkVerticalCollisions(this, entities);

        if (!isMarioOnGround) this.y += 300 * delta;

        if (!isFlagOnGround) {
          flag[0].y += 300 * delta;
        } else {
          if (!flag[0].showedScore) {
            scores.push(new Score(this.x + this.width / 2, this.y, this.flagPoints));
            flag[0].showedScore = true;
          }

          this.currentAnimation = 'run';
          this.x += 100 * delta;

          if (this.x >= mapWidth - TILE_SIZE * 7) {
            this.dead();
          }
        }

        return;
      }

      if (this.inPipeAnimation) {
        // Check if we're in the delay period
        if (this.pipeTransitionDelay > 0) {
          this.pipeTransitionDelay -= delta;
          return; // Skip the rest of the update
        }

        this.handlePipeAnimation(delta);
        return;
      }

      // Update starman timer if active
      if (this.starmanMode) {
        this.updateStarmanMode(delta);
      }

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
              this.height = TILE_SIZE * 2 - this.heightTolerance; // More consistent to multiply
              super.setImageHeight(this.height);
            } else {
              this.animations.idle = this.preloadImages(MarioSmallIdleFrames);
              this.height = TILE_SIZE - this.heightTolerance;
              super.setImageHeight(this.height);
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
          this.height = TILE_SIZE * 2 - this.heightTolerance;
          super.setImageHeight(this.height);

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

          // Jump initialization when on the ground
          if (this.keys.up) {
            // Initial jump - just give minimum jump velocity
            this.vy = this.map(this.vx, 0, MAX_RUN, -160, -135);

            this.jumpHoldTime = 0; // Initialize jump hold time
            this.currentAnimation = 'jump';
            this.grounded = false;
          }
        } else {
          if (this.vy < 0 && this.keys.up) {
            this.jumpHoldTime += delta;

            // and still holding jump within the allowed window (0.3 seconds)
            if (this.jumpHoldTime < 0.3 && this.vy > this.maxJumpVelocity) {
              // Apply additional upward velocity while the button is held
              if (this.fallAcceleration === STOP_FALL) this.vy -= 600 * delta;
              if (this.fallAcceleration === WALK_FALL) this.vy -= 700 * delta;
              if (this.fallAcceleration === RUN_FALL) this.vy -= 800 * delta;

              // Cap at max velocity
              if (this.vy < this.maxJumpVelocity) {
                this.vy = this.maxJumpVelocity;
              }
            }

            // Apply reduced gravity when holding jump button
            if (this.fallAcceleration === STOP_FALL) this.vy += (STOP_FALL_A) * delta;
            else if (this.fallAcceleration === WALK_FALL) this.vy += (WALK_FALL_A) * delta;
            else if (this.fallAcceleration === RUN_FALL) this.vy += (RUN_FALL_A) * delta;
          } else {
            // Apply normal gravity when not holding jump or during descent
            this.vy += this.fallAcceleration * delta;
          }

          // Air control
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

        // Apply gravity and clamp velocity
        this.clampVelocity();

        // Update position
        this.x += this.vx * delta * SCALE;
        this.collision.checkHorizontalCollisions(this);

        this.y += this.vy * delta * SCALE;
        this.collision.checkVerticalCollisions(this, entities);

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
      this.y += this.vy * delta * SCALE;
    }
  }

  updateStarmanMode(delta) {
    // Update total starman timer
    this.starmanTimer += delta * 1000;

    // Check if starman power has expired
    if (this.starmanTimer >= this.starmanTotalDuration) {
      this.deactivateStarman();
      return;
    }

    // Update color cycle timer
    this.starmanCycleTimer += delta * 1000;

    // Only change colors at appropriate intervals
    if (this.starmanCycleTimer >= this.starmanCycleDuration) {
      this.starmanCycleTimer = 0;
      this.cycleStarmanColor();
    }
  }

  cycleStarmanColor() {
    this.starmanColorIndex = (this.starmanColorIndex + 1) % 3;

    const color = this.starmanColorIndex === 0 ? "green" :
      this.starmanColorIndex === 1 ? "red" : "black";

    // Save current animation state so we can restore it
    const currentAnimation = this.currentAnimation;
    const currentFrameIndex = this.frameIndex;
    const currentFrameTime = this.frameTime;

    // Update all sprite sheets with new color while maintaining Mario's state
    this.updateSpritesToStarman(color);

    // Restore animation state
    this.currentAnimation = currentAnimation;
    this.frameIndex = currentFrameIndex;
    this.frameTime = currentFrameTime;
  }

  updateSpritesToStarman(color) {
    // Determine correct path name based on Mario's state
    let pathName = "Mario_Small";
    if (this.isBigMario) {
      pathName = this.isFireMario ? "Mario_Fire" : "Mario_Big";
    }

    // Update all animations with the new color
    this.animations.idle = this.preloadImages([
      getStarmanSprite(color, `${pathName}_Idle`)
    ]);

    this.animations.run = this.preloadImages([
      getStarmanSprite(color, `${pathName}_Run1`),
      getStarmanSprite(color, `${pathName}_Run2`),
      getStarmanSprite(color, `${pathName}_Run3`)
    ]);

    this.animations.jump = this.preloadImages([
      getStarmanSprite(color, `${pathName}_Jump`)
    ]);

    this.animations.skid = this.preloadImages([
      getStarmanSprite(color, `${pathName}_Slide`)
    ]);

    // Add crouch animation if big Mario
    this.animations.crouch = this.preloadImages([
      getStarmanSprite(color, `${pathName}_Crouch`)
    ]);

    // Add throw animation if fire Mario
    if (this.isFireMario) {
      this.animations.throw = this.preloadImages([
        getStarmanSprite(color, `${pathName}_Throw`)
      ]);
    }
  }

  activateStarman() {
    this.starmanMode = true;
    this.starmanCycleTimer = 0;
    this.starmanColorIndex = 0;
    this.starmanTimer = 0;

    // Immediately set the first starman color
    this.cycleStarmanColor();
  }

  deactivateStarman() {
    this.starmanMode = false;
    this.isInvincible = false; // Remove invincibility
    this.visibilityToggle = true;

    // Restore normal sprites based on current state
    if (this.isFireMario) {
      this.animations.idle   = this.preloadImages(MarioFireIdleFrames);
      this.animations.run    = this.preloadImages(MarioFireRunFrames);
      this.animations.jump   = this.preloadImages(MarioFireJumpFrames);
      this.animations.skid   = this.preloadImages(MarioFireSlideFrames);
      this.animations.crouch = this.preloadImages(MarioFireCrouchFrames);
      this.animations.throw  = this.preloadImages(MarioFireThrowFrames);
      this.animations.climb  = this.preloadImages(MarioFireClimbFrames);
    } else if (this.isBigMario) {
      this.animations.idle   = this.preloadImages(MarioBigIdleFrames);
      this.animations.run    = this.preloadImages(MarioBigRunFrames);
      this.animations.jump   = this.preloadImages(MarioBigJumpFrames);
      this.animations.skid   = this.preloadImages(MarioBigSlideFrames);
      this.animations.crouch = this.preloadImages(MarioBigCrouchFrames);
      this.animations.climb  = this.preloadImages(MarioBigClimbFrames);
    } else {
      this.animations.idle   = this.preloadImages(MarioSmallIdleFrames);
      this.animations.run    = this.preloadImages(MarioSmallRunFrames);
      this.animations.jump   = this.preloadImages(MarioSmallJumpFrames);
      this.animations.skid   = this.preloadImages(MarioSmallSlideFrames);
      this.animations.climb  = this.preloadImages(MarioSmallClimbFrames);
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
      this.spawnFireball();
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

  spawnFireball() {
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
    const stompedEnemies = [];

    for (const entity of entities) {
      if (this.isCollidingWith(entity)) console.log(`test`)
      if (entity === this || entity.remove || !this.isCollidingWith(entity)) continue;

      // Handle stomping first (priority)
      if (this.isStompingEntity(entity)) {
        this.handleStomp(entity, stompedEnemies);
        continue;
      }

      if (this.handleItemCollection(entity)) continue;

      this.handleEnemyCollision(entity);
    }

    if (stompedEnemies.length > 0) {
      this.vy = -200; // Bounce after stomp
      for (const enemy of stompedEnemies) {
        if (enemy instanceof Goomba) {
          enemy.dead(this);
        }
      }
    }
  }

  isCollidingWith(entity) {
    const toleranceTop = entity.toleranceTop || 0;
    const toleranceRight = entity.toleranceRight || 0;
    const toleranceBottom = entity.toleranceBottom || 0;
    const toleranceLeft = entity.toleranceLeft || 0;

    return (
      this.x + toleranceLeft < entity.x + entity.width &&
      this.x + this.width - toleranceRight > entity.x &&
      this.y + toleranceTop < entity.y + entity.height &&
      this.y + this.height - toleranceBottom > entity.y
    );
  }

  isStompingEntity(entity) {
    const playerBottom = this.y + this.height;
    const entityTop = entity.y;
    const wasAboveEntity = this.prevY + this.height <= entity.y + 5;
    const isMovingDownward = this.vy > 0;
    const isTouchingTop = playerBottom >= entityTop && playerBottom <= entityTop + 15;

    return wasAboveEntity && isMovingDownward && isTouchingTop &&
      this.x < entity.x + entity.width && this.x + this.width > entity.x;
  }

  handleStomp(entity, stompedEnemies) {
    if (entity instanceof Goomba && !entity.isDead) {
      stompedEnemies.push(entity);
      return true;
    }

    if (entity instanceof Koopa && !entity.isDead) {
      entity.handleShellDeath();
      this.vy = -200;
      return true;
    }

    if (entity instanceof Shell) {
      if (entity.vx === 0) {
        entity.shoot(this.facing);
      } else {
        entity.stop();
      }
      this.vy = -200;
      return true;
    }

    return false;
  }

  handleItemCollection(entity) {
    if (entity instanceof Flagpole) {
      const poleTop = entity.y;
      const poleBottom = entity.y + entity.height;
      const touchY = this.y;

      const relativeTouch = (touchY - poleTop) / entity.height;

      if (relativeTouch <= 0.1) {
        this.flagPoints = 5000; // top 10% - highest score
      } else if (relativeTouch <= 0.3) {
        this.flagPoints = 2000; // top 30%
      } else if (relativeTouch <= 0.5) {
        this.flagPoints = 800; // top 50%
      } else if (relativeTouch <= 0.7) {
        this.flagPoints = 400;
      } else {
        this.flagPoints = 100; // bottom part
      }

      this.finishedLevel = true;
    }

    if (entity instanceof Starman) {
      this.activateStarman();
      entity.isCollected = true;
      return true;
    }

    if (entity instanceof Mushroom) {
      entity.collect();
      if (!this.isBigMario) this.grow();
      return true;
    }

    if (entity instanceof Flower) {
      entity.collect();
      if (this.isBigMario) {
        this.isFireMario = true;
        this.updateFireMarioAnimations();
      }
      return true;
    }

    return false;
  }

  updateFireMarioAnimations() {
    this.animations.idle   = this.preloadImages(MarioFireIdleFrames);
    this.animations.run    = this.preloadImages(MarioFireRunFrames);
    this.animations.jump   = this.preloadImages(MarioFireJumpFrames);
    this.animations.skid   = this.preloadImages(MarioFireSlideFrames);
    this.animations.crouch = this.preloadImages(MarioFireCrouchFrames);
  }

  handleEnemyCollision(entity) {
    if (entity instanceof PiranhaPlant) {
      if (entity.isDisabled) return;

      this.handleEnemyDamage(entity);
      return;
    }

    if (entity instanceof Shell) {
      if (Math.abs(entity.vx) > 0) {
        this.handleEnemyDamage(entity);
        return;
      } else {
        entity.shoot(this.facing);
      }
    }

    if (entity instanceof Goomba && !entity.isDead) {
      this.handleEnemyDamage(entity);
      return;
    }

    if (entity instanceof Koopa) {
      if (entity.isDead) return;

      if (this.starmanMode) {
        entity.dead(this);
      } else if (this.isBigMario) {
        this.shrink();
      } else if (!this.isInvincible) {
        this.dead();
      }
    }
  }

  handleEnemyDamage(entity) {
    if (this.starmanMode) {
      if (entity instanceof Goomba) {
        entity.dead(this);
      } else {
        entity.dead?.();
      }
    } else if (this.isBigMario) {
      this.shrink();
    } else if (!this.isInvincible) {
      this.dead();
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
        this.height = TILE_SIZE * 1.5 - this.heightTolerance;
        super.setImageHeight(this.height);
        this.y = this.originalY - TILE_SIZE * 0.5;
      } else {
        // Make Mario small
        this.animations.idle = this.preloadImages(MarioSmallIdleFrames);
        this.height = TILE_SIZE - this.heightTolerance;
        super.setImageHeight(this.height);
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
    this.height = TILE_SIZE * 1.5 - this.heightTolerance;
    super.setImageHeight(this.height);
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
    this.animations.climb = this.preloadImages(MarioSmallClimbFrames);

    this.height = TILE_SIZE - this.heightTolerance;
    super.setImageHeight(this.height);
    this.originalY = this.y;
  }

  startPipeAnimation(direction, targetLevel, targetX, targetY) {
    this.inPipeAnimation = true;
    this.pipeDirection = direction;
    this.pipeTargetLevel = targetLevel;
    this.pipeTargetX = targetX * TILE_SIZE - TILE_SIZE / 2;
    this.pipeTargetY = (targetY - 1) * TILE_SIZE;

    // Store the original position for animation reference
    this.pipeStartX = this.x;
    this.pipeStartY = this.y;

    // Reset velocities
    this.vx = 0;
    this.vy = 0;
  }

  handlePipeAnimation(delta) {
    const moveAmount = this.pipeAnimationSpeed * delta * SCALE;

    if (this.pipeDirection === 'down') {
      // Move Mario down into the pipe
      this.y += moveAmount;

      // Calculate when Mario should be fully inside the pipe
      const fullyInsideY = this.pipeStartY + this.height;

      // Check if Mario is fully inside the pipe
      if (this.y > fullyInsideY) {
        this.completePipeTransition();
      }
    }
    else if (this.pipeDirection === 'right') {
      // Move Mario right into the pipe
      this.x += moveAmount;

      // Check if Mario is fully inside the pipe
      if (this.x > this.pipeStartX + this.width) {
        this.completePipeTransition();
      }
    }
  }

  completePipeTransition() {
    this.inPipeAnimation = false;

    setLevel(this.pipeTargetLevel);

    this.x = this.pipeTargetX;
    this.y = this.pipeTargetY;

    this.facing = 'right';
  }

  dead() {
    this.currentAnimation = 'dead';
    this.vx = 0;
    this.vy = -200;

    this.isDead = true;
  }

  map(x, low1, high1, low2, high2) {
    return low2 + ((x - low1) * (high2 - low2)) / (high1 - low1);
  }

}