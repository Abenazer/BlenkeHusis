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
  figurer: [],
};
