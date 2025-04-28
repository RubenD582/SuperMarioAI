import {TILE_SIZE} from "../constants/constants.jsx";

export default class Score {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;

    this.lifetime = 1; // seconds
    this.timer = 0;

    this.vy = -40; // pixels per second upwards
    this.remove = false;
  }

  update(deltaTime) {
    this.timer += deltaTime;
    this.y += this.vy * deltaTime;

    if (this.timer >= this.lifetime) this.remove = true;
  }

  draw(ctx) {
    ctx.font = '20px "Press Start 2P"';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';

    ctx.fillText(this.value, this.x, this.y + TILE_SIZE);
  }
}
