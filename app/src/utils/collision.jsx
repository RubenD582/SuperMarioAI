import { TILE_SIZE } from "../constants/constants.jsx";
import { blocks } from '../screens/game.jsx';
import { Mushroom, Starman } from "../Blocks/item.jsx";
import Player from '../entities/player.jsx';
import Goomba from "../entities/goomba.jsx";
import Koopa from "../entities/koopa.jsx";
import Shell from "../entities/shell.jsx";

export default class Collision {
  constructor(addItemCallback) {
    this.addItemCallback = addItemCallback;
  }

  // General helper for overlap
  isOverlapping(a, b, buffer = 0) {
    return (
      a.right > b.left - buffer &&
      a.left < b.right + buffer &&
      a.bottom > b.top - buffer &&
      a.top < b.bottom + buffer
    );
  }

  getEntityBounds(e, isVertical = false) {
    const toleranceX = 0;
    const toleranceY = e instanceof Koopa ? TILE_SIZE : 0;
    const buffer = e.isBigMario ? 3 : 2;

    return {
      top: e.y - toleranceY,
      bottom: e.y + e.height,
      left: e.x + (isVertical ? buffer + toleranceX : toleranceX),
      right: e.x + e.width - (isVertical ? buffer + toleranceX : toleranceX)
    };
  }

  getNearbySolidBlocks(entityBounds) {
    return blocks.filter(block => {
      if (!block?.solid || block.broken) return false;

      const blockBounds = {
        top: block.y,
        bottom: block.y + block.height,
        left: block.x,
        right: block.x + block.width
      };

      return this.isOverlapping(entityBounds, blockBounds, 5);
    });
  }

  checkHorizontalCollisions(e) {
    const bounds = this.getEntityBounds(e, false);
    const nearbyBlocks = this.getNearbySolidBlocks(bounds);
    let hitObject = false;

    for (const block of nearbyBlocks) {
      const blockBounds = {
        top: block.y,
        bottom: block.y + block.height,
        left: block.x,
        right: block.x + block.width
      };

      const verticalOverlap = Math.min(bounds.bottom, blockBounds.bottom) - Math.max(bounds.top, blockBounds.top);
      if (verticalOverlap <= 2) continue;

      if (e.vx > 0 && bounds.right > blockBounds.left && bounds.left < blockBounds.left) {
        this.handleEntityBlockCollision(e, blockBounds.left - e.width);
        hitObject = true;
      } else if (e.vx < 0 && bounds.left < blockBounds.right && bounds.right > blockBounds.right) {
        this.handleEntityBlockCollision(e, blockBounds.right);
        hitObject = true;
      }
    }

    return hitObject;
  }

  handleEntityBlockCollision(e, newX) {
    if (this.isBouncer(e)) {
      e.vx *= -1;
    } else {
      e.x = newX;
      e.vx = 0;
    }
  }

  checkVerticalCollisions(e, entities = null) {
    const bounds = this.getEntityBounds(e, true);
    const nearbyBlocks = this.getNearbySolidBlocks(bounds);
    let collidedVertically = false;

    for (const block of nearbyBlocks) {
      const blockBounds = {
        top: block.y,
        bottom: block.y + block.height,
        left: block.x,
        right: block.x + block.width
      };

      if (bounds.right > blockBounds.left && bounds.left < blockBounds.right) {
        // Falling (landing on top)
        if (
          e.vy >= 0 &&
          bounds.bottom >= blockBounds.top &&
          bounds.bottom <= blockBounds.top + Math.min(12, e.height / 2) &&
          bounds.top < blockBounds.top
        ) {
          e.y = blockBounds.top - e.height;
          e.vy = 0;
          e.grounded = true;
          collidedVertically = true;
        }
        // Jumping (hitting from below)
        else if (
          e.vy < 0 &&
          bounds.top <= blockBounds.bottom &&
          bounds.top >= blockBounds.bottom - 10 &&
          bounds.bottom > blockBounds.bottom
        ) {
          e.y = blockBounds.bottom;
          e.vy = 0;

          if (e instanceof Player && !block.empty) {
            if (block.content) {
              block.onBlockHit(this.addItemCallback, e);
            } else if (e.isBigMario) {
              block.break();
            }
            block.animateHit();

            this.checkEntitiesAboveBlock(block, entities);
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

  isBouncer(e) {
    return (
      e instanceof Mushroom ||
      e instanceof Goomba ||
      e instanceof Koopa ||
      e instanceof Shell ||
      e instanceof Starman
    );
  }

  isAtCliffEdge(e) {
    const direction = e.vx > 0 ? 1 : -1;
    const checkX = e.x + (direction > 0 ? e.width + 1 : -1);
    const checkY = e.y + e.height + 1;

    // Simulate a "foot probe" at the edge of the Koopa
    return !blocks.some(block => {
      if (!block.solid || block.broken) return false;
      return (
        checkX >= block.x &&
        checkX <= block.x + block.width &&
        checkY >= block.y &&
        checkY <= block.y + block.height
      );
    });
  }

  checkEntitiesAboveBlock(hitBlock, entities) {
    const blockTop = hitBlock.y;
    const blockLeft = hitBlock.x;
    const blockRight = hitBlock.x + hitBlock.width;
    const alignmentTolerance = 10; // Adjust this tolerance as needed

    entities.forEach(entity => {
      // Only check things above the block
      const entityBottom = entity.y + entity.height;
      const entityCenterX = entity.x + entity.width / 2;

      const isAbove = entityBottom <= blockTop;

      // Allow horizontal alignment with some tolerance
      const isHorizontallyAligned =
        (entityCenterX >= blockLeft - alignmentTolerance && entityCenterX <= blockRight + alignmentTolerance);

      if (isAbove && isHorizontallyAligned) {
        if (entity.dead) entity.dead(new Shell());
      }
    });
  }

  drawDebug(ctx, entity) {
    if (!ctx || !entity || !blocks) return;

    // Show smaller hitbox
    const bounds = this.getEntityBounds(entity, true);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(bounds.left, entity.y, bounds.right - bounds.left, entity.height);

    blocks.forEach(block => {
      if (!block?.solid) return;
      const dist = Math.hypot(entity.x - block.x, entity.y - block.y);
      if (dist < 100) {
        ctx.strokeStyle = "blue";
        ctx.strokeRect(block.x, block.y, block.width, block.height);
      }
    });
  }
}
