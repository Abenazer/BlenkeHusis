// Who is placed where, outside the levels' own text: for each level's id,
// the characters in it, each by its type (an enemy in src/enemies.js or a
// citizen in src/citizens.js) and the column it stands in. It stands on
// the highest floor of that column; give it a `row` too where it should
// stand lower down. Moving a character to another level, or taking it out,
// is changing its line here; the level's rows stay as they are.
//
// The subcultures belong to no level of the game yet: they stand in the
// try-out level, `figurer` (?bana=figurer), one after the other.
export const CAST = {
  figurer: [
    { type: 'hippie', col: 30 },
    { type: 'headbanger', col: 58 },
    { type: 'punk', col: 86 },
    { type: 'synth', col: 114 },
    { type: 'breakdancer', col: 142 },
    { type: 'raver', col: 168 },
    { type: 'goth', col: 198 },
    { type: 'raggare', col: 230 },
    { type: 'proggActivist', col: 270 },
  ],
};
