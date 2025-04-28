import FlagSprite from '../assets/Sprites/Flag.png';
import Entity from './Entity';
import {TILE_SIZE} from "../constants/constants.jsx";

export let FlagFrames = [FlagSprite];

export default class Flag extends Entity {
  constructor(x, y, width, height, image, collision, solid = true, layer = 3) {
    super(x, y, 64, 32, 32, layer);

    this.speed = 100;
    this.vy = this.direction === 'up' ? -this.speed : this.speed;
    this.collision = collision;
    this.blockFrameIndex = 0;
    this.frameTime = 0;
    this.frameDuration = 0.175;
    this.resetTimer = 0;
    this.currentAnimation = 'none';
    this.showedScore = false;
    this.animations = {
      none: [],
    };

    this.preloadAnimations();
  }

  preloadAnimations() {
    this.animations['none'] = this.preloadImages(FlagFrames);
  }

  preloadImages(srcArray) {
    return srcArray.map(src => {
      const img = new Image();
      img.src = src;
      img.onerror = () => console.error('Image failed to load:', src);
      return img;
    });
  }

  draw(ctx, flipY) {
    const frames = this.animations[this.currentAnimation];
    const frame = frames[this.blockFrameIndex];

    if (!frame) return;

    ctx.drawImage(frame, this.x, this.y, this.width, this.height);
  }
}
