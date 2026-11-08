// The short pieces played once, and the report's music.
import { BAND } from './band.js';

// The goal reached: a run up to a big C, over before the report comes
// (world.js gives it COMPLETE_TIME, 3 seconds).
export const LEVEL_COMPLETE = {
  id: 'levelComplete',
  bpm: 160,
  loopBar: null,
  instruments: BAND,
  bars: {
    lead: ['G4 C5 E5 G5 C6 - E5 G5 C6 - E6 - - - . .', 'F6 - E6 - D6 - G6 - C7 - - - - - - -'],
    harmony: ['. E4 . G4 . E4 . G4', 'B4 - - - D5 - - - E5 - - - - - - -'],
    bass: ['C3 - G2 - C3 - G2 -', 'G2 - - - G2 - - - C3 - - - - - - -'],
    drums: ['k . h . s . h . k . h . s . s s', 'k . . . s . . . k . . . o . . .'],
  },
};

// The last life lost: everything slides down a semitone at a time, and
// lands on a chord that isn't quite the one expected.
export const GAME_OVER = {
  id: 'gameOver',
  bpm: 90,
  loopBar: null,
  instruments: BAND,
  bars: {
    lead: ['E5 - D#5 - D5 - C#5 -', 'C5 - - - - - . .'],
    harmony: ['C5 - B4 - Bb4 - A4 -', 'A4 - - - - - . .'],
    bass: ['A2 - Ab2 - G2 - F#2 -', 'F2 - - - - - . .'],
    drums: ['.', 'k . . .'],
  },
};

// A score that makes the list: a short fanfare, three knocks and a rise.
export const HIGH_SCORE = {
  id: 'highScore',
  bpm: 150,
  loopBar: null,
  instruments: BAND,
  bars: {
    lead: ['C5 . C5 . C5 . G5 - - - . . E5 - G5 -', 'C6 - - - - - - - - - - - . . . .'],
    harmony: ['. . . . E4 - - - . . . . C5 - E5 -', 'E5 - - - - - - - - - - - . . . .'],
    bass: ['C3 . C3 . C3 . E3 - - - . . G2 - G2 -', 'C3 - - - - - - - - - - - . . . .'],
    drums: ['s . s . s . k . . . . . s . s .', 'o . . . . . . . . . . . . . . .'],
  },
};

// The reports: lift music for the office, a slow loop over Bb major
// sevenths, with a walking bass and only hats and a soft kick.
const MUZAK = 'h . h k h . h . h . h k h . h .';

export const REPORT = {
  id: 'report',
  bpm: 104,
  loopBar: 0,
  instruments: {
    lead: { ...BAND.lead, duty: 0.125, gain: 0.07, decay: 0.3, sustain: 0.3 },
    harmony: { ...BAND.harmony, gain: 0.03, decay: 0.4, sustain: 0.5 },
    bass: { ...BAND.bass, gain: 0.22 },
  },
  bars: {
    lead: [
      'D5 - - F5 - - A5 -',
      'G5 - - - F5 - D5 -',
      'Eb5 - - G5 - - Bb5 -',
      'A5 - - - . . . .',
      'D5 - - F5 - - A5 -',
      'Bb5 - - - A5 - G5 -',
      'C6 - - Bb5 - - G5 -',
      'F5 - - - - - . .',
    ],
    harmony: ['A4', 'F4', 'Bb4', 'Eb5', 'A4', 'F4', 'Bb4', 'A4'],
    bass: [
      'Bb2 D3 F3 D3',
      'G2 Bb2 D3 B2',
      'C3 Eb3 G3 E3',
      'F2 A2 C3 A2',
      'Bb2 D3 F3 D3',
      'G2 Bb2 D3 B2',
      'C3 Eb3 G3 E3',
      'F2 A2 C3 Eb3',
    ],
    drums: Array(8).fill(MUZAK),
  },
};
