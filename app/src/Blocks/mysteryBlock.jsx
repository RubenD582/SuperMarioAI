import {Flower, Mushroom} from './item.jsx';
import Block from './block.jsx';
import { TILE_SIZE } from '../constants/constants.jsx';

import Coin1 from '../assets/Sprites/Coin1.png';
import Coin2 from '../assets/Sprites/Coin2.png';
import Coin3 from '../assets/Sprites/Coin3.png';
import Coin4 from '../assets/Sprites/Coin4.png';

import FireFlower1 from '../assets/Sprites/Flower1.png';
import FireFlower2 from '../assets/Sprites/Flower2.png';
import FireFlower3 from '../assets/Sprites/Flower3.png';
import FireFlower4 from '../assets/Sprites/Flower4.png';
import MysteryBlock1 from '../assets/Sprites/MysteryBlock1.png';
import MysteryBlock2 from '../assets/Sprites/MysteryBlock2.png';
import MysteryBlock3 from '../assets/Sprites/MysteryBlock3.png';
import EmptyBlock from '../assets/Sprites/EmptyBlock.png';

export const CoinFrames = [Coin1, Coin2, Coin3, Coin4];
export const BlockFrames = [MysteryBlock1, MysteryBlock2, MysteryBlock3];
export const EmptyBlockFrame = [EmptyBlock];

export default class MysteryBlock extends Block {
  constructor(x, y, width, height, image, collision, solid = true, itemType = 'mushroom') {
    super(x, y, width, height, "mystery", image, solid);

    this.collision = collision;
    this.itemType = itemType;
    this.empty = false;
    this.complete = false;
    this.points = 200;

    this.animations = {};
    this.itemAnimations = {};

    this.preloadAnimations();

    this.blockFrameIndex = 0;
    this.frameTime = 0;
    this.frameDuration = 0.175;

    this.spawnedItem = null;
  }

  preloadAnimations() {
    this.animations['cycle'] = this.preloadImages(BlockFrames);
    this.animations['empty'] = this.preloadImages(EmptyBlockFrame);
  }

  preloadImages(srcArray) {
    return srcArray.map(src => this.loadImage(src));
  }

  loadImage(src) {
    const img = new Image();
    img.src = src;
    img.onerror = () => console.error('Image failed to load:', src);
    return img;
  }

  animate(deltaTime) {
    let changed = false;

    if (!this.empty) {
      this.frameTime += deltaTime;
      const animation = this.animations['cycle'];
      if (animation.length > 1 && this.frameTime >= this.frameDuration) {
        this.blockFrameIndex = (this.blockFrameIndex + 1) % animation.length;
        this.frameTime = 0;
        changed = true;
      }
    }

    // Animate the item entity (flower or mushroom)
    if (this.spawnedItem) {
      this.spawnedItem.animate(deltaTime);
    }

    return changed;
  }

  draw(ctx) {
    // Draw the block
    if (this.empty) {
      this.currentBlockImage = this.animations['empty'][0];
      this.type = "empty";
    } else {
      this.currentBlockImage = this.animations['cycle'][this.blockFrameIndex];
    }

    // Draw the item entity if it exists
    if (this.spawnedItem) {
      this.spawnedItem.draw(ctx);
    }

    if (this.currentBlockImage) {
      super.setImage(this.currentBlockImage);
    }
    super.draw(ctx);
  }

  onBlockHit(addItemCallback, isBig) {
    if (isBig) {
      this.itemType = 'flower';
    } else {
      this.itemType = 'mushroom';
    }

    if (!this.empty) {
      this.empty = true;
      this.spawnItem(addItemCallback);
      return this.points;
    }
    return 0;
  }

  spawnItem(addItemCallback) {
    let item;
    if (this.itemType === 'flower') {
      item = new Flower(this.x + (this.width - TILE_SIZE) / 2, this.y - TILE_SIZE);
    } else if (this.itemType === 'mushroom') {
      item = new Mushroom(this.x + (this.width - TILE_SIZE) / 2, this.y - TILE_SIZE, this.collision);
    }

    this.spawnedItem = item;

    if (addItemCallback && item) {
      addItemCallback(item);
    }
  }

}
