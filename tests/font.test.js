import test from 'node:test';
import assert from 'node:assert/strict';
import { ABOVE, GLYPHS, LINE_HEIGHT, textImage, textWidth } from '../src/art/font.js';
import { PALETTE } from '../src/palette.js';
import { getPixel } from '../src/pixels.js';

const SWEDISH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖabcdefghijklmnopqrstuvwxyzåäö0123456789.,:;!?-+/%()';

test('the font has every Swedish letter, both cases, digits and punctuation', () => {
  for (const char of SWEDISH) assert.ok(GLYPHS[char], `no glyph for '${char}'`);
});

test('the font has the four arrows, for the arrow keys', () => {
  for (const char of '←→↑↓') assert.ok(GLYPHS[char], `no glyph for '${char}'`);
});

test('text the font lacks fails loudly', () => {
  assert.throws(() => textWidth('Ω'), /no glyph for 'Ω'/);
});

test('glyphs are laid out with a pixel between them and a wider space', () => {
  assert.equal(textWidth(''), 0);
  assert.equal(textWidth('I'), GLYPHS.I.width);
  assert.equal(textWidth('II'), 2 * GLYPHS.I.width + 1);
  assert.equal(textWidth('I I'), 2 * GLYPHS.I.width + 3 + 2);
});

test('Å, Ä and Ö reach above the capitals; g reaches below the line', () => {
  for (const char of 'ÅÄÖ') assert.ok(GLYPHS[char].dots.some(([, y]) => y < ABOVE), char);
  for (const char of 'AO') assert.ok(GLYPHS[char].dots.every(([, y]) => y >= ABOVE), char);
  assert.ok(GLYPHS.g.dots.some(([, y]) => y >= ABOVE + 7));
});

test('a text image is the text in its colour with the shadow behind', () => {
  const plain = textImage('.', 'white');
  assert.equal(plain.width, 1);
  assert.equal(plain.height, LINE_HEIGHT);
  const shadowed = textImage('.', 'white', 'ink');
  assert.equal(shadowed.width, 2);
  const [[x, y]] = GLYPHS['.'].dots;
  assert.equal(getPixel(shadowed, x, y), PALETTE.white);
  assert.equal(getPixel(shadowed, x + 1, y + 1), PALETTE.ink);
});
