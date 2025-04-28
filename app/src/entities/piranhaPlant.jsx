import PiranhaPlant1 from '../assets/Sprites/Piranha_Plant1.png';
import PiranhaPlant2 from '../assets/Sprites/Piranha_Plant2.png';

import PiranhaPlantUnderground1 from '../assets/Sprites/Piranha_Plant_Underground1.png';
import PiranhaPlantUnderground2 from '../assets/Sprites/Piranha_Plant_Underground2.png';

import Entity from "./entity.jsx";
import {mapType} from "../screens/game.jsx";
import {TILE_SIZE} from "../constants/constants.jsx";
export let PiranhaPlantFrames = [PiranhaPlant1, PiranhaPlant2];

export default class PiranhaPlant extends Entity {
  constructor(x, y, collision, plantID, layer = 0) {
    super(x + TILE_SIZE / 2, y, 32, 48, 44, layer);

    this.speed = 25;
    this.dy = -this.speed;
    this.blockY = y - 48;
    this.collision = collision;
    this.itemFrameDuration = 0.3;
    this.currentAnimation = 'walk';
    this.animations = {};
    this.originalY = y;
    this.originalX = x;
    this.start = false;
    this.plantID = plantID;
    this.timer = 0;
    this.pause = true;
    this.isDown = true;
    this.isDisabled = true;
    this.firstTime = true;

    if (mapType === 'underground') {
      PiranhaPlantFrames = [PiranhaPlantUnderground1, PiranhaPlantUnderground2];
    }

    this.preloadAnimations();

    this.disable();
    setTimeout(() => {
      this.enable();
    }, 100);
  }

  preloadAnimations() {
    this.animations.walk  = this.preloadImages(PiranhaPlantFrames);
  }

  preloadImages(srcArray) {
    return srcArray.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
  }

  getCurrentAnimationFrames() {
    return this.animations[this.currentAnimation] || this.animations.idle;
  }

  animate(deltaTime) {
    const frames = this.getCurrentAnimationFrames();
    this.setAnimationFrames(frames);

    super.animate(deltaTime, 0.2);
  }

  update(deltaTime) {
    if (!this.start || this.isDisabled) return;
    const deltaMs = deltaTime * 1000;

    if (!this.pause) {
      this.y += this.dy * deltaTime;

      // Reached top (going up)
      if (this.dy < 0 && this.y <= this.blockY) {
        this.y = this.blockY; // Snap to position
        this.pause = true;
        this.timer = 0;
        this.dy = 0;

        this.firstTime = false;
      }

      // Reached bottom (going down)
      if (this.dy > 0 && this.y >= this.originalY) {
        this.y = this.originalY; // Snap to position
        this.pause = true;
        this.timer = 0;
        this.dy = 0;

        this.isDown = true;
      }
    } else {
      this.timer += deltaMs;

      const timer = this.firstTime ? 50 : 2000;
      if (this.timer >= timer) {
        this.pause = false;
        this.timer = 0;

        if (this.y === this.originalY) {
          this.dy = -this.speed; // Go up
          this.isDown = false;
        } else if (this.y === this.blockY) {
          this.dy = this.speed; // Go down
        }
      }
    }
  }

  disable() {

    if (this.isDown) {
      this.start = false;
      this.dy = 0;
      this.y = this.originalY;

      this.isDisabled = true;
    }
  }

  enable() {
    if (this.isDisabled === true) {
      this.start = true;
      if (this.y === this.originalY) {
        this.dy = -this.speed;
      }

      this.isDisabled = false;
    }
  }
}