// The points that mark Blenke's way through a level: checkpoints, where he
// starts again after a lost life once he has passed one, and the goal,
// which completes the level when he touches it. Each stands on the bottom
// of the tile it is written in. Pure: no DOM.

// A checkpoint is a phone booth, the goal
// a flagpole. A checkpoint's size places it; its picture may be larger
// and stands on the middle of its foot.
export const CHECKPOINT_SIZE = { width: 12, height: 28 };
export const GOAL_SIZE = { width: 16, height: 64 };
// Only the goal's pole counts as touching it, not the flag.
const POLE_WIDTH = 4;

function standing(size, col, row, tile) {
  return {
    col,
    row,
    x: (col + 0.5) * tile - size.width / 2,
    y: (row + 1) * tile - size.height,
    w: size.width,
    h: size.height,
  };
}

export function createCheckpoint(col, row, tile) {
  // passedTime: how long ago Blenke passed it, once he has.
  return { ...standing(CHECKPOINT_SIZE, col, row, tile), passed: false, passedTime: 0 };
}

// Where Blenke starts again from a checkpoint: the middle of its feet.
export function checkpointStart(checkpoint) {
  return { x: checkpoint.x + checkpoint.w / 2, y: checkpoint.y + checkpoint.h };
}

// A checkpoint counts as passed once Blenke's middle has come level with
// its own, at whatever height.
export function hasPassed(checkpoint, player) {
  return player.x + player.w / 2 >= checkpoint.x + checkpoint.w / 2;
}

export function createGoal(col, row, tile) {
  return standing(GOAL_SIZE, col, row, tile);
}

// The part of the goal that counts as reaching it: the pole, top to foot,
// which stands at the goal's left.
export function goalPole(goal) {
  return { x: goal.x, y: goal.y, w: POLE_WIDTH, h: goal.h };
}
