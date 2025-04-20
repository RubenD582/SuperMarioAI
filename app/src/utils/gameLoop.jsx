export default function createGameLoop({ onUpdate, maxStep = 0.05 }) {
  let lastTimestamp = performance.now();
  let ticks = [];
  let gameTime = 0;
  let animationFrameId;
  const MAX_TICKS = 120;

  const loop = (current) => {
    if (current <= lastTimestamp) {
      animationFrameId = requestAnimationFrame(loop);
      return;
    }

    let rawDelta = (current - lastTimestamp) / 1000;

    // Final clamp
    let delta = Math.max(1 / 144, Math.min(rawDelta, 0.2)); // max 144fps, min 5fps

    lastTimestamp = current;

    let gameDelta = Math.min(delta, maxStep);
    gameTime += gameDelta;

    ticks.push(delta);
    if (ticks.length > MAX_TICKS) {
      ticks.splice(0, ticks.length - MAX_TICKS);
    }

    if (onUpdate) {
      const fps = Math.round(1 / delta);
      onUpdate({ delta, gameDelta, gameTime, fps });
    }

    animationFrameId = requestAnimationFrame(loop);
  };

  return {
    start: () => {
      animationFrameId = requestAnimationFrame(loop);
    },
    stop: () => {
      cancelAnimationFrame(animationFrameId);
    }
  };
}
