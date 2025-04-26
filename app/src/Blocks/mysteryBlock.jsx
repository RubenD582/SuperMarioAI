import Block from './block.jsx';

import MysteryBlockUnderground1 from '../assets/Sprites/MysteryBlock_underground1.png';
import MysteryBlockUnderground2 from '../assets/Sprites/MysteryBlock_underground2.png';
import MysteryBlockUnderground3 from '../assets/Sprites/MysteryBlock_underground3.png';
import EmptyBlockUnderground from '../assets/Sprites/EmptyBlock_underground.png';

import MysteryBlock1 from '../assets/Sprites/MysteryBlock1.png';
import MysteryBlock2 from '../assets/Sprites/MysteryBlock2.png';
import MysteryBlock3 from '../assets/Sprites/MysteryBlock3.png';
import EmptyBlock from '../assets/Sprites/EmptyBlock.png';
import {mapType} from "../screens/game.jsx";

export let BlockFrames;
export let EmptyBlockFrame;

export default class MysteryBlock extends Block {
  constructor(x, y, width, height, image, collision, solid = true, content = null, layer = 0) {
    super(x, y, width, height, "mystery", image, solid, content, layer);
    this.collision = collision;
    this.complete = false;
    this.points = 200;
    this.blockFrameIndex = 0;
    this.frameTime = 0;
    this.frameDuration = 0.175;
    this.animations = {
      cycle: [],
      empty: []
    };

    this.setBlockFrames();
    this.preloadAnimations();
  }

  setBlockFrames() {
    if (mapType === 'underground') {
      BlockFrames = [MysteryBlockUnderground1, MysteryBlockUnderground2, MysteryBlockUnderground3];
      EmptyBlockFrame = [EmptyBlockUnderground];
    } else {
      BlockFrames = [MysteryBlock1, MysteryBlock2, MysteryBlock3];
      EmptyBlockFrame = [EmptyBlock];
    }
  }

  preloadAnimations() {
    this.animations['cycle'] = this.preloadImages(BlockFrames);
    this.animations['empty'] = this.preloadImages(EmptyBlockFrame);
  }

  preloadImages(srcArray) {
    return srcArray.map(src => {
      const img = new Image();
      img.src = src;
      img.onerror = () => console.error('Image failed to load:', src);
      return img;
    });
  }

  animate(deltaTime) {
    let changed = false;

    if (!this.empty) {
      this.frameTime += deltaTime;
      if (this.frameTime >= this.frameDuration) {
        this.blockFrameIndex = (this.blockFrameIndex + 1) % this.animations['cycle'].length;
        this.frameTime = 0;
        changed = true;
      }
    }

    return changed;
  }

  draw(ctx) {
    this.currentBlockImage = this.empty
      ? this.animations['empty'][0]
      : this.animations['cycle'][this.blockFrameIndex];

    this.spawnedItem?.draw(ctx);

    if (this.currentBlockImage) this.setImage(this.currentBlockImage);
    super.draw(ctx);
  }
}
