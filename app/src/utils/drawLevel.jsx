import React, { useEffect, useRef, useState } from 'react';
import {blocks, mapType, mapWidth, scores} from '../screens/game.jsx';
import Fireball from "../entities/fireball.jsx";
import Goomba from "../entities/goomba.jsx";
import Item from "../Blocks/item.jsx";
import Koopa from "../entities/koopa.jsx";
import Shell from "../entities/shell.jsx";
import PiranhaPlant from "../entities/piranhaPlant.jsx";
import {DRAW_HITBOX, TILE_SIZE, TV_EFFECT} from "../constants/constants.jsx";
import Block from "../Blocks/block.jsx";
import Entity from "../entities/entity.jsx";

const OldTVEffects = React.forwardRef(({
  width = 800,
  height = 600,
  children,
  effectIntensity = 0.7,
  snowEffectInterval = 50,
  numSnowFrames = 10
}, ref) => {
  const canvasRef = useRef(null); // Snow effect canvas
  const contentRef = useRef(null); // Main content canvas
  const noiseCanvasRef = useRef(null); // Noise canvas
  const scanlineCanvasRef = useRef(null); // Scanline canvas
  const vignetteCanvasRef = useRef(null); // Vignette canvas

  const animationRef = useRef(null);
  const [snowFrames, setSnowFrames] = useState([]); // Store pre-generated snow frames
  const [currentSnowFrame, setCurrentSnowFrame] = useState(0); // Index to cycle through snow frames

  React.useImperativeHandle(ref, () => ({
    contentCanvas: contentRef
  }));

  // Function to create a random snow effect (static)
  const createSnowEffect = (w, h) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    // Fill the canvas with random static (grayscale)
    for (let i = 0; i < 0; i += 16) {
      const noise = Math.random() * 100;
      data[i] = noise;        // Red channel
      data[i + 1] = noise;    // Green channel
      data[i + 2] = noise;    // Blue channel
      data[i + 3] = Math.random() * 100 ; // Transparency (light snow effect)
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  };

  // Function to create the scanline effect
  const createScanlineEffect = (w, h) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'; // Light black for scanlines
    ctx.lineWidth = 2; // Set the line width

    // Draw horizontal scanlines
    const lineHeight = 1;
    for (let y = 0; y < h; y += lineHeight * 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke(); // Apply the line width and color
    }

    return canvas;
  };

  // Function to create the vignette effect
  const createVignetteEffect = (w, h) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, w, h);

    // Create a radial gradient from the center to the corners, blending the edges with black
    const gradient = ctx.createRadialGradient(
      w / 2, h / 2, 0,            // Center of the canvas
      w / 2, h / 2, Math.max(w, h) * 0// To the corners (adjust this factor for fuzziness)
    );

    // Add color stops for black in the center, and transparent on the edges
    gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0)');      // Transparent center
    gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');    // Fading to black at the edges

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);  // Apply the gradient to the entire canvas

    return canvas;
  };



  // Function to create noise layer
  const createNoiseLayer = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < 0; i += 4) {
      const noise = Math.random() * 255;
      data[i] = noise;
      data[i + 1] = noise;
      data[i + 2] = noise;
      data[i + 3] = Math.random() * 50;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  };

  // Generate the snow effect frames
  useEffect(() => {
    const generatedFrames = [];
    for (let i = 0; i < numSnowFrames; i++) {
      generatedFrames.push(createSnowEffect(width, height));
    }
    setSnowFrames(generatedFrames);

    const intervalId = setInterval(() => {
      setCurrentSnowFrame((prevFrame) => (prevFrame + 1) % numSnowFrames);
    }, snowEffectInterval);

    return () => clearInterval(intervalId);
  }, [width, height, snowEffectInterval, numSnowFrames]);

  // Create the effect layers once
  useEffect(() => {
    noiseCanvasRef.current = createNoiseLayer();
    scanlineCanvasRef.current = createScanlineEffect(width, height);
    vignetteCanvasRef.current = createVignetteEffect(width, height);
  }, [width, height]);

  useEffect(() => {
    if (!canvasRef.current || !contentRef.current || snowFrames.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const scanlineCanvas = scanlineCanvasRef.current;
    const vignetteCanvas = vignetteCanvasRef.current;

    canvas.width = width;
    canvas.height = height;

    let time = 0;
    let rollOffset = 0;
    let rollPhase = 0;
    let activeRollBar = null;

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);
      ctx.save();

      ctx.globalAlpha = 0.25;
      ctx.drawImage(snowFrames[currentSnowFrame], 0, 0);
      ctx.globalAlpha = 1;

      ctx.drawImage(noiseCanvasRef.current, 0, 0);
      ctx.drawImage(scanlineCanvas, 0, 0);
      ctx.drawImage(vignetteCanvas, 0, 0);

      // Rolling bar logic
      rollPhase += 0.01 * effectIntensity;

      if (!activeRollBar && Math.random() < 0.1 * effectIntensity) {
        activeRollBar = {
          y: Math.random() * height,
          speed: 30 + Math.random() * 50,
          height: 20 + Math.random() * 10,
          alpha: 0.2,
        };
      }

      if (activeRollBar) {
        activeRollBar.y += activeRollBar.speed * 0.016; // Move based on time

        ctx.globalAlpha = activeRollBar.alpha;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, activeRollBar.y, width, activeRollBar.height);
        ctx.globalAlpha = 1;

        if (activeRollBar.y > height) {
          activeRollBar = null; // Remove after leaving screen
        }
      }

      ctx.restore();
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, snowFrames, currentSnowFrame, effectIntensity]);

  return (
    <div style={{ position: 'relative', width, height, overflow: 'hidden' }}>
      {/* Main game content */}
      <canvas
        ref={contentRef}
        width={width}
        height={height}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 10,
        }}
      />
      {/* Effects overlay (noise, scanlines, vignette) */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
          msInterpolationMode: 'nearest-neighbor',
          zIndex: 20,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          visibility: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
});

