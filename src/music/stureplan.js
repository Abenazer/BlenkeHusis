// Stureplan's song: house in G minor for 1997, a kick on every quarter
// with a clap on two and four and the open hat between, an offbeat bass,
// and a piano riff stabbing its chords across the bar. Two bars of the
// beat and the bass, then sixteen that loop: the queue along the street,
// then the chorus the club behind the rope is playing.
import { BAND } from './band.js';

// The piano riff: the chord's top note on the one, a lower one pushed
// before the beat, and the top again, then a lift to its highest.
const piano = (top, low, lift) => `${top} - . ${low} - . ${top} - . . ${lift} - ${low} - . .`;
const offbeatBass = (root) => `. ${root} . ${root} . ${root} . ${root}`;

const Gm = { harmony: piano('D5', 'Bb4', 'G5'), bass: offbeatBass('G2') };
const Eb = { harmony: piano('Eb5', 'Bb4', 'G5'), bass: offbeatBass('Eb2') };
const Bb = { harmony: piano('D5', 'Bb4', 'F5'), bass: offbeatBass('Bb1') };
const F = { harmony: piano('C5', 'A4', 'F5'), bass: offbeatBass('F2') };

const intro = { lead: ['.', '.'], harmony: ['.', '.'], bass: [Gm.bass, F.bass] };

const verse = {
  lead: [
    '. . . . . . . . G5 - - - Bb5 - A5 -',
    'G5 - - - - - - - . . . . . . . .',
    '. . . . . . . . F5 - - - G5 - Bb5 -',
    'A5 - - - - - F5 - . . . . . . . .',
    '. . . . . . . . G5 - - - Bb5 - D6 -',
    'C6 - - - Bb5 - G5 - . . . . . . . .',
    '. . . . . . . . F5 - G5 - Bb5 - C6 -',
    'A5 - - - - - - - . . . . . . . .',
  ],
  chords: [Gm, Eb, Bb, F, Gm, Eb, Bb, F],
};

const chorus = {
  lead: [
    'D6 - - - D6 - C6 - Bb5 - - - G5 - - -',
    'Bb5 - - - Bb5 - A5 - G5 - - - Eb5 - - -',
    'D6 - - - D6 - C6 - Bb5 - - - D6 - - -',
    'C6 - - - C6 - Bb5 - A5 - - - F5 - - -',
    'G6 - - - F6 - D6 - Bb5 - - - G5 - - -',
    'Eb6 - - - D6 - Bb5 - G5 - - - Bb5 - - -',
    'D6 - - - Bb5 - D6 - F6 - - - D6 - C6 -',
    'A5 - - - - - - - . . . . . . . .',
  ],
  chords: [Gm, Eb, Bb, F, Gm, Eb, Bb, F],
};

// Four to the floor, the clap on two and four, the open hat off the beat.
const BEAT = 'k . o . c . o . k . o . c . o .';
const FILL = 'k . o . c . o . k . c . c c c c';
const beat = [BEAT, BEAT, BEAT, FILL];

const sections = [verse, chorus];
const chords = sections.flatMap((section) => section.chords);

export const STUREPLAN = {
  id: 'stureplan',
  bpm: 124,
  loopBar: 2,
  instruments: {
    lead: { ...BAND.lead, duty: 0.25, gain: 0.07, decay: 0.15, sustain: 0.5 },
    harmony: { ...BAND.harmony, duty: 0.5, gain: 0.05, decay: 0.09, sustain: 0.25 },
    bass: { ...BAND.bass, gain: 0.27 },
  },
  bars: {
    lead: [...intro.lead, ...sections.flatMap((section) => section.lead)],
    harmony: [...intro.harmony, ...chords.map((chord) => chord.harmony)],
    bass: [...intro.bass, ...chords.map((chord) => chord.bass)],
    drums: [BEAT, FILL, ...beat, ...beat, ...beat, ...beat],
  },
};
