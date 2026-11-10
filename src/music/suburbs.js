// Förorten's theme, the suburbs (played on the try-out levels too): a
// bouncy tune in F over an octave-jumping bass, cheerful about nothing in
// particular. Two bars of intro, then
// sixteen that loop: a phrase and its answer, and a hopping middle part
// that turns briefly to D minor before it comes home.
import { BAND, offbeat, offbeatSplit } from './band.js';

// The bass jumps an octave every eighth, as platform games' basses do.
const bounce = (low, high) => `${low} ${high} ${low} ${high} ${low} ${high} ${low} ${high}`;
const bounceSplit = (low1, high1, low2, high2) => `${low1} ${high1} ${low1} ${high1} ${low2} ${high2} ${low2} ${high2}`;

const intro = {
  lead: ['.', 'C5 D5 E5 F5 G5 A5 Bb5 C6'],
  harmony: ['.', '.'],
  bass: [bounce('F2', 'F3'), bounce('C2', 'C3')],
  drums: ['k . . . s . . . k . . . s . s s', 'k . h . s . h . k . h . s s s s'],
};

const phrase = {
  lead: [
    'F5 - - A5 - - C6 - . . A5 - G5 - F5 -',
    'D5 - - F5 - - A5 - . . G5 - F5 - D5 -',
    'Bb4 - - D5 - - F5 - . . G5 - A5 - Bb5 -',
    'C6 - - - . . G5 - C6 - - - . . . .',
  ],
  harmony: [offbeat('A4', 'C5'), offbeat('F4', 'A4'), offbeat('D4', 'F4'), offbeat('E4', 'G4')],
  bass: [bounce('F2', 'F3'), bounce('D2', 'D3'), bounce('Bb1', 'Bb2'), bounce('C2', 'C3')],
};

const answer = {
  lead: [
    phrase.lead[0],
    phrase.lead[1],
    'Bb5 - A5 - G5 - F5 - E5 - G5 - C6 - Bb5 -',
    'A5 - F5 - F5 - . .',
  ],
  harmony: [offbeat('A4', 'C5'), offbeat('F4', 'A4'), offbeatSplit('D4', 'F4', 'E4', 'G4'), offbeat('A4', 'C5')],
  bass: [bounce('F2', 'F3'), bounce('D2', 'D3'), bounceSplit('Bb1', 'Bb2', 'C2', 'C3'), bounce('F2', 'F3')],
};

// The middle hops between octaves, a bit too pleased with itself.
const hop = {
  lead: [
    'D6 . D5 . D6 . Bb5 . F5 . Bb5 . D6 - - -',
    'C6 . C5 . C6 . A5 . F5 . A5 . C6 - - -',
    'Bb5 . G5 . D5 . G5 . Bb5 - A5 - G5 - F5 -',
    'E5 - G5 - C6 - - - Bb5 - - - G5 - - -',
  ],
  harmony: [offbeat('D4', 'F4'), offbeat('A4', 'C5'), offbeat('Bb4', 'D5'), offbeat('E4', 'G4')],
  bass: [bounce('Bb1', 'Bb2'), bounce('F2', 'F3'), bounce('G2', 'G3'), bounce('C2', 'C3')],
};

const turn = {
  lead: [
    hop.lead[0],
    'C#6 . C#5 . C#6 . A5 . E5 . A5 . C#6 - - -',
    'D6 - A5 - F5 - D5 - G5 - Bb5 - D6 - G5 -',
    'E5 - G5 - Bb5 - C6 - E6 - - - C6 - - -',
  ],
  harmony: [offbeat('D4', 'F4'), offbeat('C#5', 'E5'), offbeatSplit('A4', 'D5', 'Bb4', 'D5'), offbeat('E4', 'Bb4')],
  bass: [bounce('Bb1', 'Bb2'), bounce('A1', 'A2'), bounceSplit('D2', 'D3', 'G2', 'G3'), bounce('C2', 'C3')],
};

const GROOVE = 'k . h k s . h . k k h . s . h h';
const FILL = 'k . h k s . h . k . s . s s s s';
const groove = [GROOVE, GROOVE, GROOVE, FILL];

const sections = [phrase, answer, hop, turn];

export const SUBURBS = {
  id: 'suburbs',
  bpm: 144,
  loopBar: 2,
  instruments: BAND,
  bars: {
    lead: [...intro.lead, ...sections.flatMap((section) => section.lead)],
    harmony: [...intro.harmony, ...sections.flatMap((section) => section.harmony)],
    bass: [...intro.bass, ...sections.flatMap((section) => section.bass)],
    drums: [...intro.drums, ...sections.flatMap(() => groove)],
  },
};
