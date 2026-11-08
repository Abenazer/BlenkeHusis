// Keyboard input as actions. Key events are queued as they arrive and applied
// at the start of each simulation step, so a key pressed and released between
// two steps still counts as pressed for one step. Pure: main.js feeds it key
// codes, the simulation reads actions.

// A key can mean more than one thing: the menus read up and confirm where
// the game reads jump. Every action a key means is pressed and held with it.
export const KEY_ACTIONS = {
  ArrowLeft: ['left'],
  KeyA: ['left'],
  ArrowRight: ['right'],
  KeyD: ['right'],
  ArrowDown: ['down'],
  KeyS: ['down'],
  ArrowUp: ['jump', 'up'],
  KeyW: ['jump', 'up'],
  Space: ['jump', 'confirm'],
  KeyZ: ['jump'],
  ShiftLeft: ['run'],
  ShiftRight: ['run'],
  KeyX: ['run'],
  // Pick up, throw, help, read.
  KeyC: ['act'],
  KeyE: ['act'],
  Enter: ['confirm'],
  NumpadEnter: ['confirm'],
  Escape: ['pause', 'back'],
  KeyP: ['pause'],
};

export function actionsForKey(code) {
  return KEY_ACTIONS[code] ?? [];
}

export function createInput() {
  return {
    keysDown: new Set(),
    held: new Set(),
    pressed: new Set(),
    released: new Set(),
    queue: [],
  };
}

// Returns whether the key means anything to the game, so the page can stop
// the browser scrolling on arrows and space.
export function queueKey(input, code, down) {
  if (actionsForKey(code).length === 0) return false;
  input.queue.push({ code, down });
  return true;
}

// The window lost focus: its keyup events will never arrive, so every key
// still down is let go.
export function releaseAll(input) {
  for (const code of input.keysDown) input.queue.push({ code, down: false });
}

function anyKeyDownFor(input, action) {
  for (const code of input.keysDown) {
    if (KEY_ACTIONS[code].includes(action)) return true;
  }
  return false;
}

export function beginStep(input) {
  input.pressed.clear();
  input.released.clear();
  for (const { code, down } of input.queue) {
    const actions = KEY_ACTIONS[code];
    if (down) {
      if (input.keysDown.has(code)) continue;
      input.keysDown.add(code);
      for (const action of actions) {
        if (input.held.has(action)) continue;
        input.held.add(action);
        input.pressed.add(action);
      }
    } else if (input.keysDown.delete(code)) {
      for (const action of actions) {
        if (anyKeyDownFor(input, action)) continue;
        input.held.delete(action);
        input.released.add(action);
      }
    }
  }
  input.queue.length = 0;
}

export function isHeld(input, action) {
  return input.held.has(action);
}

export function wasPressed(input, action) {
  return input.pressed.has(action);
}
