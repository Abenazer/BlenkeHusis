// The sound effects as data: the voices synth.js renders (see there for
// what a voice holds). Each sound may also set
//   channel  sounds on the same channel cut each other off, so a run of
//            pickups is heard as a run, not a smear
//   minGap   seconds the same sound waits before it can play again, for
//            events that can come many steps in a row
import { noteFrequency as note } from './synth.js';

export const SOUNDS = {
  // A square wave sweeping up as he leaves the ground.
  jump: {
    channel: 'blenke',
    voices: [
      { wave: 'pulse', duty: 0.25, freq: 260, to: 620, slide: 0.12, length: 0.17, gain: 0.22, decay: 0.12, sustain: 0.3, release: 0.04 },
    ],
  },
  // A thump of boots on the ground; cues.js sets how loud by the fall.
  land: {
    minGap: 0.1,
    voices: [
      { wave: 'triangle', freq: 150, to: 55, length: 0.09, gain: 0.5, decay: 0.04, sustain: 0, release: 0.02 },
      { wave: 'noise', freq: 2200, length: 0.05, gain: 0.12, decay: 0.015, sustain: 0, release: 0.01 },
    ],
  },
  // His head against a ceiling: a dull knock.
  bump: {
    minGap: 0.15,
    voices: [
      { wave: 'pulse', duty: 0.5, freq: 190, to: 110, length: 0.1, gain: 0.2, decay: 0.05, sustain: 0, release: 0.02 },
      { wave: 'noise', freq: 5000, length: 0.03, gain: 0.12, decay: 0.01, sustain: 0, release: 0.008 },
    ],
  },
  // A urine sample: the bright two-note ping every pickup game has.
  sample: {
    channel: 'pickup',
    voices: [
      { wave: 'pulse', duty: 0.5, freq: note('B5'), length: 0.06, gain: 0.16, release: 0.005 },
      { wave: 'pulse', duty: 0.5, at: 0.06, freq: note('E6'), length: 0.3, gain: 0.16, decay: 0.09, sustain: 0, release: 0.05 },
    ],
  },
  // Minor possession is the big find: a little fanfare for 0.02 grams.
  possession: {
    channel: 'pickup',
    voices: [
      { wave: 'pulse', duty: 0.25, freq: note('G5'), arp: [0, 4, 7, 12], arpRate: 0.045, length: 0.18, gain: 0.15, release: 0.01 },
      { wave: 'pulse', duty: 0.25, at: 0.18, freq: note('G6'), length: 0.4, gain: 0.15, decay: 0.15, sustain: 0, release: 0.06 },
      { wave: 'triangle', freq: note('G3'), length: 0.3, gain: 0.35, decay: 0.12, sustain: 0, release: 0.05 },
    ],
  },
  // Evidence: two notes a fifth apart, thin and official.
  evidence: {
    channel: 'pickup',
    voices: [
      { wave: 'pulse', duty: 0.125, freq: note('G5'), length: 0.07, gain: 0.16, release: 0.005 },
      { wave: 'pulse', duty: 0.125, at: 0.07, freq: note('D6'), length: 0.22, gain: 0.16, decay: 0.07, sustain: 0, release: 0.04 },
    ],
  },
  // A bonus item: a quick run up a major chord.
  bonus: {
    channel: 'pickup',
    voices: [
      { wave: 'pulse', duty: 0.5, freq: note('C6'), arp: [0, 4, 7, 12], arpRate: 0.035, length: 0.28, gain: 0.14, decay: 0.12, sustain: 0.2, release: 0.06 },
    ],
  },

  // Getting hurt: a warbling drop with a crack in front.
  hurt: {
    channel: 'blenke',
    voices: [
      { wave: 'pulse', duty: 0.25, freq: 520, to: 140, arp: [0, 6], arpRate: 0.025, length: 0.28, gain: 0.18, release: 0.05 },
      { wave: 'noise', freq: 3000, length: 0.12, gain: 0.12, decay: 0.05, sustain: 0, release: 0.02 },
    ],
  },
  // The paperwork shield takes the hit: a stamp, then a ping.
  shielded: {
    voices: [
      { wave: 'noise', freq: 1200, length: 0.1, gain: 0.25, decay: 0.03, sustain: 0, release: 0.02 },
      { wave: 'pulse', duty: 0.125, at: 0.03, freq: note('A6'), length: 0.25, gain: 0.12, decay: 0.08, sustain: 0, release: 0.04 },
    ],
  },
  // A life lost to his health: four notes down a minor chord.
  lifeLost: {
    channel: 'blenke',
    voices: [
      ...['C5', 'G4', 'Eb4'].map((name, i) => (
        { wave: 'pulse', duty: 0.5, at: i * 0.13, freq: note(name), length: 0.13, gain: 0.16, release: 0.01 })),
      { wave: 'pulse', duty: 0.5, at: 0.39, freq: note('C4'), length: 0.45, gain: 0.16, decay: 0.2, sustain: 0.3, release: 0.08 },
      { wave: 'triangle', at: 0.39, freq: note('C3'), length: 0.45, gain: 0.35, decay: 0.2, sustain: 0.3, release: 0.08 },
    ],
  },
  // Into a pit: a long slide whistle down.
  fall: {
    channel: 'blenke',
    voices: [
      { wave: 'pulse', duty: 0.5, freq: 900, to: 80, length: 0.95, gain: 0.16, release: 0.12 },
    ],
  },
  // Into deep water: a wobbling sinking tone.
  drown: {
    channel: 'blenke',
    voices: [
      { wave: 'pulse', duty: 0.5, freq: 700, to: 180, arp: [0, 7, 3, 10], arpRate: 0.04, length: 0.8, gain: 0.14, release: 0.1 },
      { wave: 'triangle', freq: 220, to: 90, length: 0.8, gain: 0.3, decay: 0.3, sustain: 0.2, release: 0.1 },
    ],
  },
  // Out of time: a buzzer, two low tones beating against each other.
  timeUp: {
    channel: 'blenke',
    voices: [
      { wave: 'pulse', duty: 0.5, freq: 110, length: 0.7, gain: 0.14, release: 0.06 },
      { wave: 'pulse', duty: 0.5, freq: 116, length: 0.7, gain: 0.14, release: 0.06 },
    ],
  },
  // The clock: an alarm as it runs low, then a blip for each last second.
  hurry: {
    voices: [
      { wave: 'pulse', duty: 0.5, freq: note('A5'), arp: [0, -5], arpRate: 0.1, length: 0.6, gain: 0.13, release: 0.03 },
    ],
  },
  tick: {
    voices: [
      { wave: 'pulse', duty: 0.5, freq: note('A5'), length: 0.04, gain: 0.1, release: 0.01 },
    ],
  },

  // Landing on an enemy: a squash.
  stomp: {
    voices: [
      { wave: 'triangle', freq: 300, to: 80, length: 0.12, gain: 0.45, release: 0.03 },
      { wave: 'noise', freq: 1800, length: 0.06, gain: 0.14, decay: 0.02, sustain: 0, release: 0.01 },
    ],
  },
  // A thrown cone hits an enemy: plastic clonk.
  struck: {
    voices: [
      { wave: 'pulse', duty: 0.25, freq: 700, to: 350, length: 0.08, gain: 0.16, release: 0.02 },
      { wave: 'triangle', freq: 220, length: 0.15, gain: 0.35, decay: 0.05, sustain: 0, release: 0.03 },
    ],
  },
  // The prosecutor takes a hit but stands: a heavy thud.
  wounded: {
    voices: [
      { wave: 'noise', freq: 800, length: 0.2, gain: 0.2, decay: 0.07, sustain: 0, release: 0.03 },
      { wave: 'pulse', duty: 0.5, freq: 300, to: 100, length: 0.25, gain: 0.18, release: 0.05 },
    ],
  },
  // A crate splits open.
  crate: {
    voices: [
      { wave: 'noise', freq: 2500, length: 0.12, gain: 0.2, decay: 0.04, sustain: 0, release: 0.02 },
      { wave: 'triangle', freq: 180, to: 120, length: 0.12, gain: 0.35, release: 0.03 },
    ],
  },
  // A stoner drops a bag: plop.
  drop: {
    voices: [
      { wave: 'triangle', freq: 500, to: 250, length: 0.08, gain: 0.3, release: 0.02 },
    ],
  },
  // Something thrown at him: a soft whoosh.
  throw: {
    minGap: 0.1,
    voices: [
      { wave: 'noise', freq: 3000, to: 1200, length: 0.12, gain: 0.13, decay: 0.05, sustain: 0.2, release: 0.03 },
    ],
  },
  // An ideologue's slogan: blah-blah through a megaphone.
  shout: {
    voices: [
      { wave: 'pulse', duty: 0.25, freq: 330, arp: [0, 3, -2, 5, 0], arpRate: 0.05, length: 0.35, gain: 0.13, release: 0.04 },
    ],
  },
  // The prosecutor wakes: three bangs of the gavel.
  bossAwake: {
    voices: [0, 0.18, 0.36].flatMap((at) => [
      { wave: 'noise', freq: 1400, at, length: 0.06, gain: 0.2, decay: 0.02, sustain: 0, release: 0.01 },
      { wave: 'triangle', freq: 160, to: 90, at, length: 0.09, gain: 0.4, release: 0.02 },
    ]),
  },
  // His barrier lifts: a rumble and a rising tone.
  gate: {
    voices: [
      { wave: 'noise', freq: 300, length: 0.8, gain: 0.25, decay: 0.4, sustain: 0.3, release: 0.1 },
      { wave: 'pulse', duty: 0.5, freq: 110, to: 220, length: 0.8, gain: 0.1, release: 0.1 },
    ],
  },

  // Each power-up its own, as the spec asks. Police coffee: a jittery
  // rush upwards.
  policeCoffee: {
    channel: 'powerUp',
    voices: [
      { wave: 'pulse', duty: 0.25, freq: 300, to: 1200, arp: [0, 12], arpRate: 0.02, length: 0.35, gain: 0.14, release: 0.05 },
    ],
  },
  // The paperwork shield: a stamp, then approved in two notes.
  paperworkShield: {
    channel: 'powerUp',
    voices: [
      { wave: 'noise', freq: 700, length: 0.12, gain: 0.3, decay: 0.04, sustain: 0, release: 0.02 },
      { wave: 'triangle', freq: 120, length: 0.15, gain: 0.35, decay: 0.05, sustain: 0, release: 0.03 },
      { wave: 'pulse', duty: 0.5, at: 0.12, freq: note('D6'), length: 0.08, gain: 0.13, release: 0.01 },
      { wave: 'pulse', duty: 0.5, at: 0.2, freq: note('A6'), length: 0.25, gain: 0.13, decay: 0.08, sustain: 0, release: 0.04 },
    ],
  },
  // Mandatory testing: a scanner's beep-boop.
  mandatoryTesting: {
    channel: 'powerUp',
    voices: [
      { wave: 'pulse', duty: 0.5, freq: note('E6'), arp: [0, -4], arpRate: 0.07, length: 0.42, gain: 0.13, release: 0.04 },
    ],
  },
  // A budget increase: ka-ching.
  budgetIncrease: {
    channel: 'powerUp',
    voices: [
      { wave: 'noise', freq: 6000, length: 0.05, gain: 0.2, decay: 0.02, sustain: 0, release: 0.01 },
      { wave: 'pulse', duty: 0.125, at: 0.05, freq: note('B6'), arp: [0, 5], arpRate: 0.03, length: 0.4, gain: 0.12, decay: 0.12, sustain: 0, release: 0.05 },
    ],
  },
  // The super bladder: a gurgle filling up.
  superBladder: {
    channel: 'powerUp',
    voices: [
      { wave: 'triangle', freq: 200, to: 800, arp: [0, 4, 7], arpRate: 0.03, length: 0.5, gain: 0.45, release: 0.06 },
    ],
  },
  // The police helicopter: rotor chops over a rising whine.
  helicopter: {
    channel: 'powerUp',
    voices: [
      ...[0, 0.08, 0.16, 0.24, 0.32, 0.4].map((at) => (
        { wave: 'noise', freq: 900, at, length: 0.05, gain: 0.22, decay: 0.02, sustain: 0, release: 0.01 })),
      { wave: 'pulse', duty: 0.125, freq: 200, to: 600, length: 0.48, gain: 0.08, release: 0.05 },
    ],
  },
  // A power-up runs out: down its own arpeggio.
  powerDown: {
    channel: 'powerUp',
    voices: [
      { wave: 'pulse', duty: 0.25, freq: note('C5'), arp: [12, 7, 4, 0], arpRate: 0.06, length: 0.3, gain: 0.13, release: 0.05 },
    ],
  },

  // A promotion: a short fanfare.
  promoted: {
    channel: 'fanfare',
    voices: [
      ...['C5', 'E5', 'G5'].map((name, i) => (
        { wave: 'pulse', duty: 0.5, at: i * 0.08, freq: note(name), length: 0.08, gain: 0.14, release: 0.01 })),
      { wave: 'pulse', duty: 0.5, at: 0.24, freq: note('C6'), length: 0.38, gain: 0.14, decay: 0.15, sustain: 0.3, release: 0.06 },
      { wave: 'triangle', at: 0.24, freq: note('C4'), length: 0.38, gain: 0.35, decay: 0.15, sustain: 0.3, release: 0.06 },
    ],
  },
  // Helping a citizen: two half-hearted notes down. It's worth less than a tin.
  helped: {
    voices: [
      { wave: 'triangle', freq: note('E5'), length: 0.1, gain: 0.25, release: 0.01 },
      { wave: 'triangle', at: 0.1, freq: note('C5'), length: 0.15, gain: 0.25, decay: 0.06, sustain: 0, release: 0.03 },
    ],
  },
  // Reading a sign: a page turned.
  read: {
    voices: [
      { wave: 'noise', freq: 4000, length: 0.06, gain: 0.12, decay: 0.02, sustain: 0, release: 0.01 },
      { wave: 'noise', freq: 2500, at: 0.07, length: 0.05, gain: 0.1, decay: 0.02, sustain: 0, release: 0.01 },
    ],
  },
  // Lifting a cone, and throwing it.
  lifted: {
    voices: [
      { wave: 'pulse', duty: 0.25, freq: 200, to: 400, length: 0.1, gain: 0.15, release: 0.02 },
    ],
  },
  tossed: {
    voices: [
      { wave: 'noise', freq: 1500, to: 6000, length: 0.15, gain: 0.15, release: 0.04 },
    ],
  },
  // A secret room opens: a run up the whole-tone scale, left hanging.
  secret: {
    voices: [
      { wave: 'pulse', duty: 0.25, freq: note('C5'), arp: [0, 2, 4, 6, 8, 10, 12, 14], arpRate: 0.05, length: 0.4, gain: 0.13, release: 0.01 },
      { wave: 'pulse', duty: 0.25, at: 0.4, freq: note('D6'), length: 0.35, gain: 0.13, decay: 0.15, sustain: 0.2, release: 0.06 },
    ],
  },
  // A checkpoint: a bell.
  checkpoint: {
    voices: [
      { wave: 'pulse', duty: 0.125, freq: note('G5'), length: 0.08, gain: 0.13, release: 0.01 },
      { wave: 'pulse', duty: 0.125, at: 0.08, freq: note('G6'), length: 0.4, gain: 0.13, decay: 0.15, sustain: 0, release: 0.05 },
      { wave: 'triangle', at: 0.08, freq: note('G4'), length: 0.4, gain: 0.3, decay: 0.15, sustain: 0, release: 0.05 },
    ],
  },

  // The screens. A menu's mark moving, and a choice taken.
  menuMove: {
    channel: 'menu',
    voices: [
      { wave: 'pulse', duty: 0.5, freq: note('A5'), length: 0.04, gain: 0.1, release: 0.01 },
    ],
  },
  menuChoose: {
    channel: 'menu',
    voices: [
      { wave: 'pulse', duty: 0.25, freq: note('E5'), arp: [0, 5, 12], arpRate: 0.04, length: 0.15, gain: 0.12, release: 0.03 },
    ],
  },
  // Going on from a screen that was read: the game over, a report, the list.
  advance: {
    channel: 'menu',
    voices: [
      { wave: 'pulse', duty: 0.25, freq: note('G5'), length: 0.06, gain: 0.12, release: 0.01 },
      { wave: 'pulse', duty: 0.25, at: 0.06, freq: note('D6'), length: 0.1, gain: 0.12, release: 0.03 },
    ],
  },
  // Pausing steps down, and going on steps back up.
  pause: {
    channel: 'menu',
    voices: [
      { wave: 'pulse', duty: 0.5, freq: note('E6'), length: 0.06, gain: 0.12, release: 0.01 },
      { wave: 'pulse', duty: 0.5, at: 0.06, freq: note('C6'), length: 0.1, gain: 0.12, release: 0.03 },
    ],
  },
  resume: {
    channel: 'menu',
    voices: [
      { wave: 'pulse', duty: 0.5, freq: note('C6'), length: 0.06, gain: 0.12, release: 0.01 },
      { wave: 'pulse', duty: 0.5, at: 0.06, freq: note('E6'), length: 0.1, gain: 0.12, release: 0.03 },
    ],
  },
  // Typing a name: a letter in, one rubbed out, one the name won't take.
  letter: {
    channel: 'menu',
    voices: [
      { wave: 'pulse', duty: 0.25, freq: note('C6'), length: 0.035, gain: 0.1, release: 0.01 },
    ],
  },
  erase: {
    channel: 'menu',
    voices: [
      { wave: 'pulse', duty: 0.5, freq: note('A5'), to: note('E5'), length: 0.05, gain: 0.1, release: 0.01 },
    ],
  },
  refuse: {
    channel: 'menu',
    voices: [
      { wave: 'pulse', duty: 0.5, freq: 120, length: 0.12, gain: 0.14, release: 0.02 },
    ],
  },
  // The time bonus counting into the score, and the last of it in.
  bonusTick: {
    minGap: 0.05,
    voices: [
      { wave: 'pulse', duty: 0.5, freq: note('E6'), length: 0.03, gain: 0.1, release: 0.01 },
    ],
  },
  tally: {
    voices: [
      { wave: 'noise', freq: 6000, length: 0.04, gain: 0.15, decay: 0.015, sustain: 0, release: 0.01 },
      { wave: 'pulse', duty: 0.5, at: 0.03, freq: note('E6'), length: 0.3, gain: 0.1, decay: 0.1, sustain: 0, release: 0.05 },
      { wave: 'pulse', duty: 0.5, at: 0.03, freq: note('B6'), length: 0.3, gain: 0.08, decay: 0.1, sustain: 0, release: 0.05 },
    ],
  },
};
