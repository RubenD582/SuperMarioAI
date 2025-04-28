export default function createGameLoop({ onUpdate, maxStep = 0.05, targetFPS = 144 }) {
  let lastTimestamp = performance.now();
  let ticks = [];
  let gameTime = 0;
  let animationFrameId;
  let accumulator = 0;
  const MAX_TICKS = 120;
  let timeStep = 1 / targetFPS; // Fixed time step for updates

  const loop = (current) => {
    if (current <= lastTimestamp) {
      animationFrameId = requestAnimationFrame(loop);
      return;
    }

    let rawDelta = (current - lastTimestamp) / 1000;
    lastTimestamp = current;

    // Clamp delta to avoid spiral of death in case of large pauses
    let frameDelta = Math.min(rawDelta, 0.2);

    // Accumulate time since last frame
    accumulator += frameDelta;

    // Track actual FPS for display
    ticks.push(frameDelta);
    if (ticks.length > MAX_TICKS) {
      ticks.splice(0, ticks.length - MAX_TICKS);
    }
    const fps = Math.round(1 / frameDelta);

    // Process fixed time steps to achieve target FPS
    let updatesCount = 0;
    while (accumulator >= timeStep && updatesCount < 5) { // limit max steps per frame
      // Update with fixed time step
      if (onUpdate) {
        onUpdate({
          delta: timeStep,
          gameDelta: Math.min(timeStep, maxStep),
          gameTime,
          fps: targetFPS, // We're passing the target FPS now
          actualFPS: fps  // Also passing the actual rendering FPS
        });
      }

      gameTime += Math.min(timeStep, maxStep);
      accumulator -= timeStep;
      updatesCount++;
    }

    animationFrameId = requestAnimationFrame(loop);
  };

  return {
    start: () => {
      lastTimestamp = performance.now();
      accumulator = 0;
      animationFrameId = requestAnimationFrame(loop);
    },
    stop: () => {
      cancelAnimationFrame(animationFrameId);
    },
    getTargetFPS: () => targetFPS,
    setTargetFPS: (fps) => {
      targetFPS = fps;
      timeStep = 1 / targetFPS;
    }
  };
}