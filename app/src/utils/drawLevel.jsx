import React, {useEffect, useRef} from 'react';
import { blocks } from '../screens/game.jsx';
import Fireball from "../entities/fireball.jsx";
import Goomba from "../entities/goomba.jsx";
import Item from "../Blocks/item.jsx";
import Koopa from "../entities/koopa.jsx";
import Shell from "../entities/shell.jsx";

const DrawLevel = React.forwardRef(({ players = [], entities = [], backgroundColor = '#000000', cameraX = 0, style = {} }, ref) => {
  const canvasRef = useRef(null);
  const scale = window.devicePixelRatio || 1;

  // Store the latest cameraX value in a ref to access when needed
  const cameraXRef = useRef(cameraX);

  // Update the ref when the prop changes
  useEffect(() => {
    cameraXRef.current = cameraX;
    drawLevel();
  }, [cameraX]);

  useEffect(() => {
    drawLevel();
  }, [blocks]);

  // Handle resize and initial setup
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !blocks.length) return;

      const screenWidth = window.innerWidth;

      // 🧠 Calculate max Y based on the highest block's Y position + its height
      const canvasHeight = Math.max(...blocks.map(block => block.y + block.height), 0);

      canvas.width = screenWidth * scale;
      canvas.height = canvasHeight * scale;

      canvas.style.width = `${screenWidth}px`;
      canvas.style.height = `${canvasHeight}px`;

      drawLevel();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [blocks]);

  // This method is called by the Game component's animation loop via ref
  const renderFrame = () => {
    drawLevel();
  };

  // Expose the renderFrame method to the parent via ref
  React.useImperativeHandle(ref, () => ({
    renderFrame
  }));

  const drawLevel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx || !blocks.length) return;

    // Calculate visible area and bounds
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const leftBound = cameraXRef.current - 50;
    const rightBound = cameraXRef.current + screenWidth + 50;

    // Apply scale and background settings
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);

    // Save context state before moving it to the camera's position
    ctx.save();
    ctx.translate(-cameraXRef.current, 0);

    entities.forEach(entity => {
      if (entity instanceof Item) {
        entity.draw(ctx);
      }
    });

    // 2. Draw blocks within visible bounds
    blocks.forEach(block => {
      if (block.x + block.width >= leftBound && block.x <= rightBound) {
        block.draw(ctx);
        if (block.fragments?.length > 0) {
          block.drawAllFragments(ctx);
        }
      }
    });

    // 3. Draw fireballs on top of blocks
    entities.forEach(entity => {
      if (entity instanceof Fireball) {
        entity.draw(ctx);
      }
    });

    // 4. Draw Goombas
    entities.forEach(entity => {
      if (entity instanceof Goomba || entity instanceof Koopa || entity instanceof Shell) {
        entity.draw(ctx, entity.flipY);
      }
    });

    // 5. Draw players (only if visible and not invincible)
    players.forEach(player => {
      if (player.isInvincible && !player.visibilityToggle) return;
      player.draw(ctx);
    });

    // Restore context to its original state
    ctx.restore();
  };

  return (
    <canvas
      ref={(node) => {
        canvasRef.current = node;
      }}
      style={{
        imageRendering: 'pixelated',
        msInterpolationMode: 'nearest-neighbor',
        ...style
      }}
    />
  );
});

export default DrawLevel;