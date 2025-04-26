import Entity from './Entity';
import Shell from './shell.jsx';
import Fireball from './fireball.jsx';
import { mapType } from '../screens/game.jsx';

const koopaFrames = import.meta.glob('../assets/Sprites/Koopa_Walk_Green*.png', { eager: true });
const koopaRedFrames = import.meta.glob('../assets/Sprites/Koopa_Walk_Red*.png', { eager: true });
const koopaUndergroundFrames = import.meta.glob('../assets/Sprites/Koopa_Walk_underground*.png', { eager: true });

export default class Koopa extends Entity {
  constructor(x, y, collision, addItemCallback, isRedKoopa = false) {
    super(x, y, 32, 32, 64);

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
    this.remove = false;
    this.killedByFireball = false;
    this.flipY = false;

    this.isRedKoopa = isRedKoopa;

    const frameMap = this.isRedKoopa
      ? koopaRedFrames
      : mapType === 'underground'
        ? koopaUndergroundFrames
        : koopaFrames;

    this.koopaFrames = Object.keys(frameMap)
      .sort()
      .map(path => frameMap[path].default);


    this.preloadAnimations();
  }

  preloadAnimations() {
    this.animations.walk = this.preloadImages(this.koopaFrames);
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
    if (!this.start) return;

    if (!this.isDead) {
      if (this.collisionCooldown === undefined) this.collisionCooldown = 0;
      if (this.collisionCooldown > 0) this.collisionCooldown -= delta;

      this.vy += this.gravity * delta;
      this.y += this.vy * delta;
      this.x += this.vx * delta;

      this.collision.checkHorizontalCollisions(this);
      this.collision.checkVerticalCollisions(this);

      if (this.isRedKoopa && this.grounded && this.collision.isAtCliffEdge(this)) {
        this.vx = -this.vx;
      }

      entities.forEach(entity => {
        if (entity === this) return;

        if (this.checkCollision(entity) && this.collisionCooldown <= 0) {
          this.collisionCooldown = 0.5;

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

          this.vx = -this.vx;

          if (entity instanceof Fireball || entity instanceof Shell) {
            entity.explode = true;
            this.dead(entity);
          } else if (entity instanceof Shell && !entity.hasOwnProperty('explode')) {
            this.dead(entity);
          }
        }
      });

      this.facing = this.vx < 0 ? 'right' : 'left';
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

  dead(object) {
    if (object instanceof Fireball || object instanceof Shell) {
      this.isDead = true;
      this.killedByFireball = true;
      this.flipY = true;
      this.vx = 0;
      this.vy = -300;
    } else {
      this.addItemCallback(new Shell(this.x, this.y, this.collision));
      this.remove = true;
      this.isDead = true;
      this.vx = 0;
    }
  }
}
