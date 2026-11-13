// Describes the asset factory's delivered sheets, for wiring up a delivery
// (.claude/skills/factory-delivery): each sheet's frames (their size, the
// origin they are placed by and the box their opaque pixels fill), its
// animations and their rates; or one frame's pixels as text, a letter per
// colour, to compare with the sheet it replaces or the game's needs.
//
//   node tools/sheetinfo.js                   the sheets new or changed since the last commit
//   node tools/sheetinfo.js --since HEAD~1    … since another commit (a delivery already committed)
//   node tools/sheetinfo.js all               every delivered sheet
//   node tools/sheetinfo.js goth skater       those sheets
//   node tools/sheetinfo.js --pixels raggare [move_1]   a frame's pixels (the first frame if none is named)
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { opaqueBox } from '../src/pixels.js';
import { deliveredSheets, MANIFEST, sheetFrames, SPRITES_PATH } from '../src/sprites.js';
import { crop, readPng } from '../tests/png.js';

const LETTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const manifest = JSON.parse(readFileSync(join(SPRITES_PATH, MANIFEST), 'utf8'));
const sheets = new Map(deliveredSheets(manifest).map((sheet) => [sheet.sprite, sheet]));

function load(sprite) {
  const sheet = sheets.get(sprite);
  if (!sheet) {
    console.error(`No delivered sprite '${sprite}'`);
    process.exit(1);
  }
  const description = JSON.parse(readFileSync(join(SPRITES_PATH, sheet.description), 'utf8'));
  const picture = readPng(readFileSync(join(SPRITES_PATH, sheet.image)), sheet.image);
  return { sheet, description, picture, frames: sheetFrames(description) };
}

// The sprites whose files differ from the manifest in a commit, split into
// those new to the game and those redelivered.
function changedSince(commit) {
  let before;
  try {
    before = JSON.parse(execFileSync('git', ['show', `${commit}:${SPRITES_PATH}/${MANIFEST}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
  } catch (error) {
    console.error(`Cannot read the manifest in ${commit}; name the sheets, or use "all"`, { error: error.message });
    process.exit(1);
  }
  const old = new Map(before.files.map((file) => [file.path, file]));
  const known = new Set(before.files.map((file) => file.sprite));
  const changed = new Set(manifest.files.filter((file) => old.get(file.path)?.sha256 !== file.sha256).map((file) => file.sprite));
  return { added: [...changed].filter((sprite) => !known.has(sprite)), redelivered: [...changed].filter((sprite) => known.has(sprite)) };
}

function describe(sprite) {
  const { sheet, description, picture, frames } = load(sprite);
  const lines = [`${sprite} (${sheet.category})`];
  for (const [name, frame] of Object.entries(frames)) {
    const box = opaqueBox(crop(picture, frame));
    const filled = box.right > box.left ? `opaque ${box.right - box.left}×${box.bottom - box.top} at ${box.left},${box.top}` : 'empty';
    lines.push(`  ${name}: ${frame.w}×${frame.h}, origin ${frame.originX},${frame.originY}, ${filled}`);
  }
  for (const [name, names] of Object.entries(description.animations ?? {})) {
    const playback = description.meta.playback?.[name];
    lines.push(`  animation ${name}: ${names.join(' ')}${playback ? ` at ${playback.fps} fps${playback.loop ? ', looped' : ''}` : ', no playback'}`);
  }
  return lines.join('\n');
}

function pixels(sprite, frameName) {
  const { frames, picture } = load(sprite);
  const name = frameName ?? Object.keys(frames)[0];
  const frame = frames[name];
  if (!frame) {
    console.error(`'${sprite}' has no frame '${name}'; it has ${Object.keys(frames).join(', ')}`);
    process.exit(1);
  }
  const image = crop(picture, frame);
  const legend = new Map();
  const rows = [];
  for (let y = 0; y < image.height; y++) {
    let row = '';
    for (let x = 0; x < image.width; x++) {
      const value = image.pixels[y * image.width + x];
      if (value === null) {
        row += '.';
        continue;
      }
      if (!legend.has(value)) legend.set(value, LETTERS[legend.size] ?? '?');
      row += legend.get(value);
    }
    rows.push(`${String(y).padStart(3)} ${row}`);
  }
  // The origin's column, under the frame.
  const column = `    ${' '.repeat(frame.originX)}^ origin ${frame.originX},${frame.originY}`;
  const colours = [...legend].map(([value, letter]) => `${letter} ${value}`).join('  ');
  return [`${sprite} ${name}, ${frame.w}×${frame.h}`, ...rows, column, colours].join('\n');
}

const args = process.argv.slice(2);
if (args[0] === '--pixels') {
  if (!args[1]) {
    console.error('Name a sheet: node tools/sheetinfo.js --pixels <sprite> [frame]');
    process.exit(1);
  }
  console.log(pixels(args[1], args[2]));
} else if (args[0] === 'all') {
  console.log([...sheets.keys()].map(describe).join('\n\n'));
} else if (args.length > 0 && args[0] !== '--since') {
  console.log(args.map(describe).join('\n\n'));
} else {
  const commit = args[0] === '--since' ? args[1] ?? 'HEAD' : 'HEAD';
  const { added, redelivered } = changedSince(commit);
  if (added.length + redelivered.length === 0) console.log(`Nothing delivered since ${commit}.`);
  if (added.length > 0) console.log(`New: ${added.join(' ')}\n\n${added.map(describe).join('\n\n')}`);
  if (redelivered.length > 0) console.log(`\nRedelivered: ${redelivered.join(' ')}\n\n${redelivered.map(describe).join('\n\n')}`);
}
