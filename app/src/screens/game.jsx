import React, { useEffect, useMemo, useRef, useState } from 'react';
import DrawLevel from '../utils/drawLevel.jsx';
import stage from '../assets/levels/level_1-1.json';
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

export let blocks = [];
export let mapType = [];
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

const Game = () => {
  const [level, setLevel] = useState(0);
  const [levelBackground, setLevelBackground] = useState('#000000');
  const [loadedSprites, setLoadedSprites] = useState(null);

  const [population, setPopulation] = useState(1);
  const [players, setPlayers] = useState([]);

  const [entities, setEntities] = useState([]);

  const camera = useCamera();
  const gameRef = useRef(null);
  const drawLevelRef = useRef(null);

  const addItemCallback = (item) => {
    setEntities((prevItems) => [...prevItems, item]);
  };

  const collisionRef = useRef(new Collision(addItemCallback));

  useEffect(() => {
    setupKeyboardInput();

    preloadedImagesPromise.then((sprites) => {
      setLoadedSprites(sprites);
      setLevelBackground(stage.backgroundColor);
      mapType = stage.mapType || 'overworld';
    });

    return () => {
      window.keyState = null;
    };
  }, []);

  useEffect(() => {
    if (loadedSprites) {
      blocks = generateBlocksFromMap(stage.map, loadedSprites);

      mapWidth = stage.map[0].length * TILE_SIZE;
      mapHeight = stage.map.length * TILE_SIZE;
    }

    generatePlayers();
  }, [level, loadedSprites, population]);

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
    for (let i = 0; i < population; i++) {
      currPlayers.push(
        new Player(
          TILE_SIZE * 2,
          TILE_SIZE * 10,
          collisionRef.current,
          addItemCallback
        )
      );
    }

    setPlayers(currPlayers);
  };

  const generateBlocksFromMap = useMemo(() => (mapData, loadedSprites) => {
    return mapData.flatMap((row, rowIndex) =>
      row.map((tileId, colIndex) => {
        if (tileId == null) return null;

        let sprite;
        let blockContent = null;
        let blockContentQuantity = 1;
        if (tileId.id) {
          sprite = loadedSprites[tileId.id];
          blockContent = tileId.content;
          blockContentQuantity = tileId.content.quantity;
        } else {
          sprite = loadedSprites[tileId];
        }

        if (sprite === undefined || sprite === null) return null;

        if (tileId.id === "mystery") {
          return new MysteryBlock(
            colIndex * TILE_SIZE,
            rowIndex * TILE_SIZE,
            sprite.w || TILE_SIZE,
            sprite.h || TILE_SIZE,
            sprite.image,
            collisionRef.current,
            sprite.solid || false,
            blockContent,
          );
        } else if (tileId.id === "platform") {
          return new Platform(
            colIndex * TILE_SIZE,
            rowIndex * TILE_SIZE,
            sprite.w || TILE_SIZE,
            sprite.h || TILE_SIZE,
            sprite.image,
            collisionRef.current,
            sprite.solid || false,
            blockContent,
          );
        } else if (tileId.id === "pipeTop") {
          const piranhaPlant = new PiranhaPlant(
            colIndex * TILE_SIZE,
            rowIndex * TILE_SIZE,
            collisionRef.current,
          );

          addItemCallback(piranhaPlant);

          return new PipeTop(
            colIndex * TILE_SIZE,
            rowIndex * TILE_SIZE,
            sprite.w || TILE_SIZE,
            sprite.h || TILE_SIZE,
            sprite.image,
            collisionRef.current,
            sprite.solid || false,
            blockContent
          );
        } else if (tileId === "goomba") {
          const goomba = new Goomba(
            colIndex * TILE_SIZE,
            rowIndex * TILE_SIZE,
            collisionRef.current,
          );

          addItemCallback(goomba);
        } else if (tileId === "koopa" || tileId === "koopaRed") {
          const koopa = new Koopa(
            colIndex * TILE_SIZE,
            rowIndex * TILE_SIZE,
            collisionRef.current,
            addItemCallback,
            tileId === "koopaRed",
          );

          addItemCallback(koopa);
        } else {
          return new Block(
            colIndex * TILE_SIZE,
            rowIndex * TILE_SIZE,
            sprite.w || TILE_SIZE,
            sprite.h || TILE_SIZE,
            tileId,
            sprite.image,
            sprite.solid || false,
            blockContent,
            blockContentQuantity,
            collisionRef.current,
          );
        }
      }).filter(Boolean) // Remove nulls
    );
  }, []);

  useEffect(() => {
    const gameLoop = createGameLoop({
      maxStep: 0.05,
      onUpdate: ({ delta, gameDelta, gameTime }) => {
        const fps = Math.round(1 / delta);
        if (blocks.length > 0) {
          if (entities) {
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

          // Remove broken blocks
          for (let i = entities.length - 1; i >= 0; i--) {
            if (entities[i].isCollected) {
              entities.splice(i, 1);
            }
          }

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

          if (players) {
            players.forEach((player) => {
              player.update?.(delta, entities);
              player.animate?.(delta);

              playerX = player.x;
            });
          }
        }

        camera.updateCamera(delta);
        drawLevelRef.current?.renderFrame(delta);
      }
    });

    gameLoop.start();
    return () => gameLoop.stop();
  }, [players, entities]);

  if (blocks.length === 0) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
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
  );
};

export default Game;
