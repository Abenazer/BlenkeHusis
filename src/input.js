// Keyboard and touch input as actions. Key events (and the touch controls'
// own keys, from touch.js) are queued as they arrive and applied
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
  // Sound off and on, everywhere but where a tag is signed (M is a letter).
  KeyM: ['mute'],
};

// The touch controls (touch.js) come in as keys of their own, kept apart
// so the controls screen, read from the key map, names only real keys.
export const TOUCH_ACTIONS = {
  TouchLeft: ['left'],
  TouchRight: ['right'],
  TouchDown: ['down'],
  TouchRun: ['run'],
  TouchJump: ['jump'],
  TouchAct: ['act'],
  TouchPause: ['pause'],
};

// What a key is called on the controls screen; a letter key is its letter.
const KEY_NAMES = {
  ArrowLeft: '←',
  ArrowRight: '→',
  ArrowUp: '↑',
  ArrowDown: '↓',
  Space: 'MELLANSLAG',
  ShiftLeft: 'SHIFT',
  ShiftRight: 'SHIFT',
  Enter: 'ENTER',
  NumpadEnter: 'ENTER',
  Escape: 'ESC',
};

export function keyName(code) {
  if (KEY_NAMES[code]) return KEY_NAMES[code];
  if (/^Key[A-Z]$/.test(code)) return code.slice(3);
  throw new Error(`The key '${code}' has no name for the controls screen`);
}

// The names of the keys that mean any of these actions, in the key map's
// order, each name once (both Shift keys are one SHIFT).
export function keyNamesFor(actions) {
  const names = Object.entries(KEY_ACTIONS)
    .filter(([, meanings]) => meanings.some((action) => actions.includes(action)))
    .map(([code]) => keyName(code));
  return [...new Set(names)];
}

export function actionsForKey(code) {
  return KEY_ACTIONS[code] ?? TOUCH_ACTIONS[code] ?? [];
}

export function createInput() {
  return {
    keysDown: new Set(),
    held: new Set(),
    pressed: new Set(),
    released: new Set(),
    queue: [],
    // What was typed (a character, or 'Backspace'), for this step and
    // waiting for the next.
    typed: [],
    textQueue: [],
    // What was tapped on a screen around the play (screens.js resolves a
    // tap to its target), for this step and waiting for the next.
    taps: [],
    tapQueue: [],
  };
}

// A tap on a screen, as the thing it hit: { kind: 'press', action } presses
// that action for one step, as a key would; any other kind ('menu',
// 'volume') is read by the screen it belongs to.
export function queueTap(input, target) {
  input.tapQueue.push(target);
}

// This step's tap of that kind, or null.
export function tapOf(input, kind) {
  return input.taps.find((target) => target.kind === kind) ?? null;
}

// Something typed, as the browser names it (event.key): one character, or
// Backspace. Returns whether it was taken. Unlike the keys, typing
// repeats while a key is held, as it does in any text field.
export function queueText(input, key) {
  if (key !== 'Backspace' && [...key].length !== 1) return false;
  input.textQueue.push(key);
  return true;
}

// Returns whether the key means anything to the game, so the page can stop
// the browser scrolling on arrows and space.
export function queueKey(input, code, down) {
  if (actionsForKey(code).length === 0) return false;
  input.queue.push({ code, down });
  return true;
}

// The window lost focus: its keyup events will never arrive, so every key
// still down is let go, and so is one pressed since the last step (after
// its press, which still counts).
export function releaseAll(input) {
  const down = new Set(input.keysDown);
  for (const { code, down: pressed } of input.queue) if (pressed) down.add(code);
  for (const code of down) input.queue.push({ code, down: false });
}

function anyKeyDownFor(input, action) {
  for (const code of input.keysDown) {
    if (actionsForKey(code).includes(action)) return true;
  }
  return false;
}

export function beginStep(input) {
  input.pressed.clear();
  input.released.clear();
  input.typed = input.textQueue;
  input.textQueue = [];
  input.taps = input.tapQueue;
  input.tapQueue = [];
  // A tap that presses is pressed and let go within the step.
  for (const target of input.taps) if (target.kind === 'press') input.pressed.add(target.action);
  for (const { code, down } of input.queue) {
    const actions = actionsForKey(code);
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
