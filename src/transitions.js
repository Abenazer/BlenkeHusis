// How one screen gives way to the next. A level opens with an iris on
// Blenke, and closes on him wherever the world already waits before it
// moves on: after a lost life (to open again where he starts over), at the
// goal (or the filling station) before the report, and after the last life
// before the game over.
// The screens around the play fade in from the palette's ink. The iris is
// worked out from the world's own clocks and the fade from the screen's,
// so nothing waits on a transition and no key is held back. Pausing
// comes and goes at once. Pure: no DOM; render.js draws the cover.
import { VIEW_HEIGHT, VIEW_WIDTH } from './config.js';
import { completeLeft, GAME_OVER_TIME } from './world.js';

// How long the iris takes to close or to open, and a screen to fade in.
export const IRIS_TIME = 0.5;
export const FADE_TIME = 0.2;

function share(value) {
  return Math.min(1, Math.max(0, value));
}

// How far the iris over the world is closed, 0 (open) to 1 (shut).
function irisClosed(world) {
  if (world.over) return share((world.overTime - (GAME_OVER_TIME - IRIS_TIME)) / IRIS_TIME);
  if (world.complete) return share((IRIS_TIME - completeLeft(world)) / IRIS_TIME);
  if (world.down > 0) return share((IRIS_TIME - world.down) / IRIS_TIME);
  return share(1 - world.arrived / IRIS_TIME);
}

// The iris over a world, { kind: 'iris', closed, x, y } with its centre on
// Blenke's middle in view pixels (kept on the view when he has fallen out
// of it), or null while it is open.
export function irisFor(world) {
  const closed = irisClosed(world);
  if (closed === 0) return null;
  const { player, camera } = world;
  return {
    kind: 'iris',
    closed,
    x: Math.min(VIEW_WIDTH, Math.max(0, player.x + player.w / 2 - camera.x)),
    y: Math.min(VIEW_HEIGHT, Math.max(0, player.y + player.h / 2 - camera.y)),
  };
}

// The iris over the level being played (or paused), if it is closing or
// opening.
export function irisOver(game) {
  if (!game.world || (game.screen !== 'playing' && game.screen !== 'paused')) return null;
  return irisFor(game.world);
}

// The fade over a screen just come up, { kind: 'fade', closed }, or null.
export function fadeOver(game) {
  if (!game.fading || game.screenTime >= FADE_TIME) return null;
  return { kind: 'fade', closed: 1 - game.screenTime / FADE_TIME };
}
