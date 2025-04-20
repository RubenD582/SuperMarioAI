export default function createGameLoop({ onUpdate, onRender, targetFps = 144 }) {
  let running = false;
  let lastUpdateTime = 0;
  let lastRenderTime = 0;
  let gameTime = 0;
  let updateIntervalId = null;
  let animFrameId = null;

  const updateInterval = 1000 / targetFps; // ~6.94ms for 144Hz

  let frameCount = 0;
  let updateCount = 0;
  let fpsTimer = 0;
  let currentFps = 0;
  let currentUps = 0; // Updates per second

  // Separate update and render functions
  const update = (timestamp) => {
    const now = timestamp || performance.now();

    if (lastUpdateTime === 0) {
      lastUpdateTime = now;
      return;
    }

    const delta = (now - lastUpdateTime) / 1000; // seconds
    lastUpdateTime = now;

    const cappedDelta = Math.min(delta, 0.1);

    gameTime += cappedDelta;

    updateCount++;
    fpsTimer += delta;
    if (fpsTimer >= 0.5) {
      currentFps = Math.round(frameCount / fpsTimer);
      currentUps = Math.round(updateCount / fpsTimer);
      frameCount = 0;
      updateCount = 0;
      fpsTimer = 0;
    }

    // Execute update logic
    if (onUpdate) {
      onUpdate({
        delta: cappedDelta,
        gameTime,
        fps: currentFps,
        ups: currentUps
      });
    }
  };

  const render = (timestamp) => {
    if (!running) return;

    const now = timestamp || performance.now();

    if (lastRenderTime === 0) {
      lastRenderTime = now;
    }

    const delta = (now - lastRenderTime) / 1000;
    lastRenderTime = now;

    frameCount++;

    if (onRender) {
      onRender({
        delta,
        gameTime,
        fps: currentFps,
        ups: currentUps
      });
    }

    animFrameId = requestAnimationFrame(render);
  };

  const start = () => {
    if (running) return;

    running = true;
    lastUpdateTime = 0;
    lastRenderTime = 0;

    updateIntervalId = setInterval(update, updateInterval);

    animFrameId = requestAnimationFrame(render);
  };

  const stop = () => {
    running = false;

    if (updateIntervalId !== null) {
      clearInterval(updateIntervalId);
      updateIntervalId = null;
    }

    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  };

  return { start, stop };
}