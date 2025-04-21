import magicMushroom from '../assets/Sprites/MagicMushroom.png';
import fireFlower1 from '../assets/Sprites/Flower1.png';
import fireFlower2 from '../assets/Sprites/Flower2.png';
import fireFlower3 from '../assets/Sprites/Flower3.png';
import fireFlower4 from '../assets/Sprites/Flower4.png';

import { TILE_SIZE } from '../constants/constants.jsx';

export default class Item {
  constructor(x, y, itemType) {
    this.x = x;
    this.y = y;
    this.itemType = itemType;
    this.width = TILE_SIZE;
    this.height = TILE_SIZE;
    this.isCollected = false;

    this.itemAnimations = this.loadItemAnimations();
    this.itemFrameIndex = 0;
    this.itemFrameTime = 0;
    this.itemFrameDuration = 0.2; // each frame lasts 0.2s
  }

  loadItemAnimations() {
    const flowerAnimations = [
      this.loadImage(fireFlower1),
      this.loadImage(fireFlower2),
      this.loadImage(fireFlower3),
      this.loadImage(fireFlower4),
    ];

    const mushroomAnimation = [
      this.loadImage(magicMushroom),
    ];

    return this.itemType === 'flower' ? flowerAnimations : mushroomAnimation;
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
    this.vx = 75;
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
