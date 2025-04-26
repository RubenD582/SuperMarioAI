import fragmentUnderground from '../assets/Sprites/fragment_underground.png';
import fragment from '../assets/Sprites/fragment.png';
import { TILE_SIZE } from "../constants/constants.jsx";
import { mapType } from "../screens/game.jsx";
import { Coin, Flower, Mushroom, Starman } from "./item.jsx";
import EmptyBlock from '../assets/Sprites/EmptyBlock.png';

export default class Block {
  constructor(x, y, width, height, type, image, solid = false, content = null, contentQuantity = 1, collision = null, layer = 0) {
    Object.assign(this, {
      x, y, width, height, type, image, solid, content, collision,
      originalY: y,
      movingUp: false,
      movingDown: false,
      moveUpAmount: 0,
      maxMoveUp: 10,
      moveSpeed: 1,
      broken: false,
      fragments: [],
      spawnedItem: null,
      empty: false,
      contentQuantity,
      layer,
    });
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
    this.fragments.forEach(fragment => fragment.draw(ctx));
  }

  updateAllFragments() {
    this.fragments.forEach(fragment => fragment.update());
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
    const centerX = this.x + (this.width - size) / 2;
    const centerY = this.y + (this.height - size) / 2;

    const velocities = [
      [-1, -4], [1, -4],
      [-1.25, -1.5], [1.25, -1.5]
    ];

    velocities.forEach(([vx, vy]) => {
      this.fragments.push(new Fragment(centerX, centerY, vx, vy, size));
    });
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

    this.spawnedItem?.animate(deltaTime);
  }

  spawnItem(addItemCallback, isBig) {
    if (!this.content) return;

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
    }

    if (item && addItemCallback) addItemCallback(item);
    this.spawnedItem = item;
  }

  onBlockHit(addItemCallback, player) {
    if (!this.empty) {
      this.contentQuantity--;
      if (this.contentQuantity === 0) {
        const img = new Image();
        img.src = EmptyBlock;
        this.image = img;
        this.empty = true;
      }

      this.spawnItem(addItemCallback, player.isBigMario);
      return 100;
    }
    return 0;
  }
}

export class Fragment {
  constructor(x, y, vx, vy, size = 8, gravity = 0.1) {
    Object.assign(this, {
      x, y, vx, vy, size, gravity,
      rotation: Math.random() * 2 * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
      image: new Image()
    });
    this.image.src = mapType === 'underground' ? fragmentUnderground : fragment;
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
