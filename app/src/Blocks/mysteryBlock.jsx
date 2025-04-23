import {Coin, Flower, Mushroom, Starman} from './item.jsx';
import Block from './block.jsx';
import { TILE_SIZE } from '../constants/constants.jsx';

import Coin1 from '../assets/Sprites/Coin1.png';
import Coin2 from '../assets/Sprites/Coin2.png';
import Coin3 from '../assets/Sprites/Coin3.png';
import Coin4 from '../assets/Sprites/Coin4.png';

import MysteryBlockUnderground1 from '../assets/Sprites/MysteryBlock_underground1.png';
import MysteryBlockUnderground2 from '../assets/Sprites/MysteryBlock_underground2.png';
import MysteryBlockUnderground3 from '../assets/Sprites/MysteryBlock_underground3.png';
import EmptyBlockUnderground from '../assets/Sprites/EmptyBlock_underground.png';

import MysteryBlock1 from '../assets/Sprites/MysteryBlock1.png';
import MysteryBlock2 from '../assets/Sprites/MysteryBlock2.png';
import MysteryBlock3 from '../assets/Sprites/MysteryBlock3.png';
import EmptyBlock from '../assets/Sprites/EmptyBlock.png';
import {mapType} from "../screens/game.jsx";

export let CoinFrames;
export let BlockFrames;
export let EmptyBlockFrame;

export default class MysteryBlock extends Block {
  constructor(x, y, width, height, image, collision, solid = true, content = 'mushroom') {
    super(x, y, width, height, "mystery", image, solid);

    this.collision = collision;
    this.content = content;
    this.empty = false;
    this.complete = false;
    this.points = 200;

    this.animations = {};
    this.itemAnimations = {};

    this.blockFrameIndex = 0;
    this.frameTime = 0;
    this.frameDuration = 0.175;

    this.spawnedItem = null;

    if (mapType === 'underground') {
      BlockFrames = [MysteryBlockUnderground1, MysteryBlockUnderground2, MysteryBlockUnderground3];
      EmptyBlockFrame = [EmptyBlockUnderground];
    } else {
      BlockFrames = [MysteryBlock1, MysteryBlock2, MysteryBlock3];
      EmptyBlockFrame = [EmptyBlock];
    }

    this.preloadAnimations();
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
    if (!this.empty) {
      this.empty = true;
      this.spawnItem(addItemCallback, isBig);
      return this.points;
    }

    return 0;
  }

  spawnItem(addItemCallback, isBig) {
    let item;
    console.log(this.content.type);
    if (this.content.type === 'auto') {
      if (isBig) {
        item = new Flower(this.x + (this.width - TILE_SIZE) / 2, this.y - TILE_SIZE)
      } else {
        item = new Mushroom(this.x + (this.width - TILE_SIZE) / 2, this.y - TILE_SIZE, this.collision)
      }
    }

    if (this.content.type === 'coin') {
      item = new Coin(this.x + (this.width - TILE_SIZE) / 2, this.y - TILE_SIZE)
    } else if (this.content.type === 'star') {
      item = new Starman(this.x + (this.width - TILE_SIZE) / 2, this.y - TILE_SIZE, this.collision)
    }

    console.log(item);

    this.spawnedItem = item;
    if (addItemCallback && item) {
      addItemCallback(item);
    }
  }
}
