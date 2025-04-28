import {useEffect, useRef, useState} from "react";
import {mapWidth, playerX} from '../screens/game.jsx';
import {TILE_SIZE} from "../constants/constants.jsx";

const useCamera = () => {
  const [cameraX, setCameraX] = useState(0);
  const keys = useRef({ left: false, right: false });

  const OFFSET = TILE_SIZE * 2;
  const SCREEN_WIDTH_IN_TILES = 28; // Visible tiles on screen

  const handleKey = (down) => (e) => {
    if (e.key === 'ArrowLeft') keys.current.left = down;
    if (e.key === 'ArrowRight') keys.current.right = down;
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKey(true));
    window.addEventListener('keyup', handleKey(false));
    return () => {
      window.removeEventListener('keydown', handleKey(true));
      window.removeEventListener('keyup', handleKey(false));
    };
  }, []);

  const updateCamera = (dt) => {
    if (mapWidth >= TILE_SIZE * SCREEN_WIDTH_IN_TILES) {
      let currentCameraX = 0;

      if ((playerX - OFFSET) >= TILE_SIZE * 10) {
        currentCameraX = (playerX - OFFSET) - TILE_SIZE * 10;
      }

      const maxCameraX = mapWidth - (TILE_SIZE * SCREEN_WIDTH_IN_TILES);

      currentCameraX = Math.max(0, Math.min(currentCameraX, maxCameraX));

      setCameraX(currentCameraX);
    } else {
      setCameraX(0);
    }
  };

  return { cameraX, updateCamera };
};

export default useCamera;