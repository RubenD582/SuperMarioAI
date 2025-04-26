import PlatformSprite from '../assets/Sprites/Platform.png';
import Block from './block.jsx';
import {mapHeight} from "../screens/game.jsx";

export let PlatformFrames = [PlatformSprite];

export default class Platform extends Block {
  constructor(x, y, width, height, image, collision, solid = true, content = null) {
    super(x, y, width, height, "platform", image, solid, content);

    this.direction = content.type;
    this.speed = 100;
    this.vy = this.direction === 'up' ? -this.speed : this.speed;
    this.collision = collision;
    this.complete = false;
    this.points = 200;
    this.blockFrameIndex = 0;
    this.frameTime = 0;
    this.frameDuration = 0.175;
    this.resetTimer = 0;
    this.animations = {
      none: [],
    };

    this.preloadAnimations();
  }

  preloadAnimations() {
    this.animations['none'] = this.preloadImages(PlatformFrames);
  }

  preloadImages(srcArray) {
    return srcArray.map(src => {
      const img = new Image();
      img.src = src;
      img.onerror = () => console.error('Image failed to load:', src);
      return img;
    });
  }

  update(deltaTime) {
    // If in cooldown period, count down
    if (this.resetTimer > 0) {
      this.resetTimer -= deltaTime;

      // When timer completes, reset position based on direction
      if (this.resetTimer <= 0) {
        if (this.direction === 'down') {
          this.y = -this.height;
        } else if (this.direction === 'up') {
          this.y = mapHeight;
        }
        // Allow movement again after reset
        this.resetTimer = 0;
      }

      return; // Skip further updates during the cooldown
    }

    // Normal movement
    this.y += this.vy * deltaTime;

    // Trigger reset timer when going out of bounds
    if (this.direction === 'down' && this.y >= mapHeight) {
      this.resetTimer = 1; // start 1 second cooldown
    } else if (this.direction === 'up' && this.y + this.height <= 0) {
      this.resetTimer = 1; // start 1 second cooldown
    }
  }
}