const DrawLevel = React.forwardRef(({ players = [], entities = [], backgroundColor = '#000000', cameraX = 0, style = {} }, ref) => {
  const canvasRef = useRef(null);
  const oldTVRef = useRef(null);
  const scale = window.devicePixelRatio || 1;
  const cameraXRef = useRef(cameraX);

  useEffect(() => {
    cameraXRef.current = cameraX;
    drawLevel();
  }, [cameraX]);

  useEffect(() => {
    drawLevel();
  }, [blocks]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !blocks.length) return;

      const tilesWide = Math.min(28, Math.ceil(mapWidth / TILE_SIZE));
      const screenWidth = tilesWide * TILE_SIZE;

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

  const renderFrame = () => {
    drawLevel();
  };

  React.useImperativeHandle(ref, () => ({
    renderFrame
  }));

  const drawLevel = () => {
    const canvas = canvasRef.current;
    const contentCanvas = oldTVRef.current?.contentCanvas?.current;

    if (!canvas || !blocks.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tilesWide = Math.min(28, Math.ceil(mapWidth / TILE_SIZE));
    const screenWidth = tilesWide * TILE_SIZE;

    const screenHeight = window.innerHeight;

    // Ensure pixel-perfect camera positioning
    const exactCameraX = Math.round(cameraXRef.current);
    const leftBound = exactCameraX - 50;
    const rightBound = exactCameraX + screenWidth + 50;

    // Clear the transformation matrix first
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Clear the canvas with background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply integer scale transformation
    const integerScale = Math.max(1, Math.floor(scale));
    ctx.setTransform(integerScale, 0, 0, integerScale, 0, 0);

    // Disable image smoothing for crisp pixel art
    ctx.imageSmoothingEnabled = false;

    ctx.save();
    // Use rounded camera position for pixel-perfect scrolling
    ctx.translate(-exactCameraX, 0);

    // Filter visible blocks and entities
    const visibleBlocks = blocks
        .filter(block => block.x + block.width >= leftBound && block.x <= rightBound);

    const visibleEntities = entities
        .filter(entity => entity.x + entity.width >= leftBound && entity.x <= rightBound)
        .sort((a, b) => a.layer - b.layer);

    // 1. Draw blocks with layer === 0
    visibleBlocks
        .filter(block => block.layer === 0)
        .forEach(block => {
          block.draw(ctx);
          if (block.fragments?.length > 0) {
            block.drawAllFragments(ctx);
          }
        });

    // 2. Draw entities
    visibleEntities.forEach(entity => {
      if (entity instanceof Item) {
        if ('start' in entity) {
          entity.start = true;
        }

        entity.draw(ctx, entity.flipY);
        if (DRAW_HITBOX && entity.collision) {
          entity.collision.drawDebug(ctx, entity);
        }
      }
    });

    // 3. Draw blocks with layer > 0
    visibleBlocks
        .filter(block => block.layer > 0 && block.layer < 4)
        .sort((a, b) => a.layer - b.layer)
        .forEach(block => {
          block.draw(ctx);
          if (block.fragments?.length > 0) {
            block.drawAllFragments(ctx);
          }
        });

    // Draw entities that is not items, such as Goombas, Koopas, etc.
    visibleEntities.forEach(entity => {
      if (!(entity instanceof Item)) {
        if ('start' in entity) {
          entity.start = true;
        }

        entity.draw(ctx, entity.flipY);
        if (DRAW_HITBOX && entity.collision) {
          entity.collision.drawDebug(ctx, entity);
        }
      }
    });

    // 4. Draw players last
    players.forEach(player => {
      if (player.isInvincible && !player.visibilityToggle) return;
      player.draw(ctx);
      if (DRAW_HITBOX) {
        player.collision.drawDebug(ctx, player);
      }
    });

    visibleBlocks
        .filter(block => block.layer === 4)
        .sort((a, b) => a.layer - b.layer)
        .forEach(block => {
          block.draw(ctx);
          if (block.fragments?.length > 0) {
            block.drawAllFragments(ctx);
          }
        });

    // 5. Draw pipe tops absolutely last
    visibleBlocks
        .filter(block => block.type === "pipeTop" || block.type === "pipeConnection")
        .forEach(block => {
          block.draw(ctx);
          if (block.fragments?.length > 0) {
            block.drawAllFragments(ctx);
          }
        });

    scores.forEach((score) => {
      score.draw(ctx);
    });

    ctx.restore();

    // Handle content canvas rendering with proper pixel scaling
    if (contentCanvas) {
      const contentCtx = contentCanvas.getContext('2d');
      if (contentCtx) {
        contentCtx.clearRect(0, 0, contentCanvas.width, contentCanvas.height);

        // Disable smoothing for the content canvas as well
        contentCtx.imageSmoothingEnabled = false;

        // Calculate proper integer scaling factor
        // Use Math.floor to ensure whole-number scaling
        const baseScale = Math.min(
            Math.floor(contentCanvas.width / canvas.width),
            Math.floor(contentCanvas.height / canvas.height),
            1
        );

        // Use integer scaling to maintain pixel crispness
        const pixelPerfectScale = baseScale > 0 ? baseScale : 1;

        const drawWidth = canvas.width * pixelPerfectScale;
        const drawHeight = canvas.height * pixelPerfectScale;

        // Center the content in the canvas
        const offsetX = Math.floor((contentCanvas.width - drawWidth) / 2);
        const offsetY = Math.floor((contentCanvas.height - drawHeight) / 2);

        // Draw with integer offsets to maintain pixel perfection
        contentCtx.drawImage(
            canvas,
            Math.floor(offsetX),
            Math.floor(offsetY),
            Math.floor(drawWidth),
            Math.floor(drawHeight)
        );
      }
    }
  };

  return (
    TV_EFFECT ? (
      <OldTVEffects ref={oldTVRef} width={800} height={600} effectIntensity={0.1}>
        <canvas
          ref={canvasRef}
          style={{
            // imageRendering: 'pixelated',
            msInterpolationMode: 'nearest-neighbor',
            ...style
          }}
        />
      </OldTVEffects>
    ) : (
      <canvas
        ref={canvasRef}
        style={{
          // imageRendering: 'pixelated',
          msInterpolationMode: 'nearest-neighbor',
          ...style
        }}
      />
    )
  );

});

export default DrawLevel;
