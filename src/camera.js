// A camera that follows Blenke smoothly: it looks ahead in the direction he
// runs, follows height changes only when he lands or nears the edge of the
// screen, and never shows anything outside the level. It moves like a
// critically damped spring, so its speed changes gradually and never jumps,
// which is what makes the scrolling read as smooth. Pure: no DOM.
import { VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { pixelHeight, pixelWidth } from './level.js';

const LOOK_AHEAD = 36;
// Seconds the look-ahead and the camera take to settle (roughly).
const LOOK_TIME = 0.45;
const FOLLOW_TIME_X = 0.16;
const FOLLOW_TIME_Y = 0.22;
const MOVING = 20;
// Where Blenke's feet sit on the screen, as a share of its height.
const FEET_AT = 0.68;
// Outside this band of the screen the camera follows him even in the air.
const BAND_TOP = 0.22;
const BAND_BOTTOM = 0.86;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function clampAxis(camera, axis, velocity, max) {
  const clamped = max > 0 ? clamp(camera[axis], 0, max) : max / 2;
  if (clamped !== camera[axis]) camera[velocity] = 0;
  camera[axis] = clamped;
}

function clampToLevel(camera, level) {
  clampAxis(camera, 'x', 'vx', pixelWidth(level) - VIEW_WIDTH);
  clampAxis(camera, 'y', 'vy', pixelHeight(level) - VIEW_HEIGHT);
}

// Moves value toward target as a critically damped spring that settles in
// about smoothTime seconds (the approximation from Game Programming Gems 4,
// also behind Unity's SmoothDamp). Returns [value, velocity].
export function smoothDamp(value, target, velocity, smoothTime, dt) {
  const omega = 2 / smoothTime;
  const x = omega * dt;
  const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = value - target;
  const temp = (velocity + omega * change) * dt;
  return [target + (change + temp) * decay, (velocity - omega * temp) * decay];
}

function desiredX(camera, player) {
  return player.x + player.w / 2 + camera.look - VIEW_WIDTH / 2;
}

function desiredY(player) {
  return player.y + player.h - VIEW_HEIGHT * FEET_AT;
}

export function createCamera(player, level) {
  const camera = { x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0, look: 0, lookVelocity: 0, targetY: 0 };
  snapCamera(camera, player, level);
  return camera;
}

// Jumps straight to Blenke, e.g. at the start or after a respawn.
export function snapCamera(camera, player, level) {
  camera.look = 0;
  camera.lookVelocity = 0;
  camera.vx = 0;
  camera.vy = 0;
  camera.x = desiredX(camera, player);
  camera.targetY = desiredY(player);
  camera.y = camera.targetY;
  clampToLevel(camera, level);
  camera.px = camera.x;
  camera.py = camera.y;
}

export function updateCamera(camera, player, level, dt) {
  const lookTarget = Math.abs(player.vx) > MOVING ? player.facing * LOOK_AHEAD : camera.look;
  [camera.look, camera.lookVelocity] = smoothDamp(camera.look, lookTarget, camera.lookVelocity, LOOK_TIME, dt);

  const feetOnScreen = (player.y + player.h - camera.y) / VIEW_HEIGHT;
  if (player.onGround || feetOnScreen < BAND_TOP || feetOnScreen > BAND_BOTTOM) {
    camera.targetY = desiredY(player);
  }
  [camera.x, camera.vx] = smoothDamp(camera.x, desiredX(camera, player), camera.vx, FOLLOW_TIME_X, dt);
  [camera.y, camera.vy] = smoothDamp(camera.y, camera.targetY, camera.vy, FOLLOW_TIME_Y, dt);
  clampToLevel(camera, level);
}
