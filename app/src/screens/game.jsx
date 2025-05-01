import React, { useEffect, useMemo, useRef, useState } from 'react';
import DrawLevel from '../utils/drawLevel.jsx';
import { LevelProvider, useLevel, initializeLevelManager } from '../utils/levelManager.jsx';
import useCamera from "../utils/camera.jsx";
import Block from '../Blocks/block.jsx';
import { imageById } from '../Blocks/spriteMap.jsx';
import { TILE_SIZE } from "../constants/constants.jsx";
import MysteryBlock from "../Blocks/mysteryBlock.jsx";
import Player from '../entities/player.jsx';
import Collision from '../utils/collision.jsx';
import setupKeyboardInput, { subscribeToKeys } from "../utils/keyboardInput.jsx";
import { FRAME_DURATION } from "../constants/constants.jsx";
import createGameLoop from "../utils/gameLoop.jsx";
import Fireball from "../entities/fireball.jsx";
import Goomba from "../entities/goomba.jsx";
import Koopa from "../entities/koopa.jsx";
import Shell from "../entities/shell.jsx";
import PipeTop from "../Blocks/pipeTop.jsx";
import PiranhaPlant from "../entities/piranhaPlant.jsx";
import Platform from "../Blocks/platform.jsx";
import PipeConnection from "../Blocks/pipeConnection.jsx";
import { v4 as uuidv4 } from 'uuid';
import Flagpole from "../entities/flagpole.jsx";
import Flag from "../entities/flag.jsx";
import BigCoin from "../entities/coin.jsx";

const FIRST_LEVEL = "test/test.json";

export let scores = [];
export let blocks = [];
export let mapType = 'overworld';
export let mapHeight = null;
export let mapWidth = null;
export let playerX = null;

const preloadedImagesPromise = (function () {
  const loadedImages = {};

  return Promise.all(
    Object.entries(imageById).map(([index, sprite]) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = sprite.url;
        img.onload = () => {
          loadedImages[index] = {
            ...sprite,
            image: img,
          };
          resolve();
        };
      });
    })
  ).then(() => loadedImages);
})();

// Wrapper component that provides the LevelProvider context
const GameWrapper = () => {
  return (
    <LevelProvider>
      <GameContent />
    </LevelProvider>
  );
};

