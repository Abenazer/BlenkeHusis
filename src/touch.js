// The touch controls: where the pad and the buttons sit on the screen, and
// which of them each finger holds. A finger that lands on the left part
// of the screen works the pad as long as it stays down: pushed left,
// right or down (diagonals give both) it walks or crouches, pushed past
// most of the pad's reach it runs. On the right, the act button takes the
// fingers near it and the jump button every other, and a finger sliding
// between them changes button. Pause is pressed where it stands. Every
// change goes into the input as touch keys (TOUCH_ACTIONS in input.js),
// so the simulation can't tell a finger from a key. Pure: no DOM; main.js
// feeds it the pointer events in screen pixels, render.js draws it.
import { TOUCH_ART } from './art/touch.js';
import { queueKey } from './input.js';

// The pictures are scaled so an art pixel is about this many CSS pixels,
// a thumb's size on a phone, but never so big that the pad takes more than
// PAD_SHARE of the screen's height.
export const TOUCH_UNIT = 3;
const PAD_SHARE = 0.42;
// Gaps from the screen's edges and between act and jump, in art pixels.
const MARGIN = 6;
const PAUSE_MARGIN = 3;
const ACT_GAP = 3;
// A finger landing left of this share of the width works the pad.
export const PAD_AREA = 0.45;
// Within this share of the pad's radius from its middle the pad does
// nothing; past RUN_REACH it runs.
export const DEAD_ZONE = 0.2;
export const RUN_REACH = 0.7;
// Each way covers 135° of the circle, so the diagonals between give two.
const SECTOR = Math.cos((67.5 * Math.PI) / 180);
// How far round its buttons the act and pause buttons take a finger, as a
// share of their radius.
const ACT_REACH = 1.4;
const PAUSE_REACH = 1.6;

export function createTouch() {
  return {
    // Shown where the main pointer is a finger, or once one has touched;
    // hidden again by a key (main.js decides).
    visible: false,
    // By pointer id: { area: 'pad' | 'buttons' | 'pause', x, y, codes }.
    pointers: new Map(),
  };
}

function circle(x, y, image, scale) {
  return { x, y, radius: (image.width / 2) * scale };
}

// Where everything sits on a screen width × height device pixels, ratio
// device pixels to a CSS pixel: { scale, pad, jump, act, pause }, each a
// circle { x, y, radius } in device pixels.
export function touchLayout(width, height, ratio = 1) {
  const fitting = Math.floor((PAD_SHARE * height) / TOUCH_ART.pad.height);
  const scale = Math.max(1, Math.min(Math.round(TOUCH_UNIT * ratio), fitting));
  const margin = MARGIN * scale;
  const half = (image) => (image.width / 2) * scale;
  const padRadius = half(TOUCH_ART.pad);
  const jumpRadius = half(TOUCH_ART.jump.resting);
  const actRadius = half(TOUCH_ART.act.resting);
  const pauseRadius = half(TOUCH_ART.pause.resting);
  const jump = circle(width - margin - jumpRadius, height - margin - jumpRadius, TOUCH_ART.jump.resting, scale);
  // Act sits up and to the left of jump, where the thumb rolls to.
  const reach = (jumpRadius + actRadius + ACT_GAP * scale) / Math.SQRT2;
  const pauseInset = PAUSE_MARGIN * scale + pauseRadius;
  return {
    width,
    height,
    scale,
    pad: circle(margin + padRadius, height - margin - padRadius, TOUCH_ART.pad, scale),
    jump,
    act: circle(jump.x - reach, jump.y - reach, TOUCH_ART.act.resting, scale),
    pause: circle(width - pauseInset, pauseInset, TOUCH_ART.pause.resting, scale),
  };
}

function within(target, x, y, share) {
  return Math.hypot(x - target.x, y - target.y) <= target.radius * share;
}

// Which part of the controls a finger landing at x, y works.
function areaAt(layout, x, y) {
  if (within(layout.pause, x, y, PAUSE_REACH)) return 'pause';
  return x < layout.width * PAD_AREA ? 'pad' : 'buttons';
}

// The touch keys a finger at x, y holds in its area.
export function codesAt(layout, area, x, y) {
  if (area === 'pause') return ['TouchPause'];
  if (area === 'buttons') return [within(layout.act, x, y, ACT_REACH) ? 'TouchAct' : 'TouchJump'];
  const dx = x - layout.pad.x;
  const dy = y - layout.pad.y;
  const distance = Math.hypot(dx, dy);
  if (distance < layout.pad.radius * DEAD_ZONE) return [];
  const codes = [];
  if (dx / distance > SECTOR) codes.push('TouchRight');
  if (-dx / distance > SECTOR) codes.push('TouchLeft');
  if (dy / distance > SECTOR) codes.push('TouchDown');
  if (distance > layout.pad.radius * RUN_REACH && (codes.includes('TouchLeft') || codes.includes('TouchRight'))) codes.push('TouchRun');
  return codes;
}

function heldCodes(touch) {
  const codes = new Set();
  for (const pointer of touch.pointers.values()) for (const code of pointer.codes) codes.add(code);
  return codes;
}

// Runs change on the fingers, then tells the input what is newly held and
// what is let go: two fingers on one button hold it until both lift.
function update(touch, input, change) {
  const before = heldCodes(touch);
  change();
  const after = heldCodes(touch);
  for (const code of before) if (!after.has(code)) queueKey(input, code, false);
  for (const code of after) if (!before.has(code)) queueKey(input, code, true);
}

export function pressTouch(touch, input, layout, id, x, y) {
  update(touch, input, () => {
    const area = areaAt(layout, x, y);
    touch.pointers.set(id, { area, x, y, codes: codesAt(layout, area, x, y) });
  });
}

// A finger moving keeps its area; pause holds only where it was pressed.
export function moveTouch(touch, input, layout, id, x, y) {
  const pointer = touch.pointers.get(id);
  if (!pointer) return;
  update(touch, input, () => {
    pointer.x = x;
    pointer.y = y;
    if (pointer.area !== 'pause') pointer.codes = codesAt(layout, pointer.area, x, y);
  });
}

export function liftTouch(touch, input, id) {
  if (!touch.pointers.has(id)) return;
  update(touch, input, () => touch.pointers.delete(id));
}

// Every finger let go: the play has stopped, or the window was left.
export function releaseTouches(touch, input) {
  update(touch, input, () => touch.pointers.clear());
}

// What render.js draws: the buttons held, and the pad's knob where its
// finger is (kept inside the ring), lit while it runs; null at rest.
export function touchState(touch, layout) {
  const held = heldCodes(touch);
  const finger = [...touch.pointers.values()].find((pointer) => pointer.area === 'pad');
  let knob = null;
  if (finger) {
    const dx = finger.x - layout.pad.x;
    const dy = finger.y - layout.pad.y;
    const room = layout.pad.radius - (TOUCH_ART.knob.resting.width / 2) * layout.scale;
    const reach = Math.min(1, room / Math.max(1, Math.hypot(dx, dy)));
    knob = { x: layout.pad.x + dx * reach, y: layout.pad.y + dy * reach, running: held.has('TouchRun') };
  }
  return {
    jump: held.has('TouchJump'),
    act: held.has('TouchAct'),
    pause: held.has('TouchPause'),
    knob,
  };
}
