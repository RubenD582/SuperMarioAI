import magicMushroom from '../assets/Sprites/MagicMushroom.png';
import fireFlower1 from '../assets/Sprites/Flower1.png';
import fireFlower2 from '../assets/Sprites/Flower2.png';
import fireFlower3 from '../assets/Sprites/Flower3.png';
import fireFlower4 from '../assets/Sprites/Flower4.png';

import { TILE_SIZE } from '../constants/constants.jsx';

class Item {
  constructor(x, y, itemType) {
    this.x = x;
    this.y = y;
    this.itemType = itemType;
    this.width = TILE_SIZE;
    this.height = TILE_SIZE;
    this.isCollected = false;

    // Shared animation resources
    this.itemAnimations = this.loadItemAnimations();
    this.itemFrameIndex = 0;
    this.itemFrameTime = 0;
    this.itemFrameDuration = 0.1;

    // Track the number of items for shared animation
    Item.totalItems = (Item.totalItems || 0) + 1;

    // Create a global timer for synchronization
    Item.globalFrameTime = 0;
  }

  // Static method to update global frame timer
  static updateGlobalFrameTime(deltaTime) {
    Item.globalFrameTime += deltaTime;
    if (Item.globalFrameTime >= Item.frameDuration) {
      Item.globalFrameTime = 0; // Reset global timer after one cycle
    }
  }

  // Load item-specific animations
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

  // Load an image
  loadImage(src) {
    const img = new Image();
    img.src = src;
    img.onerror = () => console.error('Image failed to load:', src);
    return img;
  }

  animate(deltaTime) {
    Item.updateGlobalFrameTime(deltaTime);

    if (Item.globalFrameTime === 0) {
      this.itemFrameIndex = (this.itemFrameIndex + 1) % this.itemAnimations.length;
    }
  }

  // Draw the item
  draw(ctx) {
    if (!this.isCollected) {
      const currentAnim = this.itemAnimations;
      const frame = currentAnim[this.itemFrameIndex];
      const itemX = this.x + (this.width - TILE_SIZE) / 2;
      const itemY = this.y;
      ctx.drawImage(frame, itemX, itemY, TILE_SIZE, TILE_SIZE);
    }
  }

  // Mark the item as collected
  collect() {
    this.isCollected = true;
  }
}

export class Flower extends Item {
  constructor(x, y) {
    // The 0.16 helps to now show the item at the bottom when the block is animating
    super(x, y + TILE_SIZE - TILE_SIZE * 0.16, 'flower');
    this.dy = -50;

    this.isMoving = true;

    this.blockY = y;
  }

  animate(deltaTime) {
    super.animate(deltaTime);

    if (this.isMoving) {
      this.y += this.dy * deltaTime; // Scaled for smoother movement

      // Correct stopping point
      const targetY = this.blockY + 2;

      if (this.y <= targetY) {
        this.y = targetY;
        this.isMoving = false;
      }
    }
  }

  // Draw the item (flower)
  draw(ctx) {
    if (!this.isCollected) {
      const currentAnim = this.itemAnimations;
      const frame = currentAnim[this.itemFrameIndex];
      const itemX = this.x + (this.width - TILE_SIZE) / 2;
      const itemY = this.y;
      ctx.drawImage(frame, itemX, itemY, TILE_SIZE, TILE_SIZE);
    }
  }
}

export class Mushroom extends Item {
  constructor(x, y, collision) {
    super(x, y, 'mushroom');

    this.vx = 100; // horizontal speed
    this.vy = 0;   // vertical speed
    this.gravity = 1000; // pixels/sec^2
    this.grounded = false;
    this.collision = collision;
  }

  animate(deltaTime) {
    super.animate(deltaTime);

    // Gravity
    this.vy += this.gravity * deltaTime;

    // Apply velocity
    this.x += this.vx * deltaTime;
    this.collision.checkHorizontalCollisions(this);

    this.y += this.vy * deltaTime;
    this.collision.checkVerticalCollisions(this);
  }
}

