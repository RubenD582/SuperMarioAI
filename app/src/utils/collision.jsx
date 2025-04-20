import { TILE_SIZE } from "../constants/constants.jsx";
import MysteryBlock from "../Blocks/mysteryBlock.jsx";
import { blocks } from '../screens/game.jsx';
import {Mushroom} from "../Blocks/item.jsx";

export default class Collision {
  constructor(addItemCallback) {
    this.addItemCallback = addItemCallback;
  }

  checkHorizontalCollisions(e) {
    const playerBottom = e.y + e.height;
    const playerTop = e.y;
    const playerLeft = e.x;
    const playerRight = e.x + e.width;

    const nearbyBlocks = blocks.filter(block => {
      if (!block || !block.solid) return false;

      const blockLeft = block.x;
      const blockRight = block.x + block.width;
      const blockTop = block.y;
      const blockBottom = block.y + block.height;

      return (
        playerRight > blockLeft - 5 &&
        playerLeft < blockRight + 5 &&
        playerBottom > blockTop - 5 &&
        playerTop < blockBottom + 5
      );
    });

    for (const block of nearbyBlocks) {
      const blockLeft = block.x;
      const blockRight = block.x + block.width;
      const blockTop = block.y;
      const blockBottom = block.y + block.height;

      const verticalOverlap = Math.min(playerBottom, blockBottom) - Math.max(playerTop, blockTop);
      const horizontalOverlap = Math.min(playerRight, blockRight) - Math.max(playerLeft, blockLeft);

      // Only check horizontal collisions if vertical overlap is small (i.e. not landed on top)
      if (verticalOverlap > 0 && verticalOverlap < e.height / 2) {
        // Right collision
        if (e.vx > 0 && playerRight > blockLeft && playerLeft < blockLeft) {
          if (e instanceof Mushroom) {
            e.vx *= -1; // Reverse direction
          } else {
            e.x = blockLeft - e.width;
            e.vx = 0;
          }
        }
        // Left collision
        else if (e.vx < 0 && playerLeft < blockRight && playerRight > blockRight) {
          if (e instanceof Mushroom) {
            e.vx *= -1; // Reverse direction
          } else {
            e.x = blockRight;
            e.vx = 0;
          }
        }
      }
    }
  }

  checkVerticalCollisions(e) {
    const playerBottom = e.y + e.height;
    const playerTop = e.y;
    const playerLeft = e.x;
    const playerRight = e.x + e.width;
    let collidedVertically = false;

    const nearbyBlocks = blocks.filter(block => {
      if (!block || !block.solid) return false;

      const blockLeft = block.x;
      const blockRight = block.x + block.width;
      const blockTop = block.y;
      const blockBottom = block.y + block.height;

      return (
        playerRight > blockLeft - 5 &&
        playerLeft < blockRight + 5 &&
        playerBottom > blockTop - 5 &&
        playerTop < blockBottom + 5
      );
    });

    for (const block of nearbyBlocks) {
      const blockLeft = block.x;
      const blockRight = block.x + block.width;
      const blockTop = block.y;
      const blockBottom = block.y + block.height;

      if (playerRight > blockLeft && playerLeft < blockRight) {

        if (e.vy > 0 && playerBottom > blockTop && playerTop < blockTop) {
          e.y = blockTop - e.height - 0.01;
          e.vy = 0;
          e.grounded = true;
          collidedVertically = true;
        }
        // Hitting the bottom of a block
        else if (e.vy < 0 && playerTop < blockBottom && playerBottom > blockBottom) {
          e.y = blockBottom + 0.01;
          e.vy = 0;

          block.animateHit();
          if (block instanceof MysteryBlock) {
            block.onBlockHit(this.addItemCallback)
          }

          collidedVertically = true;
        }
      }
    }

    if (!collidedVertically) {
      e.grounded = false;
    }

    return collidedVertically;
  }

  drawDebug(ctx, entity) {
    if (!ctx || !entity || !blocks) return;

    const e = entity;

    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(e.x, e.y, e.width, e.height);

    blocks.forEach(block => {
      if (!block || !block.solid) return;

      const distance = Math.sqrt(
        Math.pow(e.x + e.width / 2 - (block.x + block.width / 2), 2) +
        Math.pow(e.y + e.height / 2 - (block.y + block.height / 2), 2)
      );

      if (distance < 100) {
        ctx.strokeStyle = "blue";
        ctx.strokeRect(block.x, block.y, block.width, block.height);
      }
    });
  }
}
