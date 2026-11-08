// Every sound effect held to the rules in src/soundcheck.js: it starts at
// once, never reaches full scale, ends without a click, is over quickly and
// sits in the mix with the others.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkEffect } from '../src/soundcheck.js';
import { SOUNDS } from '../src/sounds.js';
import { renderSound, SAMPLE_RATE } from '../src/synth.js';

for (const [id, sound] of Object.entries(SOUNDS)) {
  test(`the sound '${id}' starts at once, fits under full scale, ends in silence and sits in the mix`, () => {
    for (const { name, pass, detail } of checkEffect(renderSound(sound), SAMPLE_RATE)) assert.ok(pass, `${name}: ${detail}`);
  });
}

test('a sound sets only its voices, a channel and a minimum gap', () => {
  for (const [id, sound] of Object.entries(SOUNDS)) {
    assert.deepEqual(Object.keys(sound).filter((key) => !['voices', 'channel', 'minGap'].includes(key)), [], id);
    if ('minGap' in sound) assert.ok(sound.minGap > 0, id);
    if ('channel' in sound) assert.equal(typeof sound.channel, 'string', id);
  }
});
