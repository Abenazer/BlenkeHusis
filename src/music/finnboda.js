// Finnboda varv's song: acid techno at half past four in the morning, in
// A minor at 138 bpm. A squelching pulse bass runs sixteenths round the
// root, jumping octaves and slipping to the flat seventh; a kick on every
// quarter with the clap on two and four and the open hat between. A long
// build: four bars of the kick alone and then the bass coming in, then
// sixteen that loop, the hall's eight bars and the eight where a riff
// climbs over them.
import { BAND } from './band.js';

const ACID = 'A1 A1 A2 A1 . A1 C2 A1 A2 . A1 G1 A1 A2 . E2';
const TURN = 'A1 A1 A2 A1 . A1 C2 A1 G1 . G2 G1 . E2 G1 G2';
const DROP = 'F1 F1 F2 F1 . F1 A1 F1 F2 . F1 E1 F1 F2 . C2';
const LIFT = 'G1 G1 G2 G1 . G1 B1 G1 G2 . D2 G1 G2 . E2 G2';

// A stab on the off-beat of three, the hall's echo.
const STAB = '. . . . . . . . . . E4 - . . . .';
const STAB_F = '. . . . . . . . . . F4 - . . . .';
const STAB_G = '. . . . . . . . . . D4 - . . . .';

// Four to the floor, the clap on two and four, the open hat off the beat.
const KICK = 'k . . . k . . . k . . . k . . .';
const KICK_HAT = 'k . o . k . o . k . o . k . o .';
const BEAT = 'k . o . c . o . k . o . c . o .';
const FILL = 'k . o . c . o . k . c . c c c c';

const intro = {
  lead: ['.', '.', '.', '.'],
  harmony: ['.', '.', '.', '.'],
  bass: ['.', '.', ACID, ACID],
  drums: [KICK, KICK, KICK_HAT, FILL],
};

// The hall: the bass and the beat, a stab now and then.
const hall = {
  lead: ['.', '.', '.', '.', '.', '.', '.', '.'],
  harmony: [STAB, '.', STAB, '.', STAB_F, '.', STAB_G, '.'],
  bass: [ACID, ACID, ACID, TURN, DROP, DROP, LIFT, TURN],
  drums: [BEAT, BEAT, BEAT, FILL, BEAT, BEAT, BEAT, FILL],
};

// The riff climbing over it, a step higher every two bars.
const climb = {
  lead: [
    'A5 . . A5 . . A5 . C6 . . A5 . . E5 .',
    'A5 . . A5 . . A5 . C6 . . A5 . . G5 .',
    'C6 . . C6 . . C6 . E6 . . C6 . . A5 .',
    'C6 . . C6 . . C6 . E6 . . C6 . . B5 .',
    'C6 . . C6 . . C6 . F6 . . C6 . . A5 .',
    'C6 . . C6 . . C6 . F6 . . E6 . . C6 .',
    'D6 . . D6 . . D6 . G6 . . D6 . . B5 .',
    'E6 - - - - - - - E6 . D6 . C6 . B5 .',
  ],
  harmony: [STAB, STAB, STAB, STAB, STAB_F, STAB_F, STAB_G, STAB_G],
  bass: [ACID, ACID, ACID, TURN, DROP, DROP, LIFT, TURN],
  drums: [BEAT, BEAT, BEAT, FILL, BEAT, BEAT, BEAT, FILL],
};

const parts = [intro, hall, climb];

export const FINNBODA = {
  id: 'finnboda',
  bpm: 138,
  loopBar: 4,
  instruments: {
    lead: { ...BAND.lead, duty: 0.125, gain: 0.06, decay: 0.08, sustain: 0.4 },
    harmony: { ...BAND.harmony, duty: 0.25, gain: 0.05 },
    // The squelch: a narrow pulse that snaps shut on every note.
    bass: { wave: 'pulse', duty: 0.25, gain: 0.11, attack: 0.002, decay: 0.07, sustain: 0.35, release: 0.015 },
  },
  bars: Object.fromEntries(['lead', 'harmony', 'bass', 'drums'].map((channel) => [channel, parts.flatMap((part) => part[channel])])),
};
