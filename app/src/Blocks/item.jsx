import magicMushroom from '../assets/Sprites/MagicMushroom.png';
import FireFlower1 from '../assets/Sprites/Flower1.png';
import FireFlower2 from '../assets/Sprites/Flower2.png';
import FireFlower3 from '../assets/Sprites/Flower3.png';
import FireFlower4 from '../assets/Sprites/Flower4.png';

import Coin1 from '../assets/Sprites/Coin1.png';
import Coin2 from '../assets/Sprites/Coin2.png';
import Coin3 from '../assets/Sprites/Coin3.png';
import Coin4 from '../assets/Sprites/Coin4.png';

import Starman1 from '../assets/Sprites/Starman1.png';
import Starman2 from '../assets/Sprites/Starman2.png';
import Starman3 from '../assets/Sprites/Starman3.png';
import Starman4 from '../assets/Sprites/Starman4.png';

import { TILE_SIZE } from '../constants/constants.jsx';

export default class Item {
  constructor(x, y, itemType, layer) {
    this.x = x;
    this.y = y;
    this.itemType = itemType;
    this.width = TILE_SIZE;
    this.height = TILE_SIZE;
    this.isCollected = false;
    this.itemFrameIndex = 0;
    this.itemFrameTime = 0;
    this.itemFrameDuration = 0.0;
    this.itemAnimations = this.loadItemAnimations();
    this.layer = layer;

    console.log(layer);
  }

  loadItemAnimations() {
    const flowerAnimations = [
      this.loadImage(FireFlower1),
      this.loadImage(FireFlower2),
      this.loadImage(FireFlower3),
      this.loadImage(FireFlower4),
    ];

    const mushroomAnimation = [
      this.loadImage(magicMushroom),
    ];

    const coinAnimations = [
      this.loadImage(Coin1),
      this.loadImage(Coin2),
      this.loadImage(Coin3),
      this.loadImage(Coin4),
    ];

    const starmanAnimations = [
      this.loadImage(Starman1),
      this.loadImage(Starman2),
      this.loadImage(Starman3),
      this.loadImage(Starman4),
    ];

    if (this.itemType === 'flower') return flowerAnimations;
    if (this.itemType === 'coin') return coinAnimations;
    if (this.itemType === 'starman') return starmanAnimations;

    return mushroomAnimation;
  }

  loadImage(src) {
    const img = new Image();
    img.src = src;
    img.onerror = () => console.error('Image failed to load:', src);
    return img;
  }

  animate(deltaTime) {
    if (this.itemAnimations.length > 1) {
      this.itemFrameTime += deltaTime;

      if (this.itemFrameTime >= this.itemFrameDuration) {
        this.itemFrameTime = 0;
        this.itemFrameIndex = (this.itemFrameIndex + 1) % this.itemAnimations.length;
      }
    }
  }

  draw(ctx) {
    if (!this.isCollected) {
      const frame = this.itemAnimations[this.itemFrameIndex];
      const itemX = this.x + (this.width - TILE_SIZE) / 2;
      const itemY = this.y;
      ctx.drawImage(frame, itemX, itemY, TILE_SIZE, TILE_SIZE);
    }
  }

  collect() {
    this.isCollected = true;
  }
}

export class Flower extends Item {
  constructor(x, y) {
    super(x, y + TILE_SIZE - TILE_SIZE * 0.16, 'flower');
    this.dy = -25;
    this.isMoving = true;
    this.blockY = y;
    this.itemFrameDuration = 0.3;
  }

  animate(deltaTime) {
    super.animate(deltaTime);

    if (this.isMoving) {
      this.y += this.dy * deltaTime;

      const targetY = this.blockY + 2;
      if (this.y <= targetY) {
        this.y = targetY;
        this.isMoving = false;
      }
    }
  }
}

export class Mushroom extends Item {
  constructor(x, y, collision) {
    super(x, y + TILE_SIZE - TILE_SIZE * 0.16, 'mushroom');

    this.dy = -25;
    this.vx = 60;
    this.vy = 0;
    this.gravity = 1000;
    this.grounded = false;
    this.collision = collision;

    this.isMoving = true;
    this.blockY = y;
  }

  animate(deltaTime) {
    super.animate(deltaTime);

    if (this.isMoving) {
      this.y += this.dy * deltaTime;

      const targetY = this.blockY + 2;
      if (this.y <= targetY) {
        this.y = targetY;
        this.isMoving = false;
      }
    } else {
      this.vy += this.gravity * deltaTime;
      this.x += this.vx * deltaTime;
      this.collision.checkHorizontalCollisions(this);

      this.y += this.vy * deltaTime;
      this.collision.checkVerticalCollisions(this);
    }
  }
}

export class Coin extends Item {
  constructor(x, y) {
    super(x, y, 'coin');

    // Physics properties
    this.initialVelocity = -200; // Strong upward initial velocity
    this.gravity = 300;          // Gravity to pull it back down
    this.velocity = this.initialVelocity;

    // Animation timing
    this.lifeTime = 0;
    this.maxLifeTime = 1.4;      // Coin will exist for 0.9 seconds

    // Much faster coin spinning animation - lower value means faster animation
    this.itemFrameDuration = 0.1;
  }

  animate(deltaTime) {
    // Handle sprite frame animation
    super.animate(deltaTime);

    // Update lifetime
    this.lifeTime += deltaTime;
    if (this.lifeTime >= this.maxLifeTime) {
      this.isCollected = true;
      return;
    }

    // Apply gravity to velocity
    this.velocity += this.gravity * deltaTime;

    // Update position based on velocity
    this.y += this.velocity * deltaTime;
  }

  draw(ctx) {
    if (!this.isCollected) {
      const frame = this.itemAnimations[this.itemFrameIndex];
      const itemX = this.x + (this.width - TILE_SIZE) / 2;
      const itemY = this.y;

      ctx.drawImage(frame, itemX, itemY, TILE_SIZE, TILE_SIZE);
    }
  }
}

export class Starman extends Item {
  constructor(x, y, collision) {
    super(x, y + TILE_SIZE - TILE_SIZE * 0.16, 'starman');

    this.blocksPerJump = 6;

    this.dy = -25;
    this.isMoving = true;
    this.blockY = y;

    this.gravity = 100;
    this.bounceHeight = -110;

    const timePerJump = 2 * (Math.abs(this.bounceHeight) / this.gravity) * 1.5;

    this.vx = (this.blocksPerJump * TILE_SIZE) / timePerJump;

    this.directionX = 1;
    this.vy = 0;
    this.grounded = false;

    this.collision = collision;

    this.itemFrameDuration = 0.2;
  }

  animate(deltaTime) {
    super.animate(deltaTime);

    if (this.isMoving) {
      this.y += this.dy * deltaTime;

      const targetY = this.blockY + 2;
      if (this.y <= targetY) {
        this.y = targetY;
        this.isMoving = false;

        this.vy = -50;
      }
    } else {
      this.vy += this.gravity * deltaTime;

      this.x += this.vx * this.directionX * deltaTime;

      this.collision.checkHorizontalCollisions(this);

      this.y += this.vy * deltaTime;

      this.collision.checkVerticalCollisions(this);

      if (this.grounded) {
        this.vy = this.bounceHeight;
        this.grounded = false;
      }
    }
  }
}