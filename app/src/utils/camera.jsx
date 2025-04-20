import {useEffect, useRef, useState} from "react";

const useCamera = () => {
  const [cameraX, setCameraX] = useState(0);
  const targetX = useRef(0);
  const keys = useRef({ left: false, right: false });

  const CAMERA_SPEED = 512;
  const LERP_FACTOR = 0.05;

  const handleKey = (down) => (e) => {
    if (e.key === 'ArrowLeft') keys.current.left = down;
    if (e.key === 'ArrowRight') keys.current.right = down;
  };

  // Set up key listeners in a single useEffect
  useEffect(() => {
    window.addEventListener('keydown', handleKey(true));
    window.addEventListener('keyup', handleKey(false));
    return () => {
      window.removeEventListener('keydown', handleKey(true));
      window.removeEventListener('keyup', handleKey(false));
    };
  }, []);

  const updateCamera = (dt) => {
    if (keys.current.left) targetX.current = Math.max(targetX.current - CAMERA_SPEED * dt, 0);
    if (keys.current.right) targetX.current += CAMERA_SPEED * dt;

    setCameraX(prev => lerp(prev, targetX.current, LERP_FACTOR));
  };

  const lerp = (current, target, factor) => {
    return current + (target - current) * factor;
  };

  return { cameraX, updateCamera };
};

export default useCamera;
