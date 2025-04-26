import {MAX_RUN, MAX_WALK} from "../constants/physicsConstants.jsx";

export default class Entity {
  constructor(x, y, width, height, imageHeight = null) {
    this.y = y;
    this.x = x;

    this.vx = 0;
    this.vy = 0;

    this.width = width;
    this.height = height;
    this.facing = 'right';

    this.currentAnimation = 'idle';
    this.currentFrames = [];
    this.currentFrame = 0;
    this.frameTime = 0;
    this.frameDuration = 0.2;
    this.imageHeight = imageHeight;

    this.start = false;
  }

  // Call this when animation changes
  setAnimationFrames(frames) {
    if (this.currentFrames !== frames) {
      this.currentFrames = frames;
      this.currentFrame = 0;
      this.frameTime = 0;
    }
  }

  animate(deltaTime, duration) {
    this.frameTime += deltaTime;

    if (this.currentFrames.length > 1 && this.frameTime >= duration) {
      this.currentFrame = (this.currentFrame + 1) % this.currentFrames.length;
      this.frameTime = 0;
    }
  }

  draw(ctx, flipY = false) {
    if (!this.currentFrames.length) return;

    ctx.save();

    const drawX = this.x;
    const drawY = this.y;

    const frame = this.currentFrames[this.currentFrame] || this.currentFrames[0];

    ctx.translate(drawX + this.width / 2, drawY + this.height / 2);

    const scaleX = this.facing === 'left' ? -1 : 1;
    const scaleY = flipY ? -1 : 1;

    ctx.scale(scaleX, scaleY);

    ctx.drawImage(
      frame,
      -this.width / 2,
      // Use a universal approach that works for all heights
      this.imageHeight ?
        -(this.height / 2) - (this.imageHeight - this.height) :
        -this.height / 2,
      this.width,
      this.imageHeight ? this.imageHeight : this.height
    );

    ctx.restore();
  }

  drawBoundingBox(ctx) {
    ctx.save();
    ctx.strokeStyle = 'red';
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.restore();
  }

  map(x, inMin, inMax, outMin, outMax) {
    return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }
}