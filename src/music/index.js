// The game's songs, by id, in the order they are rendered (the title's
// first, as it plays first).
import { GAME_OVER, HIGH_SCORE, LEVEL_COMPLETE, REPORT } from './jingles.js';
import { PROSECUTOR } from './prosecutor.js';
import { SUBURBS } from './suburbs.js';
import { TITLE } from './title.js';

export const SONGS = {
  title: TITLE,
  suburbs: SUBURBS,
  levelComplete: LEVEL_COMPLETE,
  gameOver: GAME_OVER,
  prosecutor: PROSECUTOR,
  report: REPORT,
  highScore: HIGH_SCORE,
};
