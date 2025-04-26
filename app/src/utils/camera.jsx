import {useEffect, useRef, useState} from "react";
import {mapWidth, playerX} from '../screens/game.jsx';
import {TILE_SIZE} from "../constants/constants.jsx";

const useCamera = () => {
  const [cameraX, setCameraX] = useState(0);
  const targetX = useRef(0);
  const keys = useRef({ left: false, right: false });

  const CAMERA_SPEED = 1024;
  const LERP_FACTOR = 0.05;

  const OFFSET = TILE_SIZE * 2;

  let screenWidth = TILE_SIZE * 26;

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
    if (mapWidth >= TILE_SIZE * 26) {
      let currentCameraX = 0;
      if ((playerX - OFFSET) >= TILE_SIZE * 10) {
        currentCameraX = (playerX - OFFSET) - TILE_SIZE * 10;
      }
      // Clamp camera to right edge of the map
      currentCameraX = Math.min(currentCameraX, mapWidth);

      setCameraX(prev => lerp(prev, currentCameraX, LERP_FACTOR));
    } else {
      // Camera does not have to move, because the map is smaller than the visible view range
      setCameraX(prev => lerp(prev, 0, LERP_FACTOR));
    }
  };

  const lerp = (current, target, factor) => {
    return current + (target - current) * factor;
  };

  return { cameraX, updateCamera };
};

export default useCamera;
