import ground from '../assets/Sprites/GroundBlock.png';
import mystery from '../assets/Sprites/MysteryBlock1.png';
import brick from '../assets/Sprites/Brick.png';
import hard from '../assets/Sprites/HardBlock.png';
import hardBlockUnderground from '../assets/Sprites/HardBlock_underground.png';
import hill1 from '../assets/Sprites/Hill1.png';
import hill2 from '../assets/Sprites/Hill2.png';
import cloud1 from '../assets/Sprites/Cloud1.png';
import cloud2 from '../assets/Sprites/Cloud2.png';
import cloud3 from '../assets/Sprites/Cloud3.png';
import bush1 from '../assets/Sprites/Bush1.png';
import bush2 from '../assets/Sprites/Bush2.png';
import bush3 from '../assets/Sprites/Bush3.png';
import underground from '../assets/Sprites/UndergroundBlock.png';
import undergroundBrick from '../assets/Sprites/UndergroundBrick.png';
import pipeTop from '../assets/Sprites/PipeTop.png';
import pipeBottom from '../assets/Sprites/PipeBottom.png';
import coinUnderground from '../assets/Sprites/Coin_Underground.png';
import platform from '../assets/Sprites/platform.png';
import pipeConnection from '../assets/Sprites/PipeConnection.png';
import castle from '../assets/Sprites/Castle.png';
import flagPole from '../assets/Sprites/FlagPole.png';
import flag from '../assets/Sprites/Flag.png';
import goomba from '../assets/Sprites/Goomba_Walk1.png';
import koopa from '../assets/Sprites/Koopa_Walk_Green1.png';
import koopaRed from '../assets/Sprites/Koopa_Walk_Red1.png';

// 0 - Background items
// 1 - Solid blocks
// 2 - Foreground

export const imageList = [
  // SOLID BLOCKS - Layer 2
  { id: 'ground', url: ground, w: 32, h: 32, solid: true, layer: 2 },
  { id: 'mystery', url: mystery, w: 32, h: 32, solid: true, layer: 2 },
  { id: 'brick', url: brick, w: 32, h: 32, solid: true, layer: 2 },
  { id: 'hard', url: hard, w: 32, h: 32, solid: true, layer: 2 },
  { id: 'pipeTop', url: pipeTop, w: 64, h: 32, solid: true, layer: 4 },
  { id: 'pipeBottom', url: pipeBottom, w: 64, h: 32, solid: true, layer: 4 },
  { id: 'underground', url: underground, w: 32, h: 32, solid: true, layer: 2 },
  { id: 'undergroundBrick', url: undergroundBrick, w: 32, h: 32, solid: true, layer: 2 },
  { id: 'hardBlockUnderground', url: hardBlockUnderground, w: 32, h: 32, solid: true, layer: 2 },
  { id: 'platform', url: platform, w: 96, h: 32, solid: true, layer: 2 },
  { id: 'pipeConnection', url: pipeConnection, w: 128, h: 64, solid: true, layer: 4 },

  // BACKGROUND ITEMS - Layer 0
  { id: 'hill1', url: hill1, w: 160, h: 96, solid: false, layer: 0 },
  { id: 'hill2', url: hill2, w: 160, h: 96, solid: false, layer: 0 },
  { id: 'cloud1', url: cloud1, w: 96, h: 64, solid: false, layer: 0 },
  { id: 'cloud2', url: cloud2, w: 128, h: 64, solid: false, layer: 0 },
  { id: 'cloud3', url: cloud3, w: 160, h: 64, solid: false, layer: 0 },
  { id: 'bush1', url: bush1, w: 96, h: 32, solid: false, layer: 0 },
  { id: 'bush2', url: bush2, w: 128, h: 32, solid: false, layer: 0 },
  { id: 'bush3', url: bush3, w: 160, h: 32, solid: false, layer: 0 },
  { id: 'coinUnderground', url: coinUnderground, w: 32, h: 32, solid: false, layer: 0 },

  // FOREGROUND ITEMS - Layer 3
  { id: 'castle', url: castle, w: 160, h: 160, solid: false, layer: 3 },
  { id: 'flagPole', url: flagPole, w: 32, h: 320, solid: false, layer: 3 },
  { id: 'flag', url: flag, w: 64, h: 32, solid: false, layer: 3 },

  // ENEMIES - Layer 2 (still in-world)
  { id: 'goomba', url: goomba, w: 32, h: 32, solid: false, layer: 2 },
  { id: 'koopa', url: koopa, w: 32, h: 64, solid: false, layer: 2 },
  { id: 'koopaRed', url: koopaRed, w: 32, h: 64, solid: false, layer: 2 },
];

// Create a lookup object by ID for easier access
export const imageById = imageList.reduce((acc, img) => {
  acc[img.id] = img;
  return acc;
}, {});