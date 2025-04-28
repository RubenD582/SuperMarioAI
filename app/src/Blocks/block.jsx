import fragmentUnderground from '../assets/Sprites/fragment_underground.png';
import fragment from '../assets/Sprites/fragment.png';
import { TILE_SIZE } from "../constants/constants.jsx";
import { mapType } from "../screens/game.jsx";
import { Coin, Flower, Mushroom, Starman } from "./item.jsx";
import EmptyBlock from '../assets/Sprites/EmptyBlock.png';

export default class Block {
  constructor(x, y, width, height, type, image, solid = false, content = null, contentQuantity = 1, collision = null, layer = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.image = image;
    this.solid = solid;
    this.content = content;
    this.collision = collision;
    this.originalY = y;
    this.movingUp = false;
    this.movingDown = false;
    this.moveUpAmount = 0;
    this.maxMoveUp = 10;
    this.moveSpeed = 1;
    this.broken = false;
    this.fragments = [];
    this.spawnedItems = []; // <-- Changed to an array
    this.empty = false;
    this.contentQuantity = contentQuantity;
    this.layer = layer;
  }

  setImage(image) {
    this.image = image;
  }

  draw(ctx) {
    if (!this.broken && this.image?.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }

  drawAllFragments(ctx) {
    for (const fragment of this.fragments) {
      fragment.draw(ctx);
    }
  }

  updateAllFragments() {
    for (let i = this.fragments.length - 1; i >= 0; i--) {
      this.fragments[i].update();
      if (this.fragments[i].y >= 1000) {
        this.fragments.splice(i, 1);
      }
    }
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
    const centerX = this.x + (this.width - size) / 2;
    const centerY = this.y + (this.height - size) / 2;

    const velocities = [
      [-1, -4], [1, -4],
      [-1.25, -1.5], [1.25, -1.5]
    ];

    const fragImage = new Image();
    fragImage.src = mapType === 'underground' ? fragmentUnderground : fragment;

    for (const [vx, vy] of velocities) {
      this.fragments.push(new Fragment(centerX, centerY, vx, vy, size, 0.1, fragImage));
    }
  }

  update(deltaTime) {
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

    // Update all spawned items
    if (this.spawnedItems.length > 0) {
      for (const item of this.spawnedItems) {
        item.animate(deltaTime);
      }
    }
  }

  spawnItem(addItemCallback, isBig) {
    if (!this.content) return; // No content to spawn

    const spawnX = this.x + (this.width - TILE_SIZE) / 2;
    const spawnY = this.y - TILE_SIZE;

    let item;
    switch (this.content.type) {
      case 'auto':
        item = isBig ? new Flower(spawnX, spawnY) : new Mushroom(spawnX, spawnY, this.collision);
        break;
      case 'coin':
        item = new Coin(spawnX, spawnY);
        break;
      case 'mushroom':
        item = new Mushroom(spawnX, spawnY, this.collision);
        break;
      case 'flower':
        item = new Flower(spawnX, spawnY);
        break;
      case 'star':
        item = new Starman(spawnX, spawnY, this.collision);
        break;
      default:
        return;
    }

    if (item && addItemCallback) {
      addItemCallback(item);
    }

    this.spawnedItems.push(item); // Push into array
  }

  onBlockHit(addItemCallback, player) {
    if (this.empty || this.contentQuantity <= 0) return 0; // Nothing to do if empty

    this.spawnItem(addItemCallback, player.isBigMario);

    this.contentQuantity--;

    if (this.contentQuantity <= 0) {
      const emptyImg = new Image();
      emptyImg.src = EmptyBlock;
      this.setImage(emptyImg);
      this.empty = true;
    }

    return 100; // Score or points for hitting
  }
}

export class Fragment {
  constructor(x, y, vx, vy, size = 8, gravity = 0.1, image = null) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.gravity = gravity;
    this.rotation = Math.random() * 2 * Math.PI;
    this.rotationSpeed = (Math.random() - 0.5) * 0.1;

    if (image) {
      this.image = image;
    } else {
      this.image = new Image();
      this.image.src = mapType === 'underground' ? fragmentUnderground : fragment;
    }
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
