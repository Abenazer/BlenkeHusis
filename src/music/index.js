// The game's songs, by id, in the order they are rendered (the title's
// first, as it plays first, then the levels' in their playing order).
import { GAME_OVER, HIGH_SCORE, LEVEL_COMPLETE, REPORT } from './jingles.js';
import { JORDBRO } from './jordbro.js';
import { KRIGSLIDA } from './krigslida.js';
import { PROSECUTOR } from './prosecutor.js';
import { SUBURBS } from './suburbs.js';
import { TITLE } from './title.js';
import { TUNGELSTA } from './tungelsta.js';
import { VASTERHANINGE } from './vasterhaninge.js';
import { VILLASTAD } from './villastad.js';

export const SONGS = {
  title: TITLE,
  tungelsta: TUNGELSTA,
  krigslida: KRIGSLIDA,
  vasterhaninge: VASTERHANINGE,
  jordbro: JORDBRO,
  villastad: VILLASTAD,
  suburbs: SUBURBS,
  levelComplete: LEVEL_COMPLETE,
  gameOver: GAME_OVER,
  prosecutor: PROSECUTOR,
  report: REPORT,
  highScore: HIGH_SCORE,
};
