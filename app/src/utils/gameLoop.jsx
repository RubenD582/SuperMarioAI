export default function createGameLoop({ onUpdate, maxStep = 0.05 }) {
  let lastTimestamp = performance.now();
  let ticks = [];
  let gameTime = 0;
  let animationFrameId;
  const MAX_TICKS = 120;

  const loop = (current) => {
    let delta = (current - lastTimestamp) / 1000;
    delta = Math.max(0, Math.min(delta, 0.2));

    lastTimestamp = current;

    let gameDelta = Math.min(delta, maxStep);
    gameTime += gameDelta;

    ticks.push(delta);
    if (ticks.length > MAX_TICKS) {
      ticks.splice(0, ticks.length - MAX_TICKS);
    }

    if (onUpdate) onUpdate({ delta, gameDelta, gameTime });

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
