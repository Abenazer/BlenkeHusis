// The game's master palette: the one the asset factory's sprites are drawn
// in (../../gameassetfactory, games/blenkehusis/game.toml), so the art drawn
// in code here and the factory's sheets look like one game. Every colour is
// a SNES colour, 5 bits a channel. Ramps run from dark (_1) to light.

export const PALETTE = Object.freeze({
  ink: '#100819',
  grey_1: '#212131',
  grey_2: '#424252',
  grey_3: '#63637b',
  grey_4: '#8c94a5',
  grey_5: '#bdbdce',
  grey_6: '#e6efef',
  white: '#ffffff',
  skin_1: '#4a2921',
  skin_2: '#8c4a3a',
  skin_3: '#c57b5a',
  skin_4: '#efad8c',
  skin_5: '#ffd6b5',
  blue_1: '#081031',
  blue_2: '#19295a',
  blue_3: '#29429c',
  blue_4: '#426bce',
  blue_5: '#7ba5ef',
  hivis_1: '#5a6b00',
  hivis_2: '#a5b500',
  hivis_3: '#d6ef00',
  hivis_4: '#efff73',
  urine_1: '#6b4208',
  urine_2: '#b57b10',
  urine_3: '#e6b529',
  urine_4: '#ffe66b',
  slime_1: '#083a21',
  slime_2: '#107b3a',
  slime_3: '#3abd4a',
  slime_4: '#a5ef63',
  grass_1: '#103121',
  grass_2: '#215a29',
  grass_3: '#428c3a',
  grass_4: '#73bd4a',
  sky_1: '#295ab5',
  sky_2: '#4a84de',
  sky_3: '#84b5f7',
  sky_4: '#c5e6ff',
  water_1: '#08294a',
  water_2: '#105a7b',
  water_3: '#2994ad',
  water_4: '#73cede',
  red_1: '#3a1019',
  red_2: '#731921',
  red_3: '#bd3129',
  red_4: '#ef6b4a',
  brown_1: '#311910',
  brown_2: '#5a3a21',
  brown_3: '#946331',
  brown_4: '#c5945a',
  orange_1: '#8c3a08',
  orange_2: '#de7b19',
  orange_3: '#ffad4a',
  purple_1: '#291042',
  purple_2: '#5a2184',
  purple_3: '#9c42c5',
  purple_4: '#f79cef',
});

const PALETTE_COLOURS = new Set(Object.values(PALETTE));

export function isPaletteColour(colour) {
  return PALETTE_COLOURS.has(colour);
}

// The colour a palette name stands for; an unknown name fails loudly, so a
// typo in a legend is found when the art is made, not as a missing pixel.
export function colour(name) {
  const value = PALETTE[name];
  if (!value) throw new Error(`Unknown palette colour '${name}'`);
  return value;
}
