// Shared test helpers (not a test file itself: node --test only runs *.test.js).
import { readdirSync, readFileSync } from 'node:fs';
import { STEP } from '../src/config.js';
import { beginStep, createInput, queueKey } from '../src/input.js';
import { parseLevel } from '../src/level.js';
import { updatePlayer } from '../src/player.js';

export function makeLevel(rows) {
  return parseLevel({ id: 'test', name: 'Test', rows });
}

const KEYS = { left: 'ArrowLeft', right: 'ArrowRight', down: 'ArrowDown', jump: 'Space', run: 'ShiftLeft', act: 'KeyC' };

// Holds and lets go of actions, and steps a player with them.
export function createDriver() {
  const input = createInput();
  return {
    input,
    press(action) { queueKey(input, KEYS[action], true); },
    release(action) { queueKey(input, KEYS[action], false); },
    // options as updatePlayer takes them: { platforms, speed, flying }.
    step(player, level, steps = 1, options = {}) {
      const events = [];
      for (let i = 0; i < steps; i++) {
        beginStep(input);
        events.push(...updatePlayer(player, input, level, STEP, options));
      }
      return events;
    },
  };
}

// The modules that send the world's events; the screens' own come from
// game.js and menu.js.
export const WORLD_SOURCES = ['world.js', 'player.js', 'ai.js'];

// Every event type the given modules in src/ send (all of them by
// default): the literal types they push, and the ways an enemy can be hit
// (defeating it sends the way as the type).
export function sentEventTypes(files = readdirSync(new URL('../src/', import.meta.url)).filter((file) => file.endsWith('.js'))) {
  const types = new Set();
  for (const file of files) {
    const source = readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8');
    for (const [, type] of source.matchAll(/events\.push\(\{ type: '(\w+)'/g)) types.add(type);
    for (const [, how] of source.matchAll(/hitEnemy\(world, \w+, '(\w+)'/g)) types.add(how);
  }
  return [...types];
}

// localStorage's interface over a Map, for the save.
export function fakeStorage(entries = {}) {
  const map = new Map(Object.entries(entries));
  return {
    map,
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  };
}
