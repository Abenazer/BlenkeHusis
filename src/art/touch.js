// The touch controls' pictures: the pad (its ring with arrows, and the
// knob that follows the thumb), and round buttons for jump, act and pause,
// each as it rests and as it is pressed. Drawn over the play, half seen
// through, so they are plain discs with a symbol.
import { colour } from '../palette.js';
import { createImage, parsePixels, setPixel, stamp } from '../pixels.js';

const PAD_RADIUS = 20;
const KNOB_RADIUS = 8;
const JUMP_RADIUS = 14;
const ACT_RADIUS = 11;
const PAUSE_RADIUS = 8;

const RESTING = { fill: 'grey_2', rim: 'grey_4', symbol: 'grey_6' };
const PRESSED = { fill: 'hivis_2', rim: 'hivis_4', symbol: 'ink' };

// A disc of the radius, inked round, its rim lit along the top left so it
// stands out from the play behind it: 2 * radius + 1 pixels across.
function disc(radius, look) {
  const size = 2 * radius + 1;
  const image = createImage(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - radius;
      const dy = y - radius;
      const distance = Math.hypot(dx, dy);
      if (distance > radius + 0.4) continue;
      let name = look.fill;
      if (distance > radius - 0.6) name = 'ink';
      else if (distance > radius - 1.6 && dx + dy < 0) name = look.rim;
      setPixel(image, x, y, colour(name));
    }
  }
  return image;
}

// A symbol stamped in the middle of a disc, in the look's symbol colour.
function withSymbol(base, rows, look, name) {
  const symbol = parsePixels(rows, { W: look.symbol }, name);
  const image = { ...base, pixels: [...base.pixels] };
  stamp(image, symbol, Math.floor((base.width - symbol.width) / 2), Math.floor((base.height - symbol.height) / 2));
  return image;
}

const JUMP_SYMBOL = [
  '....W....',
  '...WWW...',
  '..WWWWW..',
  '.WWWWWWW.',
  'WWWWWWWWW',
  '...WWW...',
  '...WWW...',
  '...WWW...',
];

// An open hand: the act key helps, reads, lifts and throws.
const ACT_SYMBOL = [
  '..W.W.W..',
  '..W.W.W.W',
  'W.W.W.W.W',
  'W.WWWWWWW',
  'WWWWWWWWW',
  '.WWWWWWWW',
  '.WWWWWWW.',
  '..WWWWW..',
];

const PAUSE_SYMBOL = [
  'WW.WW',
  'WW.WW',
  'WW.WW',
  'WW.WW',
  'WW.WW',
];

const ARROW_LEFT = [
  '...W',
  '..WW',
  '.WWW',
  'WWWW',
  '.WWW',
  '..WW',
  '...W',
];

const ARROW_DOWN = [
  'WWWWWWW',
  '.WWWWW.',
  '..WWW..',
  '...W...',
];

function mirror(rows) {
  return rows.map((row) => [...row].reverse().join(''));
}

// The pad's ring with an arrow at each way it moves: left, right, down.
function pad() {
  const image = disc(PAD_RADIUS, RESTING);
  const look = { W: RESTING.symbol };
  const left = parsePixels(ARROW_LEFT, look, 'pad left');
  const right = parsePixels(mirror(ARROW_LEFT), look, 'pad right');
  const down = parsePixels(ARROW_DOWN, look, 'pad down');
  const middle = Math.floor((image.height - left.height) / 2);
  stamp(image, left, 3, middle);
  stamp(image, right, image.width - 3 - right.width, middle);
  stamp(image, down, Math.floor((image.width - down.width) / 2), image.height - 3 - down.height);
  return image;
}

function button(radius, symbol, name) {
  return {
    resting: withSymbol(disc(radius, RESTING), symbol, RESTING, name),
    pressed: withSymbol(disc(radius, PRESSED), symbol, PRESSED, name),
  };
}

// The knob is grey as the thumb walks and lit as it runs.
export const TOUCH_ART = {
  pad: pad(),
  knob: { resting: disc(KNOB_RADIUS, { ...RESTING, fill: 'grey_5', rim: 'grey_6' }), pressed: disc(KNOB_RADIUS, PRESSED) },
  jump: button(JUMP_RADIUS, JUMP_SYMBOL, 'jump'),
  act: button(ACT_RADIUS, ACT_SYMBOL, 'act'),
  pause: button(PAUSE_RADIUS, PAUSE_SYMBOL, 'pause'),
};

// Shown while a phone is held upright where the game can't turn it: the
// phone upright, an arrow, and the phone on its side.
export const TURN_ART = parsePixels([
  'kkkkkkkkk......................',
  'kWWWWWWWk......................',
  'kWsssssWk......................',
  'kWsssssWk......................',
  'kWsssssWk.......kkkkkkkkkkkkkkk',
  'kWsssssWk.......kWWWWWWWWWWWWWk',
  'kWsssssWk....h..kWsssssssssssWk',
  'kWsssssWk....hh.kWsssssssssssWk',
  'kWsssssWkhhhhhhhkWssssssssssskk',
  'kWsssssWk....hh.kWsssssssssssWk',
  'kWsssssWk....h..kWsssssssssssWk',
  'kWsssssWk.......kWWWWWWWWWWWWWk',
  'kWWWWWWWk.......kkkkkkkkkkkkkkk',
  'kWWWkWWWk......................',
  'kkkkkkkkk......................',
], { k: 'ink', W: 'grey_5', s: 'sky_2', h: 'hivis_3' }, 'turn the phone');
