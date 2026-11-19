// The police van, a 1990s piketbuss, standing past the filling station
// at the end of world 2's levels in the police car's place, drawn in code
// until the asset factory delivers it (batch 26): a tall white van
// facing right, a blue stripe and POLIS on its side, the blue lights on
// its roof. Standing on its bottom row, placed by its bottom left corner
// as a delivered piece of scenery is. Pure: no DOM.
import { colour } from '../palette.js';
import { createImage, fillRect, setPixel, stamp } from '../pixels.js';
import { textImage } from './font.js';

const WIDTH = 64;
const HEIGHT = 32;

// A wheel: a disc of ink round a grey hub, its bottom on the image's.
function wheel(image, middle) {
  const radius = 5;
  const centreY = HEIGHT - 1 - radius;
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      const distance = Math.hypot(x, y);
      if (distance > radius + 0.3) continue;
      setPixel(image, middle + x, centreY + y, colour(distance < 2 ? 'grey_4' : distance < 3 ? 'grey_2' : 'ink'));
    }
  }
}

function policeVan() {
  const image = createImage(WIDTH, HEIGHT);
  const fill = (x, y, width, height, name) => fillRect(image, x, y, width, height, colour(name));
  // The blue lights on the roof, in a bar.
  fill(22, 1, 16, 4, 'ink');
  fill(23, 2, 6, 2, 'blue_4');
  fill(31, 2, 6, 2, 'blue_4');
  fill(24, 2, 2, 1, 'blue_5');
  fill(32, 2, 2, 1, 'blue_5');
  // The body: white, its roof a shade darker, outlined in ink, the nose
  // sloping down at the front.
  fill(2, 5, 56, 22, 'ink');
  fill(58, 10, 4, 17, 'ink');
  fill(3, 6, 54, 20, 'grey_6');
  fill(57, 11, 4, 15, 'grey_6');
  fill(3, 6, 54, 1, 'grey_5');
  // The windscreen and the side windows, dark, with a glint.
  fill(50, 8, 7, 7, 'grey_2');
  fill(57, 11, 3, 4, 'grey_2');
  fill(51, 9, 2, 1, 'grey_4');
  for (const x of [6, 19, 32]) {
    fill(x, 8, 11, 6, 'grey_2');
    fill(x + 1, 9, 3, 1, 'grey_4');
  }
  // The blue stripe and POLIS above it.
  fill(3, 21, 58, 2, 'blue_3');
  stamp(image, textImage('POLIS', 'blue_3'), 18, 12);
  // The bumpers and the headlamp.
  fill(1, 24, 3, 3, 'grey_3');
  fill(57, 24, 6, 3, 'grey_3');
  fill(60, 18, 2, 2, 'urine_4');
  fill(2, 18, 1, 2, 'red_3');
  // The wheels.
  wheel(image, 13);
  wheel(image, 49);
  return image;
}

export const POLICE_VAN_ART = {
  fps: 1,
  frames: [{ image: policeVan(), originX: 0, originY: HEIGHT }],
};
