import fragment from '../assets/Sprites/fragment.png';
import {TILE_SIZE} from "../constants/constants.jsx";

export default class Block {
  constructor(x, y, width, height, type, image, solid = false) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.image = image;

    this.width = width;
    this.height = height;

    this.solid = solid;

    // Store the original position
    this.originalY = y;

    // Animation state
    this.movingUp = false;
    this.movingDown = false;
    this.moveUpAmount = 0;
    this.maxMoveUp = 10;
    this.moveSpeed = 0;

    // Broken state
    this.broken = false;
    this.fragments = [];
  }

  setImage(image) {
    this.image = image;
  }

  draw(ctx) {
    if (this.broken) return;

    if (this.image && this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }

  drawAllFragments(ctx) {
    for (const fragment of this.fragments) {
      fragment.draw(ctx);
    }
  }

  updateAllFragments() {
    for (const fragment of this.fragments) {
      fragment.update();
    }

    this.fragments = this.fragments.filter(f => f.y < 1000);
  }

  getBoundingBox() {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height,
    };
  }

  animateHit() {
    if (!this.movingUp && !this.movingDown) {
      this.movingUp = true;
      this.moveUpAmount = 0;
    }
  }

  break() {
    this.broken = true;

    const size = TILE_SIZE / 1.75;
    const centerX = this.x + this.width / 2 - size / 2;
    const centerY = this.y + this.height / 2 - size / 2;

    const fragmentVelocities = [
      [-1, -4],  // top-left
      [1, -4],   // top-right
      [-1.25, -1.5],  // bottom-left
      [1.25, -1.5],   // bottom-right
    ];

    for (let [vx, vy] of fragmentVelocities) {
      this.fragments.push(new Fragment(centerX, centerY, vx, vy, size));
    }
  }

  update() {
    if (this.movingUp) {
      if (this.moveUpAmount < this.maxMoveUp) {
        this.y -= this.moveSpeed;
        this.moveUpAmount += this.moveSpeed;
      } else {
        this.movingUp = false;
        this.movingDown = true;
      }
    }

    if (this.movingDown) {
      if (this.moveUpAmount > 0) {
        this.y += this.moveSpeed;
        this.moveUpAmount -= this.moveSpeed;
      } else {
        this.y = this.originalY;
        this.movingDown = false;
      }
    }
  }
}

export class Fragment {
  constructor(x, y, vx, vy, size = 8, gravity = 0.1) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.gravity = gravity;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    this.image = new Image();
    this.image.src = fragment;
  }

  update() {
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
    ctx.rotate(this.rotation);
    ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}
