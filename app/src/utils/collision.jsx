import { TILE_SIZE } from "../constants/constants.jsx";
import MysteryBlock from "../Blocks/mysteryBlock.jsx";
import { blocks } from '../screens/game.jsx';
import {Mushroom} from "../Blocks/item.jsx";
import Player from '../entities/player.jsx';
import MarioFireRun1 from "../assets/Sprites/0/Mario_Fire_Run1.png";
import Goomba from "../entities/goomba.jsx";

export default class Collision {
  constructor(addItemCallback) {
    this.addItemCallback = addItemCallback;
  }

  checkHorizontalCollisions(e) {
    let hitObject = false;

    const entityBottom = e.y + e.height;
    const entityTop = e.y;
    const entityLeft = e.x;
    const entityRight = e.x + e.width;

    const nearbyBlocks = blocks.filter(block => {
      if (!block || !block.solid) return false;

      const blockLeft = block.x;
      const blockRight = block.x + block.width;
      const blockTop = block.y;
      const blockBottom = block.y + block.height;

      return (
        entityRight > blockLeft - 5 &&
        entityLeft < blockRight + 5 &&
        entityBottom > blockTop - 5 &&
        entityTop < blockBottom + 5
      );
    });

    for (const block of nearbyBlocks) {
      if (block.broken) continue;

      const blockLeft = block.x;
      const blockRight = block.x + block.width;
      const blockTop = block.y;
      const blockBottom = block.y + block.height;

      const verticalOverlap = Math.min(entityBottom, blockBottom) - Math.max(entityTop, blockTop);
      const horizontalOverlap = Math.min(entityRight, blockRight) - Math.max(entityLeft, blockLeft);

      // Only check horizontal collisions if vertical overlap is significant
      if (verticalOverlap > 0 && verticalOverlap > 2) {
        // Right collision
        if (e.vx > 0 && entityRight > blockLeft && entityLeft < blockLeft) {
          if (e instanceof Mushroom || e instanceof Goomba) {
            e.vx *= -1; // Reverse direction
          } else {
            e.x = blockLeft - e.width;
            e.vx = 0;
          }

          hitObject = true;
        }
        // Left collision
        else if (e.vx < 0 && entityLeft < blockRight && entityRight > blockRight) {
          if (e instanceof Mushroom || e instanceof Goomba) {
            e.vx *= -1; // Reverse direction
          } else {
            e.x = blockRight;
            e.vx = 0;
          }

          hitObject = true;
        }
      }
    }

    return hitObject;
  }

  checkVerticalCollisions(e) {
    const entityBottom = e.y + e.height;
    const entityTop = e.y;
    // Slightly narrower hitbox for vertical collisions to prevent edge cases
    const entityLeft = e.x + (e.isBigMario ? 3 : 2);
    const entityRight = e.x + e.width - (e.isBigMario ? 3 : 2);
    let collidedVertically = false;

    const nearbyBlocks = blocks.filter(block => {
      if (!block || !block.solid) return false;

      const blockLeft = block.x;
      const blockRight = block.x + block.width;
      const blockTop = block.y;
      const blockBottom = block.y + block.height;

      return (
        entityRight > blockLeft - 5 &&
        entityLeft < blockRight + 5 &&
        entityBottom > blockTop - 5 &&
        entityTop < blockBottom + 5
      );
    });

    for (const block of nearbyBlocks) {
      if (block.broken) continue;

      const blockLeft = block.x;
      const blockRight = block.x + block.width;
      const blockTop = block.y;
      const blockBottom = block.y + block.height;

      if (entityRight > blockLeft && entityLeft < blockRight) {
        // Check for landing on top of blocks (falling)
        if (e.vy >= 0 &&
          entityBottom >= blockTop &&
          entityBottom <= blockTop + Math.min(12, e.height/2) &&
          entityTop < blockTop) {
          e.y = blockTop - e.height;
          e.vy = 0;
          e.grounded = true;
          collidedVertically = true;
        }
        // Check for hitting blocks from below (jumping)
        else if (e.vy < 0 &&
          entityTop <= blockBottom &&
          entityTop >= blockBottom - 10 &&
          entityBottom > blockBottom) {
          e.y = blockBottom;
          e.vy = 0;

          if (e instanceof Player) {
            if (block.type !== 'empty') {
              if (block instanceof MysteryBlock) {
                block.onBlockHit(this.addItemCallback, e.isBigMario);
                block.animateHit();
              } else {
                if (e.isBigMario) {
                  block.break();
                } else {
                  block.animateHit();
                }
              }
            }
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

    // Draw collision hitbox
    const entityLeft = e.x + (e.isBigMario ? 3 : 2);
    const entityRight = e.x + e.width - (e.isBigMario ? 3 : 2);
    ctx.strokeStyle = "green";
    ctx.lineWidth = 1;
    ctx.strokeRect(entityLeft, e.y, entityRight - entityLeft, e.height);

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