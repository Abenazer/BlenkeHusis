// The title theme: a jaunty march in C, the police band at a ribbon
// cutting. Sixteen bars that loop: a phrase, its answer, a stamping
// bridge, the answer again.

// Oom on the beat in the bass, pah off it in the harmony.
const oom = (root, fifth) => `${root} - ${fifth} - ${root} - ${fifth} -`;
const oomSplit = (root1, fifth1, root2, fifth2) => `${root1} - ${fifth1} - ${root2} - ${fifth2} -`;
const pah = (a, b) => `. ${a} . ${b} . ${a} . ${b}`;
const pahSplit = (a1, b1, a2, b2) => `. ${a1} . ${b1} . ${a2} . ${b2}`;

const phrase = {
  lead: [
    'C5 E5 G5 C6 - B5 G5 E5',
    'A5 - - G5 E5 - C5 -',
    'F5 A5 C6 - D6 C6 A5 F5',
    'G5 - B5 - D6 - . .',
  ],
  harmony: [pah('E4', 'G4'), pah('C4', 'E4'), pah('A4', 'C5'), pah('B4', 'D5')],
  bass: [oom('C3', 'G2'), oom('A2', 'E2'), oom('F2', 'C3'), oom('G2', 'D3')],
};

const answer = {
  lead: [
    'C5 E5 G5 C6 - B5 G5 E5',
    'A5 - C6 - E6 - D6 C6',
    'C6 - A5 F5 D6 - B5 G5',
    'C6 - G5 - C6 - . .',
  ],
  harmony: [pah('E4', 'G4'), pah('C4', 'E4'), pahSplit('A4', 'C5', 'B4', 'D5'), pah('E4', 'G4')],
  bass: [oom('C3', 'G2'), oom('A2', 'E2'), oomSplit('F2', 'C3', 'G2', 'D3'), oom('C3', 'G2')],
};

// The bridge stamps its notes, three in a row, like forms in triplicate.
const bridge = {
  lead: [
    'A5 . A5 . A5 . F5 . C6 - - - A5 - - -',
    'B5 . B5 . B5 . G5 . D6 - - - B5 - - -',
    'G5 - E5 - B5 - G5 - A5 - E5 - C6 - A5 -',
    'F#5 - A5 - C6 - F#5 - G5 - - - B5 - D6 -',
  ],
  harmony: [pah('A4', 'C5'), pah('B4', 'D5'), pahSplit('G4', 'B4', 'C5', 'E5'), pahSplit('F#4', 'C5', 'B4', 'D5')],
  bass: [oom('F2', 'C3'), oom('G2', 'D3'), oomSplit('E2', 'B2', 'A2', 'E2'), oomSplit('D2', 'A2', 'G2', 'D3')],
};

const MARCH = 'k . h . s . h . k . h k s . h .';
const FILL = 'k . h . s . h . s . s . s s s s';
const drums = (last) => [MARCH, MARCH, MARCH, last];

const sections = [phrase, answer, bridge, answer];

export const TITLE = {
  id: 'title',
  bpm: 150,
  loopBar: 0,
  instruments: {
    lead: { wave: 'pulse', duty: 0.5, gain: 0.09, attack: 0.003, decay: 0.2, sustain: 0.55, release: 0.02 },
    harmony: { wave: 'pulse', duty: 0.25, gain: 0.04, attack: 0.003, decay: 0.06, sustain: 0.3, release: 0.02 },
    bass: { wave: 'triangle', gain: 0.28, attack: 0.003, release: 0.02 },
  },
  bars: {
    lead: sections.flatMap((section) => section.lead),
    harmony: sections.flatMap((section) => section.harmony),
    bass: sections.flatMap((section) => section.bass),
    drums: [...drums(MARCH), ...drums(FILL), ...drums(FILL), ...drums(FILL)],
  },
};
