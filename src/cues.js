// Which sound each of the game's events plays, at what pitch and how loud.
// Pure: audio.js plays what this returns. A play is { sound, rate, volume }:
// rate is the playback rate (2 is an octave up, and twice as quick), volume
// a factor on the sound's own level.
import { VIEW_WIDTH } from './config.js';
import { ENEMIES } from './enemies.js';
import { ITEMS } from './items.js';
import { SOUNDS } from './sounds.js';

// Below this fall speed (px/s) a landing makes no sound (a moving platform
// settling under him); at the hard one, the fastest fall, it is loudest.
export const SOFT_LANDING = 100;
export const HARD_LANDING = 430;

// Each pickup in a combo plays a step higher, up the major scale, and the
// combo's longest chains stay on the top step.
export const COMBO_STEPS = [0, 2, 4, 5, 7, 9, 11, 12];

// What enemies do off screen, and a splash there, is not heard; within
// this far outside the view it is.
export const HEARING_MARGIN = 16;
const OFF_SCREEN_EVENTS = ['throw', 'drop', 'shout', 'splash', 'strum', 'dive', 'freeze'];

// The clock's last few seconds tick a fifth higher.
export const LAST_TICKS = 3;

// Events that make no sound, and why: every event the world sends is
// either cued or here (a test holds each one to that).
export const SILENT_EVENTS = {
  gameOver: 'the life lost has just played; the game over gets its jingle with the music',
  skid: 'its dust is seen; a screech at every turn at a run would grate',
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
// Some throws have a sound of their own.
const THROW_SOUNDS = { wave: 'arpeggio' };

function thrown(event) {
  return event.projectile.type === 'shout' ? [] : [play(THROW_SOUNDS[event.projectile.type] ?? 'throw')];
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
  hoseIn: () => [play('hoseIn')],
  // The gurgle climbs an octave as the tank fills.
  pour: (event) => [play('pour', 1 + event.share)],
  gaugeStopped: (event) => [play(event.full ? 'tankFull' : 'gaugeStop')],
  bossAwake: () => [play('bossAwake')],
  gatesOpened: () => [play('gate')],
  throw: thrown,
  drop: () => [play('drop')],
  splash: () => [play('splash')],
  shout: () => [play('shout')],
  strum: () => [play('strum')],
  dive: () => [play('dive')],
  freeze: () => [play('scratch')],
  menuMoved: () => [play('menuMove')],
  menuChosen: () => [play('menuChoose')],
  advanced: () => [play('advance')],
  paused: () => [play('pause')],
  resumed: () => [play('resume')],
  typed,
  tagTurned: () => [play('menuMove')],
  tagMoved: () => [play('menuMove')],
  nameSigned: () => [play('menuChoose')],
  bonusCounted: (event) => [play(event.done ? 'tally' : 'bonusTick')],
  urineDoubled: () => [play('tankFull')],
  // A blip at the new volume, so it is heard (the effects' volume has
  // already changed when it plays).
  volumeChanged: () => [play('menuMove')],
  // Sound back on is heard; sound off can't be.
  muteToggled: (event) => (event.muted ? [] : [play('menuChoose')]),
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

// The song each screen around the play has. A jingle (played once) stays
// silent after it has played, until the song changes: the game over's
// carries on from the world's last moments to its screen.
const SCREEN_MUSIC = {
  title: 'title',
  controls: 'title',
  highScores: 'title',
  levelComplete: 'report',
  yearReport: 'report',
  gameOver: 'gameOver',
  nameEntry: 'highScore',
  consent: 'highScore',
};

// Paused, the level's music plays on this much quieter.
export const PAUSED_VOLUME = 0.3;

function isBossFighting(world) {
  return world.enemies.some((enemy) => ENEMIES[enemy.type].boss && enemy.awake && !enemy.defeated);
}

// In a level: its own song, the boss's while he fights, a jingle at the
// goal and at the end, and silence while a lost life passes (the song
// starts again with Blenke).
function levelMusic(game) {
  const { world } = game;
  if (world.over) return 'gameOver';
  if (world.complete) return 'levelComplete';
  if (world.down > 0) return null;
  if (isBossFighting(world)) return 'prosecutor';
  return game.level.music;
}

// What should be playing now, { song, volume } (song null for silence);
// audio.js fades to it.
export function musicFor(game) {
  // The sound screen plays what the screen it came from plays, the
  // level's at full volume, so the setting is heard as it is changed.
  if (game.screen === 'sound') {
    return { song: game.soundFrom?.screen === 'paused' ? levelMusic(game) : 'title', volume: 1 };
  }
  if (game.screen === 'playing' || game.screen === 'paused') {
    return { song: levelMusic(game), volume: game.screen === 'paused' ? PAUSED_VOLUME : 1 };
  }
  return { song: SCREEN_MUSIC[game.screen] ?? null, volume: 1 };
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
