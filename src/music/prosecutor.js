// The prosecutor's theme: a driving courtroom drama in A minor, far too
// grand for 0.02 grams. Eight bars that loop, the drums banging like a
// gavel at the end.
import { BAND, alternate } from './band.js';

// A pedal bass that jumps up an octave off the beat.
const pedal = (low, high) => `${low} ${low} ${high} ${low} ${low} ${high} ${low} ${high}`;
const pedalSplit = (low1, high1, low2, high2) => `${low1} ${low1} ${high1} ${low1} ${low2} ${low2} ${high2} ${low2}`;

const charge = [
  'A4 - - C5 - - E5 - A5 - - - G#5 - E5 -',
  'A5 - - G5 - - E5 - C5 - D5 - E5 - - -',
  'F5 - - A5 - - C6 - B5 - A5 - F5 - - -',
  'E5 - - G#5 - - B5 - E6 - - - D6 - B5 -',
];

const lead = [
  ...charge,
  charge[0],
  charge[1],
  'D5 - F5 - A5 - D6 - E5 - G#5 - B5 - E6 -',
  'A5 - - - E5 - - - A4 - - - . . . .',
];

const harmony = [
  alternate('C5', 'E5'),
  alternate('C5', 'E5'),
  alternate('A4', 'C5'),
  alternate('G#4', 'B4'),
  alternate('C5', 'E5'),
  alternate('C5', 'E5'),
  'F4 A4 F4 A4 G#4 B4 G#4 B4',
  alternate('C5', 'E5'),
];

const bass = [
  pedal('A1', 'A2'),
  pedal('A1', 'A2'),
  pedal('F1', 'F2'),
  pedal('E1', 'E2'),
  pedal('A1', 'A2'),
  pedal('A1', 'A2'),
  pedalSplit('D2', 'D3', 'E2', 'E3'),
  pedal('A1', 'A2'),
];

const DRIVE = 'k . k . s . k . k . k . s . s .';
const GAVEL = 'k . s . k . s . k . s . s s s s';

export const PROSECUTOR = {
  id: 'prosecutor',
  bpm: 168,
  loopBar: 0,
  instruments: { ...BAND, harmony: { ...BAND.harmony, duty: 0.125, gain: 0.035 } },
  bars: {
    lead,
    harmony,
    bass,
    drums: [DRIVE, DRIVE, DRIVE, DRIVE, DRIVE, DRIVE, DRIVE, GAVEL],
  },
};
