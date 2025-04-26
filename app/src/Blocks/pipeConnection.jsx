import PipeConnectionSprite from '../assets/Sprites/PipeConnection.png';
import Block from './block.jsx';

export let PipeConnectionFrames = [PipeConnectionSprite];

export default class PipeConnection extends Block {
  constructor(x, y, width, height, image, collision, solid = true, content = null, layer = 0) {
    super(x, y, width, height, "pipeConnection", image, solid, content, layer);

    this.collision = collision;
    this.complete = false;
    this.points = 200;
    this.blockFrameIndex = 0;
    this.frameTime = 0;
    this.frameDuration = 0.175;
    this.animations = {
      none: [],
    };

    this.preloadAnimations();
  }

  preloadAnimations() {
    this.animations['none'] = this.preloadImages(PipeConnectionFrames);
  }

  preloadImages(srcArray) {
    return srcArray.map(src => {
      const img = new Image();
      img.src = src;
      img.onerror = () => console.error('Image failed to load:', src);
      return img;
    });
  }
}
