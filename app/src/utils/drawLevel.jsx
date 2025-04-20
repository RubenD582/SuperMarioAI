import React, {useEffect, useRef} from 'react';
import { blocks } from '../screens/game.jsx';

const DrawLevel = React.forwardRef(({ players = [], backgroundColor = '#000000', cameraX = 0, style = {} }, ref) => {
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

    // Calculate visible area
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);

    ctx.save();
    ctx.translate(-cameraXRef.current, 0);

    const leftBound = cameraXRef.current - 50;
    const rightBound = cameraXRef.current + screenWidth + 50;

    // Draw each block with the camera context
    for (const block of blocks) {
      // Only draw if block is in the visible area
      if (block.x + block.width >= leftBound && block.x <= rightBound) {
        block.draw(ctx);
      }
    }

    for (const player of players) {
      player.draw(ctx);
    }

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