const GameContent = () => {
  // Use the level context instead of local level state
  const { currentLevel, levelData, changeLevel } = useLevel();
  const [levelBackground, setLevelBackground] = useState('#000000');
  const [loadedSprites, setLoadedSprites] = useState(null);

  const [population, setPopulation] = useState(1);
  const [players, setPlayers] = useState([]);
  const [entities, setEntities] = useState([]);

  const [activeGamepadIndex, setActiveGamepadIndex] = useState(null);
  const activeGamepadIndexRef = useRef(null);

  const readGamepadInput = (activeIndex = 0) => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[activeIndex];

    if (!gp || !gp.connected) return null;

    return {
      left: gp.axes[0] < -0.5,
      right: gp.axes[0] > 0.5,
      up: gp.axes[1] < -0.5,
      down: gp.axes[1] > 0.5,
      xButton: gp.buttons[0].pressed,
      circleButton: gp.buttons[1].pressed,
      squareButton: gp.buttons[2].pressed,
      triangleButton: gp.buttons[3].pressed,
      dUp: gp.buttons[12].pressed,
      dDown: gp.buttons[13].pressed,
      dLeft: gp.buttons[14].pressed,
      dRight: gp.buttons[15].pressed,
      rightTrigger: gp.buttons[7].pressed,
    };
  };

  useEffect(() => {
    const pollGamepads = () => {
      const gamepads = navigator.getGamepads?.() || [];

      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (!gp) continue;

        const anyButtonPressed = gp.buttons.some(btn => btn.pressed);
        const anyAxisMoved = gp.axes.some(axis => Math.abs(axis) > 0.2);

        if (anyButtonPressed || anyAxisMoved) {
          if (activeGamepadIndexRef.current !== i) {
            activeGamepadIndexRef.current = i;
            setActiveGamepadIndex(i);
            // Optional: console.log(`Switched to gamepad ${i}`);
          }
          break; // prioritize first active one
        }
      }
    };

    const interval = setInterval(pollGamepads, 100); // check 10x/second

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log(entities);
  }, [entities]);

  const camera = useCamera();
  const gameRef = useRef(null);
  const drawLevelRef = useRef(null);

  const addItemCallback = (item) => {
    setEntities((prevItems) => [...prevItems, item]);
  };

  const collisionRef = useRef(new Collision(addItemCallback));

  // Initialize the level manager so it can be used globally
  useEffect(() => {
    initializeLevelManager(changeLevel);
  }, [changeLevel]);

  useEffect(() => {
    generatePlayers();
    setupKeyboardInput();

    preloadedImagesPromise.then((sprites) => {
      setLoadedSprites(sprites);

      // Load initial level if no level is loaded yet
      if (!levelData) {
        changeLevel(FIRST_LEVEL);
      }
    });

    return () => {
      window.keyState = null;
    };
  }, []);

  // Update game state when level data changes
  useEffect(() => {
    if (levelData && loadedSprites) {
      // Reset entities and blocks when changing levels
      setEntities([]);
      blocks = [];

      // Update game properties based on level data
      setLevelBackground(levelData.backgroundColor);
      mapType = levelData.mapType || 'overworld';

      // Generate blocks from the new level map
      blocks = generateBlocksFromMap(levelData.map, loadedSprites);

      mapWidth = levelData.map[0].length * TILE_SIZE;
      mapHeight = levelData.map.length * TILE_SIZE;
    }
  }, [currentLevel, levelData, loadedSprites]);

  useEffect(() => {
    const handleKeyUpdate = (keys) => {
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) => {
          player.keys = {
            left: keys['a'] || false,
            right: keys['d'] || false,
            up: keys[' '] || keys['w'] || keys['arrowup'] || false,
            b: keys['b'] || false,
            down: keys['s'] || false,
          };
          return player;
        })
      );
    };

    subscribeToKeys(handleKeyUpdate);
  }, []);

  const generatePlayers = () => {
    let currPlayers = [];

    // Get player starting position from level data if available
    const startX = TILE_SIZE * 2;
    const startY = (mapType === "underground" ? TILE_SIZE * 2 : TILE_SIZE * 10);

    for (let i = 0; i < population; i++) {
      const player = new Player(
        startX,
        startY,
        collisionRef.current,
        addItemCallback
      );

      player.changeHitboxSize(0, 3, 0, 3);

      // Initialize player keys with gamepad input (empty or default values initially)
      player.keys = {
        left: false,
        right: false,
        up: false,
        down: false,
        b: false,
      };

      currPlayers.push(player);
    }

    setPlayers(currPlayers);
  };

  const generateBlocksFromMap = useMemo(() => (mapData, loadedSprites) => {
    if (!mapData || !loadedSprites) {
      return [];
    }

    // Factory function to create block instances based on type
    const createBlock = (type, x, y, sprite, blockContent, blockContentQuantity, layer) => {
      // Common properties for all blocks
      const props = {
        x: x * TILE_SIZE,
        y: y * TILE_SIZE,
        width: sprite.w || TILE_SIZE,
        height: sprite.h || TILE_SIZE,
        image: sprite.image,
        collision: collisionRef.current,
        solid: sprite.solid || false,
        content: blockContent,
        layer
      };

      // Create specific block types based on id
      switch (type) {
        case "mystery":
          return new MysteryBlock(
            props.x, props.y, props.width, props.height, props.image,
            props.solid, props.content, blockContentQuantity, props.collision, props.layer
          );
        case "pipeConnection":
          return new PipeConnection(
            props.x, props.y, props.width, props.height, props.image,
            props.collision, props.solid, props.content, props.layer
          );
        case "platform":
          return new Platform(
            props.x, props.y, props.width, props.height, props.image,
            props.collision, props.solid, props.content, props.layer
          );
        case "pipeTop":
          const plantID = `plant_${uuidv4()}`;

          // Handle piranha plant if needed
          if (blockContent && (blockContent.type === "plant" || blockContent.type === "plant_level")) {
            const piranhaPlant = new PiranhaPlant(
              props.x, props.y, props.collision, plantID, props.layer
            );
            addItemCallback(piranhaPlant);
          }
          return new PipeTop(
            props.x, props.y, props.width, props.height, props.image,
            props.collision, props.solid, props.content, plantID, props.layer
          );
        case "pipe":
          // Handle pipe with level transition
          return new Block(
            props.x, props.y, props.width, props.height, type,
            props.image, props.solid, props.content, blockContentQuantity,
            props.collision, props.layer
          );
        case "flagPole":
          let nextLevel = blockContent?.level || null;
          const flagpole = new Flagpole(
            props.x, props.y, props.width, props.height, props.image,
            props.collision, props.solid, nextLevel, props.layer
          );

          flagpole.changeHitboxSize(0, 12, 0, 12);

          addItemCallback(flagpole);
          return;
        case "flag":
          const flag = new Flag(
            props.x, props.y, props.width, props.height, props.image,
            props.collision, props.solid, props.layer
          );

          addItemCallback(flag);
          return;
        case "coinUnderground":
          const coin = new BigCoin(
            props.x, props.y, props.width, props.height, props.image, addItemCallback,
            props.collision, props.solid, props.layer
          );

          addItemCallback(coin);
          return;
        default:
          // Default block type
          return new Block(
            props.x, props.y, props.width, props.height, type,
            props.image, props.solid, props.content, blockContentQuantity,
            props.collision, props.layer
          );
      }
    };

    // Handle enemy creation
    const createEnemy = (type, x, y, layer) => {
      const xPos = x * TILE_SIZE;
      const yPos = y * TILE_SIZE;

      switch (type) {
        case "goomba":
          return new Goomba(xPos, yPos, collisionRef.current, layer);
        case "koopa":
        case "koopaRed":
          return new Koopa(
            xPos, yPos, collisionRef.current, addItemCallback,
            type === "koopaRed", layer
          );
        default:
          return null;
      }
    };

    // Process the map data
    return mapData.flatMap((row, rowIndex) =>
      row.map((tileId, colIndex) => {
        if (tileId == null) return null;

        let sprite, blockContent = null, blockContentQuantity = 1;
        let type = null;

        // Handle object vs direct ID
        if (typeof tileId === 'object') {
          // Handle object notation (tileId is an object with id, content, etc.)
          if (tileId.id) {
            type = tileId.id;
            sprite = loadedSprites[tileId.id];
            blockContent = tileId.content || null;
            blockContentQuantity = tileId.content?.quantity || 1;
          } else {
            // If no id but still an object, might be a direct sprite reference
            sprite = loadedSprites[tileId];
            type = tileId;
          }
        } else {
          // Handle string/number ID (direct reference)
          sprite = loadedSprites[tileId];
          type = tileId;
        }

        // Handle missing sprites
        if (!sprite) {
          console.warn(`Sprite not found for tile ID: ${JSON.stringify(tileId)} at [${rowIndex}, ${colIndex}]`);
          return null;
        }

        const layer = sprite.layer || 0;

        // Handle enemies (create and add to game)
        if (type === "goomba" || type === "koopa" || type === "koopaRed") {
          const enemy = createEnemy(type, colIndex, rowIndex, layer);

          if (enemy instanceof Koopa) {
            enemy.changeHitboxSize(TILE_SIZE * 0.5, 0, 0, 0);
          }

          if (enemy) {
            addItemCallback(enemy);
          }
          return null; // Enemies are added via callback, not returned
        }

        // Create appropriate block type
        return createBlock(
          type,
          colIndex,
          rowIndex,
          sprite,
          blockContent,
          blockContentQuantity,
          layer
        );
      }).filter(Boolean) // Remove nulls
    );
  }, [collisionRef, addItemCallback]); // Added dependencies

  useEffect(() => {
    const gameLoop = createGameLoop({
      maxStep: 0.05,
      targetFPS: 144,
      onUpdate: ({ delta, gameDelta, gameTime, fps, actualFPS }) => {
        const gamepadState = activeGamepadIndex !== null ? readGamepadInput(activeGamepadIndex) : null;

        if (blocks.length > 0) {
          if (entities && entities.length > 0) {
            for (let i = entities.length - 1; i >= 0; i--) {
              const entity = entities[i];
              // Check if it's a Fireball and needs full update
              if (entity instanceof Fireball) {
                entity.update(delta);
              } else if (entity instanceof Goomba || entity instanceof Koopa || entity instanceof Shell || entity instanceof PiranhaPlant) {
                entity.update(delta, entities);
                entity.animate(delta);
              } else if (entity.animate) {
                entity.animate(delta);
              }

              // Remove collected or marked for removal entities
              if (entity.isCollected || entity.remove) {
                setEntities(prev => prev.filter((_, index) => index !== i));
              }
            }
          }

          if (blocks && blocks.length > 0) {
            blocks.forEach((block) => {
              if (block.animate) block.animate(delta);
              block.update?.(delta);

              if (block.fragments && block.fragments.length > 0) {
                block.updateAllFragments();
              }
            });

            // Remove broken blocks
            for (let i = blocks.length - 1; i >= 0; i--) {
              if (blocks[i].broken && (!blocks[i].fragments || blocks[i].fragments.length === 0)) {
                blocks.splice(i, 1);
              }
            }
          }

          if (players && players.length > 0) {

            players.forEach((player) => {
              if (gamepadState) {
                // Map gamepad buttons to player keys
                player.keys.left = gamepadState.left || gamepadState.dLeft;
                player.keys.right = gamepadState.right || gamepadState.dRight;
                player.keys.up = gamepadState.xButton || gamepadState.dUp;
                player.keys.down = gamepadState.down || gamepadState.dDown;
                player.keys.b = gamepadState.circleButton || gamepadState.rightTrigger;
              }

              player.update?.(delta, entities);
              player.animate?.(delta);

              playerX = player.x;
            });
          }

          if (scores && scores.length > 0) {
            scores.forEach((score) => {
              score.update(delta)
            });

            for (let i = scores.length - 1; i >= 0; i--) {
              if (scores[i].remove) {
                scores.splice(i, 1);
              }
            }
          }
        }

        camera.updateCamera(delta);
        drawLevelRef.current?.renderFrame(delta);
      }
    });

    gameLoop.start();
    return () => gameLoop.stop();
  }, [players, entities]);

  useEffect(() => {
    window.addEventListener('gamepadconnected', () => {
      console.log('Gamepad connected');

      // Delay the key press by 2 seconds
      setTimeout(() => {
        // Create the keydown event for the Ctrl key
        const ctrlKeyEvent = new KeyboardEvent('keydown', {
          key: 'Control',
          code: 'ControlLeft',  // or 'ControlRight' depending on which side you want
          keyCode: 17,          // The keyCode for the Control key
          ctrlKey: true,        // Mark the control key as pressed
          bubbles: true,        // Allow event bubbling
          cancelable: true,     // Allow the event to be cancelled
        });

        document.dispatchEvent(ctrlKeyEvent);

        // Create the keyup event for the Ctrl key
        const ctrlKeyReleaseEvent = new KeyboardEvent('keyup', {
          key: 'Control',
          code: 'ControlLeft',
          keyCode: 17,
          ctrlKey: false,
          bubbles: true,
          cancelable: true,
        });

        document.dispatchEvent(ctrlKeyReleaseEvent);
      }, 100);  // 2-second delay (2000 ms)
    });
  }, []);



  if (!levelData || blocks.length === 0) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <p className="text-white">Loading level {currentLevel}...</p>
      </div>
    );
  }

  return (
    <>
      <div
        ref={gameRef}
        className="w-screen h-screen flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: 'black' }}
      >
        <DrawLevel
          ref={drawLevelRef}
          players={players}
          entities={entities}
          cameraX={camera.cameraX}
          backgroundColor={levelBackground}
          style={{
            width: '100%',
            height: '100%'
          }}
        />
      </div>
    </>
  );
};

export default GameWrapper;