// Which sound each of the game's events plays, at what pitch and how loud.
// Pure: audio.js plays what this returns. A play is { sound, rate, volume }:
// rate is the playback rate (2 is an octave up, and twice as quick), volume
// a factor on the sound's own level.
import { VIEW_WIDTH } from './config.js';
import { ITEMS } from './items.js';
import { SOUNDS } from './sounds.js';

// Below this fall speed (px/s) a landing makes no sound (a moving platform
// settling under him); at the hard one, the fastest fall, it is loudest.
export const SOFT_LANDING = 100;
export const HARD_LANDING = 430;

// Each pickup in a combo plays a step higher, up the major scale, and the
// combo's longest chains stay on the top step.
export const COMBO_STEPS = [0, 2, 4, 5, 7, 9, 11, 12];

// What enemies do off screen is not heard; within this far outside the
// view it is.
export const HEARING_MARGIN = 16;
const OFF_SCREEN_EVENTS = ['throw', 'drop', 'shout'];

// The clock's last few seconds tick a fifth higher.
export const LAST_TICKS = 3;

// Events that make no sound, and why: every event the world sends is
// either cued or here (a test holds each one to that).
export const SILENT_EVENTS = {
  gameOver: 'the life lost has just played; the game over gets its jingle with the music',
  levelComplete: 'its jingle comes with the music',
  highScore: 'its jingle comes with the music',
};

const PICKUP_SOUNDS = { sample: 'sample', possession: 'possession', evidence: 'evidence', bonus: 'bonus' };
const LOSS_SOUNDS = { hurt: 'lifeLost', pit: 'fall', water: 'drown', time: 'timeUp' };
const TYPING_SOUNDS = { added: 'letter', erased: 'erase', refused: 'refuse' };

function play(sound, rate = 1, volume = 1) {
  return { sound, rate, volume };
}

function landing(event) {
  if (event.speed < SOFT_LANDING) return [];
  const share = Math.min((event.speed - SOFT_LANDING) / (HARD_LANDING - SOFT_LANDING), 1);
  return [play('land', 1, 0.4 + 0.6 * share)];
}

// A power-up's own sound comes with its powerUp event.
function collected(event) {
  const sound = PICKUP_SOUNDS[ITEMS[event.item].category];
  if (!sound) return [];
  const step = COMBO_STEPS[Math.min(Math.max(event.chain, 1), COMBO_STEPS.length) - 1];
  return [play(sound, 2 ** (step / 12))];
}

function lifeLost(event) {
  const sound = LOSS_SOUNDS[event.cause];
  if (!sound) throw new Error(`No sound for a life lost to '${event.cause}'`);
  return [play(sound)];
}

function powerUp(event) {
  if (!SOUNDS[event.powerUp]) throw new Error(`No sound for the power-up '${event.powerUp}'`);
  return [play(event.powerUp)];
}

function tick(event) {
  return [play('tick', event.left <= LAST_TICKS ? 2 ** (7 / 12) : 1)];
}

function typed(event) {
  const sound = TYPING_SOUNDS[event.change];
  if (!sound) throw new Error(`No sound for typing that '${event.change}'`);
  return [play(sound)];
}

// The ideologue's slogan is both thrown and shouted; the shout is heard.
function thrown(event) {
  return event.projectile.type === 'shout' ? [] : [play('throw')];
}

const CUES = {
  jump: () => [play('jump')],
  land: landing,
  bump: () => [play('bump')],
  collected,
  hurt: () => [play('hurt')],
  shielded: () => [play('shielded')],
  lifeLost,
  hurry: () => [play('hurry')],
  tick,
  stomp: () => [play('stomp')],
  struck: () => [play('struck')],
  wounded: () => [play('wounded')],
  crateOpened: () => [play('crate')],
  powerUp,
  powerUpEnded: () => [play('powerDown')],
  promoted: () => [play('promoted')],
  helped: () => [play('helped')],
  read: () => [play('read')],
  lifted: () => [play('lifted')],
  tossed: () => [play('tossed')],
  secretFound: () => [play('secret')],
  checkpoint: () => [play('checkpoint')],
  bossAwake: () => [play('bossAwake')],
  gatesOpened: () => [play('gate')],
  throw: thrown,
  drop: () => [play('drop')],
  shout: () => [play('shout')],
  menuMoved: () => [play('menuMove')],
  menuChosen: () => [play('menuChoose')],
  advanced: () => [play('advance')],
  paused: () => [play('pause')],
  resumed: () => [play('resume')],
  typed,
  nameSigned: () => [play('menuChoose')],
  bonusCounted: (event) => [play(event.done ? 'tally' : 'bonusTick')],
};

export function isCued(type) {
  return type in CUES;
}

function placeOf(event) {
  if (event.type === 'throw') return event.projectile.x + event.projectile.w / 2;
  return event.x;
}

function isHeard(event, cameraX) {
  if (cameraX === null || !OFF_SCREEN_EVENTS.includes(event.type)) return true;
  const x = placeOf(event);
  return x >= cameraX - HEARING_MARGIN && x <= cameraX + VIEW_WIDTH + HEARING_MARGIN;
}

// The song each screen plays, or null for silence.
const SCREEN_MUSIC = { title: 'title', controls: 'title', highScores: 'title' };

// The song that should be playing now (audio.js crossfades to it).
export function musicFor(game) {
  return SCREEN_MUSIC[game.screen] ?? null;
}

export function createCues() {
  // When each sound last played, for its minGap.
  return { lastPlayed: {} };
}

// The plays for one step's events. time: the game's clock, in seconds;
// cameraX: the view's left edge in the level, or null when none is played.
export function cueEvents(cues, events, { time, cameraX = null }) {
  const plays = [];
  for (const event of events) {
    if (!isHeard(event, cameraX)) continue;
    for (const cue of CUES[event.type]?.(event) ?? []) {
      const gap = SOUNDS[cue.sound].minGap ?? 0;
      const last = cues.lastPlayed[cue.sound];
      if (last !== undefined && time - last < gap) continue;
      cues.lastPlayed[cue.sound] = time;
      plays.push(cue);
    }
  }
  return plays;
}
