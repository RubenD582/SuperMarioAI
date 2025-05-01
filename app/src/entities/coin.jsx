import CoinSprite1 from '../assets/Sprites/Coin_Underground1.png';
import CoinSprite2 from '../assets/Sprites/Coin_Underground2.png';
import CoinSprite3 from '../assets/Sprites/Coin_Underground3.png';
import CoinSprite4 from '../assets/Sprites/Coin_Underground4.png';

import Entity from './Entity';
import {TILE_SIZE} from "../constants/constants.jsx";
import {Coin} from "../Blocks/item.jsx";

export let CoinFrames = [CoinSprite1, CoinSprite2, CoinSprite3, CoinSprite4];

export default class BigCoin extends Entity {
  constructor(x, y, width, height, image, addItemCallback, collision, solid = true, nextLevel = null, layer = 3) {
    super(x, y, 32, 32, 32, layer);

    this.addItemCallback = addItemCallback;
    this.collision = collision;
    this.blockFrameIndex = 0;
    this.currentAnimation = 'none';
    this.animations = {};
    this.score = 200;

    this.frameTime = 0;
    this.frameDuration = 0.15;
    this.isCollected = false;

    this.preloadAnimations();
  }

  preloadAnimations() {
    this.animations['none'] = this.preloadImages(CoinFrames);
  }

  preloadImages(srcArray) {
    return srcArray.map(src => {
      const img = new Image();
      img.src = src;
      img.onerror = () => console.error('Image failed to load:', src);
      return img;
    });
  }

  animate(delta) {
    this.frameTime += delta;

    const frames = this.animations[this.currentAnimation];
    if (!frames || frames.length <= 1) return;

    if (this.frameTime >= this.frameDuration) {
      this.blockFrameIndex = (this.blockFrameIndex + 1) % frames.length;
      this.frameTime = 0;
    }
  }

  draw(ctx, flipY) {
    const frames = this.animations[this.currentAnimation];
    const frame = frames[this.blockFrameIndex];

    if (!frame) return;

    ctx.drawImage(frame, this.x, this.y, this.width, this.height);
  }

  spawnCoin() {
    if (this.isCollected) return;

    const spawnX = this.x + (this.width - TILE_SIZE) / 2;
    const spawnY = this.y;

    const coin = new Coin(spawnX, spawnY);

    if (this.addItemCallback) {
      this.addItemCallback(coin);
    }

    this.isCollected = true;
    return coin;
  }
}

