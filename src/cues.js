// Which sound each of the game's events plays, at what pitch and how loud.
// Pure: audio.js plays what this returns. A play is { sound, rate, volume }:
// rate is the playback rate (2 is an octave up, and twice as quick), volume
// a factor on the sound's own level.
import { ITEMS } from './items.js';
import { SOUNDS } from './sounds.js';

// Below this fall speed (px/s) a landing makes no sound (a moving platform
// settling under him); at the hard one, the fastest fall, it is loudest.
export const SOFT_LANDING = 100;
export const HARD_LANDING = 430;

// Each pickup in a combo plays a step higher, up the major scale, and the
// combo's longest chains stay on the top step.
export const COMBO_STEPS = [0, 2, 4, 5, 7, 9, 11, 12];

const PICKUP_SOUNDS = { sample: 'sample', possession: 'possession', evidence: 'evidence', bonus: 'bonus' };

function play(sound, rate = 1, volume = 1) {
  return { sound, rate, volume };
}

function landing(event) {
  if (event.speed < SOFT_LANDING) return [];
  const share = Math.min((event.speed - SOFT_LANDING) / (HARD_LANDING - SOFT_LANDING), 1);
  return [play('land', 1, 0.4 + 0.6 * share)];
}

function collected(event) {
  const sound = PICKUP_SOUNDS[ITEMS[event.item].category];
  if (!sound) return [];
  const step = COMBO_STEPS[Math.min(Math.max(event.chain, 1), COMBO_STEPS.length) - 1];
  return [play(sound, 2 ** (step / 12))];
}

const CUES = {
  jump: () => [play('jump')],
  land: landing,
  bump: () => [play('bump')],
  collected,
};

export function createCues() {
  // When each sound last played, for its minGap.
  return { lastPlayed: {} };
}

// The plays for one step's events; time is the game's clock, in seconds.
export function cueEvents(cues, events, time) {
  const plays = [];
  for (const event of events) {
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
