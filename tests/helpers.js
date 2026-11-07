// Shared test helpers (not a test file itself: node --test only runs *.test.js).
import { STEP } from '../src/config.js';
import { beginStep, createInput, queueKey } from '../src/input.js';
import { parseLevel } from '../src/level.js';
import { updatePlayer } from '../src/player.js';

export function makeLevel(rows) {
  return parseLevel({ id: 'test', name: 'Test', rows });
}

const KEYS = { left: 'ArrowLeft', right: 'ArrowRight', down: 'ArrowDown', jump: 'Space', run: 'ShiftLeft' };

// Holds and lets go of actions, and steps a player with them.
export function createDriver() {
  const input = createInput();
  return {
    input,
    press(action) { queueKey(input, KEYS[action], true); },
    release(action) { queueKey(input, KEYS[action], false); },
    step(player, level, steps = 1) {
      const events = [];
      for (let i = 0; i < steps; i++) {
        beginStep(input);
        events.push(...updatePlayer(player, input, level, STEP));
      }
      return events;
    },
  };
}
