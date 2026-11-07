// A camera that follows Lelle smoothly: it looks ahead in the direction he
// runs, follows height changes only when he lands or nears the edge of the
// screen, and never shows anything outside the level. Pure: no DOM.
import { VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { pixelHeight, pixelWidth } from './level.js';

const LOOK_AHEAD = 36;
const LOOK_SPEED = 90;
const MOVING = 20;
const FOLLOW_X = 10;
const FOLLOW_Y = 6;
// Where Lelle's feet sit on the screen, as a share of its height.
const FEET_AT = 0.68;
// Outside this band of the screen the camera follows him even in the air.
const BAND_TOP = 0.22;
const BAND_BOTTOM = 0.86;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function clampToLevel(camera, level) {
  const maxX = pixelWidth(level) - VIEW_WIDTH;
  const maxY = pixelHeight(level) - VIEW_HEIGHT;
  camera.x = maxX > 0 ? clamp(camera.x, 0, maxX) : maxX / 2;
  camera.y = maxY > 0 ? clamp(camera.y, 0, maxY) : maxY / 2;
}

function desiredX(camera, player) {
  return player.x + player.w / 2 + camera.look - VIEW_WIDTH / 2;
}

function desiredY(player) {
  return player.y + player.h - VIEW_HEIGHT * FEET_AT;
}

export function createCamera(player, level) {
  const camera = { x: 0, y: 0, px: 0, py: 0, look: 0, targetY: 0 };
  snapCamera(camera, player, level);
  return camera;
}

// Jumps straight to Lelle, e.g. at the start or after a respawn.
export function snapCamera(camera, player, level) {
  camera.look = 0;
  camera.x = desiredX(camera, player);
  camera.targetY = desiredY(player);
  camera.y = camera.targetY;
  clampToLevel(camera, level);
  camera.px = camera.x;
  camera.py = camera.y;
}

export function updateCamera(camera, player, level, dt) {
  const lookTarget = Math.abs(player.vx) > MOVING ? player.facing * LOOK_AHEAD : camera.look;
  camera.look += clamp(lookTarget - camera.look, -LOOK_SPEED * dt, LOOK_SPEED * dt);

  const feetOnScreen = (player.y + player.h - camera.y) / VIEW_HEIGHT;
  if (player.onGround || feetOnScreen < BAND_TOP || feetOnScreen > BAND_BOTTOM) {
    camera.targetY = desiredY(player);
  }
  camera.x += (desiredX(camera, player) - camera.x) * (1 - Math.exp(-FOLLOW_X * dt));
  camera.y += (camera.targetY - camera.y) * (1 - Math.exp(-FOLLOW_Y * dt));
  clampToLevel(camera, level);
}
