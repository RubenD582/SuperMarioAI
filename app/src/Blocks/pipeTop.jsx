import Pipe from '../assets/Sprites/PipeTop.png';
import Block from './block.jsx';

export let PipeFrames = [Pipe];

export default class PipeTop extends Block {
  constructor(x, y, width, height, image, collision, solid = true, content = null, plantID = null, layer = 4) {
    super(x, y, width, height, "pipeTop", image, solid, content, layer);

    this.collision = collision;
    this.complete = false;
    this.points = 200;
    this.blockFrameIndex = 0;
    this.frameTime = 0;
    this.frameDuration = 0.175;
    this.plantID = plantID;
    this.animations = {
      none: [],
    };

    this.preloadAnimations();
  }

  preloadAnimations() {
    this.animations['none'] = this.preloadImages(PipeFrames);
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
