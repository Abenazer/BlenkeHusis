// One level being played: the level, Lelle, his animation and the camera,
// advanced one fixed step at a time. Pure: no DOM, and the step length is
// passed in.
import { createAnimation, updateAnimation } from './animation.js';
import { TILE } from './config.js';
import { createCamera, snapCamera, updateCamera } from './camera.js';
import { parseLevel, pixelHeight } from './level.js';
import { createPlayer, updatePlayer } from './player.js';

// How far below the level Lelle falls before he counts as lost in a pit.
const PIT_DEPTH = 48;

function startPosition(level) {
  return { x: (level.start.col + 0.5) * TILE, y: (level.start.row + 1) * TILE };
}

export function createWorld(definition) {
  const level = parseLevel(definition);
  const start = startPosition(level);
  const player = createPlayer(start.x, start.y);
  return { level, player, animation: createAnimation(), camera: createCamera(player, level), time: 0 };
}

function respawn(world) {
  const start = startPosition(world.level);
  world.player = createPlayer(start.x, start.y);
  world.animation = createAnimation();
  snapCamera(world.camera, world.player, world.level);
}

// Advances the world by dt and returns the step's events.
export function stepWorld(world, input, dt) {
  const { player, camera } = world;
  player.px = player.x;
  player.py = player.y;
  camera.px = camera.x;
  camera.py = camera.y;

  const events = updatePlayer(player, input, world.level, dt);
  if (player.y > pixelHeight(world.level) + PIT_DEPTH) {
    respawn(world);
    events.push({ type: 'fell' });
  } else {
    updateAnimation(world.animation, player, dt);
    updateCamera(camera, player, world.level, dt);
  }
  world.time += dt;
  return events;
}
