import Entity from './Entity';
import KoopaShellGreen from '../assets/Sprites/Koopa_Shell_Green.png';
import KoopaShellRed from '../assets/Sprites/Koopa_Shell_Red.png';
import KoopaShellUnderground from '../assets/Sprites/Koopa_Shell_underground.png';
import { mapType } from "../screens/game.jsx";

export let ShellFrames = [KoopaShellGreen];

export default class Shell extends Entity {
  constructor(x, y, collision, isRed) {
    super(x, y, 32, 32);

    this.speed = 450;
    this.collision = collision;
    this.vx = 0;
    this.vy = 0;

    this.grounded = true;
    this.isDead = false;
    this.gravity = 1000;

    this.currentAnimation = 'shell';
    this.animations = {};

    this.remove = false;
    this.killedByFireballFlag = false; // Renamed to avoid conflict with the method
    this.flipY = false;
    this.spawnCooldown = 0.15;  // Immunity period after spawning
    this.active = false;  // Initially inactive to prevent immediate collisions

    // Track elapsed time since spawning
    this.elapsedTime = 0;

    if (mapType === 'underground') {
      ShellFrames = [KoopaShellUnderground];
    }

    if (isRed) {
      ShellFrames = [KoopaShellRed];
    }

    this.preloadAnimations();
  }

  preloadAnimations() {
    this.animations.shell = this.preloadImages(ShellFrames);
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
    // Track elapsed time
    this.elapsedTime += delta;

    // Handle spawn cooldown
    if (this.spawnCooldown > 0) {
      this.spawnCooldown -= delta;
      if (this.spawnCooldown <= 0) {
        this.active = true;  // Shell becomes active after cooldown
      }
    }

    if (!this.isDead) {
      this.vy += this.gravity * delta;
      this.y += this.vy * delta;
      this.x += this.vx * delta;

      this.collision.checkHorizontalCollisions(this);
      this.collision.checkVerticalCollisions(this);

      // Only check for fireball collisions if entities is an array
      if (Array.isArray(entities)) {
        entities.forEach(entity => {
          if (entity.constructor.name === "Fireball" && !entity.explode && this.checkCollision(entity)) {
            entity.explode = true;
            this.markAsKilledByFireball();
          }
        });
      }

      if (this.vx < 0) this.facing = "right";
      if (this.vx > 0) this.facing = "left";
    } else {
      if (this.killedByFireballFlag) {
        this.y += this.vy * delta;
        this.vy += this.gravity * delta;

        if (this.y > 1000) this.remove = true;
      }
    }
  }

  shoot(direction) {
    if (this.isDead) return;
    this.vx = direction === 'left' ? -this.speed : this.speed;
  }

  stop() {
    this.vx = 0;
  }

  checkCollision(other) {
    // Don't collide if we're in cooldown period
    if (!this.active) return false;

    return (
      this.x < other.x + other.width &&
      this.x + this.width > other.x &&
      this.y < other.y + other.height &&
      this.y + this.height > other.y
    );
  }

  // Renamed to be more specific about what killed the shell
  markAsKilledByFireball() {
    this.isDead = true;
    this.killedByFireballFlag = true; // Renamed flag
    this.flipY = true;
    this.vy = -300;
  }

  // General death method for other types of deaths
  dead() {
    if (!this.isDead) {
      this.isDead = true;
      this.remove = true;
    }
  }
}
