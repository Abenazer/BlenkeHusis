// Escalators: a diagonal run of / (running up) or z (running down) in a
// level is one escalator, rising to the right or to the left as the run
// does, from the bottom left corner of its lowest tile to the top right
// of its highest (mirrored when it rises to the left), so a floor at
// either end meets it level. To Blenke it is a slope that carries: he
// stands on it, walks up and down it, and its belt takes him along at a
// steady speed; its steps are only drawn. Like a moving platform it holds
// up only what lands on it from above. Pure: no DOM.
import { TILE } from './config.js';

export const ESCALATOR_CHARS = { '/': 'up', z: 'down' };
// How fast the belt carries, sideways and so up or down alike (px/s).
export const ESCALATOR_SPEED = 30;
// The drawn steps' width and rise: two to a tile.
export const STEP_PITCH = 8;

// The slope's height at x: { x, w } is its extent, yLeft its height at
// x, and slope -1 when it rises to the right, 1 when to the left.
export function surfaceAt(escalator, x) {
  return escalator.yLeft + escalator.slope * (x - escalator.x);
}

// markers: the level's escalator markers, in reading order. Returns the
// escalators, each { direction, slope, belt, x, w, yLeft, dx }: belt is
// which way it carries sideways (1 right, -1 left), dx how far it carried
// in the last step. A run that bends, forks or meets another fails.
export function joinEscalators(id, markers) {
  const at = new Map();
  for (const marker of markers) if (marker.type === 'escalator') at.set(`${marker.col},${marker.row}`, marker);
  const same = (marker, col, row) => {
    const other = at.get(`${col},${row}`);
    return other && other.direction === marker.direction ? other : null;
  };
  const fail = (marker) => {
    throw new Error(`Level ${id} has an escalator that bends, forks or joins another at column ${marker.col}, row ${marker.row}`);
  };
  const used = new Set();
  const escalators = [];
  for (const bottom of at.values()) {
    if (same(bottom, bottom.col - 1, bottom.row + 1) || same(bottom, bottom.col + 1, bottom.row + 1)) continue;
    const upLeft = same(bottom, bottom.col - 1, bottom.row - 1);
    if (upLeft && same(bottom, bottom.col + 1, bottom.row - 1)) fail(bottom);
    // A lone tile rises to the right.
    const step = upLeft ? -1 : 1;
    let tiles = 0;
    for (let marker = bottom; marker; marker = same(marker, marker.col + step, marker.row - 1)) {
      if (used.has(marker) || same(marker, marker.col - step, marker.row - 1)) fail(marker);
      used.add(marker);
      tiles += 1;
    }
    const slope = -step;
    const leftCol = step === 1 ? bottom.col : bottom.col - tiles + 1;
    escalators.push({
      direction: bottom.direction,
      slope,
      belt: (bottom.direction === 'up' ? 1 : -1) * step,
      x: leftCol * TILE,
      w: tiles * TILE,
      yLeft: step === 1 ? (bottom.row + 1) * TILE : (bottom.row - tiles + 1) * TILE,
      dx: 0,
    });
  }
  for (const marker of at.values()) if (!used.has(marker)) fail(marker);
  return escalators;
}

// How far each belt carries in a step of dt.
export function updateEscalators(escalators, dt) {
  for (const escalator of escalators) escalator.dx = escalator.belt * ESCALATOR_SPEED * dt;
}

// The steps to draw at `time`, left to right, each { x, y }: its left edge
// and its tread, STEP_PITCH wide with its outer corner on the slope. The
// first and last reach past the escalator's ends, to be cut off there.
export function escalatorSteps(escalator, time) {
  const travel = escalator.belt * ESCALATOR_SPEED * time;
  const phase = ((travel % STEP_PITCH) + STEP_PITCH) % STEP_PITCH;
  const steps = [];
  for (let x = escalator.x - STEP_PITCH + phase; x < escalator.x + escalator.w; x += STEP_PITCH) {
    steps.push({ x, y: Math.min(surfaceAt(escalator, x), surfaceAt(escalator, x + STEP_PITCH)) });
  }
  return steps;
}
