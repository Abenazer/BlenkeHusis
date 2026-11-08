// Renders every sound effect and song and writes a page to listen to them
// on, like the asset factory's audition pages: one HTML page with the WAV
// files beside it, which opens straight from disk (no server), so it can
// go in the author's Dropbox.
//
//   node tools/audition.js ~/Dropbox/audio/blenkehusis
//
// The page shows what the game plays: each effect and song as rendered,
// at the game's own levels, its waveform, its numbers and the checks the
// tests hold it to (src/soundcheck.js).
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MASTER_GAIN, MUSIC_GAIN } from '../src/audio.js';
import { COMBO_STEPS } from '../src/cues.js';
import { barTime, renderSong } from '../src/music.js';
import { SONGS } from '../src/music/index.js';
import { checkEffect, checkSong, decibels, loudestLevel, peakOf } from '../src/soundcheck.js';
import { SOUNDS } from '../src/sounds.js';
import { renderSound, SAMPLE_RATE } from '../src/synth.js';

// The effects in groups, each with when the game plays it. An effect
// missing here still shows, under Other.
const GROUPS = [
  ['Blenke', {
    jump: 'He leaves the ground.',
    land: 'He lands: louder the harder the fall, silent below 100 px/s (played here at full).',
    bump: 'His head hits a ceiling, or a crate from below.',
  }],
  ['Pickups', {
    sample: 'A urine sample. Each pickup in a combo plays a step higher up the major scale (Combo).',
    possession: 'Minor possession: a little fanfare for 0.02 grams.',
    evidence: 'Evidence: two thin, official notes.',
    bonus: 'A bonus item: a run up a major chord.',
  }],
  ['Hurt and lives', {
    hurt: 'He loses a heart.',
    shielded: 'The paperwork shield takes the hit: a stamp and a ping.',
    lifeLost: 'A life lost to his last heart.',
    fall: 'A life lost to a pit: a slide whistle down.',
    drown: 'A life lost to deep water.',
    timeUp: 'A life lost to the clock: a buzzer.',
  }],
  ['The clock', {
    hurry: 'Thirty seconds left (the clock turns red).',
    tick: 'Each of the last ten seconds; the last three a fifth higher.',
  }],
  ['Enemies', {
    stomp: 'He lands on an enemy.',
    struck: 'A thrown cone hits an enemy.',
    wounded: 'The prosecutor takes a hit and stands.',
    bossAwake: 'The prosecutor wakes: three bangs of the gavel.',
    throw: 'An enemy on screen throws paperwork, a tube or a binder.',
    shout: 'An ideologue on screen shouts a slogan.',
    drop: 'A stoner on screen drops a bag.',
  }],
  ['Power-ups', {
    policeCoffee: 'Police coffee: a jittery rush upwards.',
    paperworkShield: 'Paperwork shield: a stamp, then approved.',
    mandatoryTesting: 'Mandatory testing: a scanner beep-boop.',
    budgetIncrease: 'Budget increase: ka-ching.',
    superBladder: 'Super bladder: a gurgle filling up.',
    helicopter: 'Police helicopter: rotor chops over a rising whine.',
    powerDown: 'A power-up runs out.',
  }],
  ['The level', {
    crate: 'A crate splits open.',
    promoted: 'A promotion to the next rank.',
    helped: 'A citizen helped: two half-hearted notes, worth less than a tin.',
    read: 'A sign read.',
    lifted: 'A cone lifted.',
    tossed: 'A cone thrown.',
    secret: 'A secret room found.',
    checkpoint: 'A checkpoint passed.',
    gate: 'The barrier lifts after the prosecutor.',
  }],
  ['Screens', {
    menuMove: 'A menu\'s mark moves.',
    menuChoose: 'A choice taken, or a name signed.',
    advance: 'Going on from the controls, a report, the game over or the list.',
    pause: 'The game paused.',
    resume: 'The game going on (with the pause key).',
    letter: 'A letter typed for the high scores.',
    erase: 'A letter rubbed out.',
    refuse: 'A key the name won\'t take.',
    bonusTick: 'The time bonus counting into the score.',
    tally: 'The last of the time bonus in.',
  }],
];

const SONG_NOTES = {
  title: 'The title, the controls and the high scores.',
  suburbs: 'World 1, the suburbs. Starts again after a lost life.',
  prosecutor: 'While the prosecutor fights, from waking until he is beaten.',
  levelComplete: 'Reaching the goal, before the report.',
  gameOver: 'The last life lost, on to the game over screen.',
  report: 'Under the police performance report and the year\'s report.',
  highScore: 'A score that makes the list, as the name is typed.',
};

const REPO = fileURLToPath(new URL('..', import.meta.url));

// Columns in a waveform picture.
const COLUMNS = 480;

function wav(samples, gain) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((sample, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample * gain)) * 32767), i * 2));
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

// The lowest and highest sample in each column, for the page to draw,
// scaled to the sound's own peak so a quiet one can be seen too (its
// numbers give its level).
function waveform(samples) {
  const low = [];
  const high = [];
  const per = samples.length / COLUMNS;
  const scale = 1 / Math.max(peakOf(samples), 1e-6);
  for (let column = 0; column < COLUMNS; column++) {
    let min = 0;
    let max = 0;
    for (let i = Math.floor(column * per); i < Math.floor((column + 1) * per); i++) {
      min = Math.min(min, samples[i]);
      max = Math.max(max, samples[i]);
    }
    low.push(Number((min * scale).toFixed(3)));
    high.push(Number((max * scale).toFixed(3)));
  }
  return { low, high };
}

// A loop is written as it plays: its start once, then the loop twice, so
// the seam is heard.
function asPlayed({ samples, loopStart }) {
  if (loopStart === null) return { samples, marks: [] };
  const start = Math.round(loopStart * SAMPLE_RATE);
  const played = new Float32Array(samples.length * 2 - start);
  played.set(samples);
  played.set(samples.subarray(start), samples.length);
  return { samples: played, marks: [loopStart, samples.length / SAMPLE_RATE] };
}

function escape(text) {
  return String(text).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function checksText(checks) {
  return checks.map(({ name, pass, detail }) => `${pass ? 'PASS' : 'FAIL'}  ${name.padEnd(7)} ${detail}`).join('\n');
}

function effectEntry(id, about, group) {
  const sound = SOUNDS[id];
  const samples = renderSound(sound);
  const checks = checkEffect(samples, SAMPLE_RATE);
  const traits = [];
  if (sound.channel) traits.push(`cuts off the ${sound.channel} channel`);
  if (sound.minGap) traits.push(`at most every ${sound.minGap * 1000} ms`);
  return {
    id,
    group,
    about,
    file: `effects/${id}.wav`,
    bytes: wav(samples, MASTER_GAIN),
    numbers: [`${Math.round((samples.length / SAMPLE_RATE) * 1000)} ms`, `peak ${decibels(peakOf(samples)).toFixed(1)} dBFS`,
      `loudest 50 ms ${loudestLevel(samples, SAMPLE_RATE).toFixed(1)} dBFS`, `${sound.voices.length} voice${sound.voices.length === 1 ? '' : 's'}`, ...traits],
    waveform: waveform(samples),
    marks: [],
    checks,
    combo: SOUNDS[id].channel === 'pickup',
  };
}

function songEntry(id) {
  const song = SONGS[id];
  const result = renderSong(song, SAMPLE_RATE);
  const checks = checkSong(result, SAMPLE_RATE);
  const { samples, marks } = asPlayed(result);
  const bars = Object.values(song.bars)[0].length;
  const kind = result.loopStart === null ? 'jingle, played once' : `loops from bar ${song.loopBar + 1}, written here with the loop twice`;
  return {
    id,
    group: 'Music',
    about: SONG_NOTES[id] ?? '',
    file: `music/${id}.wav`,
    bytes: wav(samples, MASTER_GAIN * MUSIC_GAIN),
    numbers: [`${song.bpm} bpm`, `${bars} bars of ${barTime(song).toFixed(2)} s`, `${result.duration.toFixed(1)} s`, kind,
      `peak ${decibels(peakOf(result.samples)).toFixed(1)} dBFS`],
    waveform: waveform(samples),
    marks: marks.map((time) => time / (samples.length / SAMPLE_RATE)),
    checks,
    combo: false,
  };
}

function card(entry) {
  const failed = entry.checks.some((check) => !check.pass);
  return `<section class="card" data-file="${entry.file}"${entry.combo ? ' data-combo' : ''}>
<h3>${escape(entry.id)} <span class="verdict ${failed ? 'fail' : 'pass'}">${failed ? 'fails checks' : 'passes checks'}</span></h3>
<p>${escape(entry.about)}</p>
<div class="controls"><button type="button" class="play">▶ Play</button>${entry.combo ? '<button type="button" class="combo">▶ Combo</button>' : ''}<a href="${entry.file}" class="label">${entry.file}</a></div>
<canvas class="wave" width="960" height="120" data-wave='${JSON.stringify(entry.waveform)}' data-marks='${JSON.stringify(entry.marks)}'></canvas>
<p class="meta">${entry.numbers.map(escape).join(' · ')}</p>
<pre>${escape(checksText(entry.checks))}</pre>
</section>`;
}

function page(entries, { commit, date }) {
  const failing = entries.filter((entry) => entry.checks.some((check) => !check.pass));
  const effects = entries.filter((entry) => entry.group !== 'Music').length;
  const groups = [...new Set(entries.map((entry) => entry.group))];
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Blenke Husis sounds</title>
<style>
:root { --bg: #f6f6f4; --fg: #1d1d1f; --muted: #66666c; --card: #ffffff; --line: #dcdcd8;
  --pass: #1f7a3a; --fail: #b3261e; --accent: #2b59c3; --wave: #2b59c3; --mark: #d0388a; }
@media (prefers-color-scheme: dark) {
  :root { --bg: #141416; --fg: #ececee; --muted: #9a9aa2; --card: #1e1e22; --line: #33333a;
    --pass: #5cc27a; --fail: #f2766d; --accent: #8fb0ff; --wave: #8fb0ff; --mark: #ff7ab8; } }
body { margin: 0; padding: 24px 16px 48px; background: var(--bg); color: var(--fg);
  font: 15px/1.5 system-ui, sans-serif; }
main { max-width: 1100px; margin: 0 auto; }
h1 { font-size: 1.5rem; margin: 0 0 4px; }
h2 { font-size: 1.2rem; margin: 28px 0 8px; }
h3 { font-size: 1.05rem; margin: 0 0 4px; }
.meta, .note, .label { color: var(--muted); }
.label { font-size: 0.85rem; }
.card { background: var(--card); border: 1px solid var(--line); border-radius: 10px;
  padding: 16px; margin: 12px 0; }
.card p { margin: 4px 0; }
.verdict { font-weight: 600; font-size: 0.9rem; margin-left: 8px; } .pass { color: var(--pass); } .fail { color: var(--fail); }
.controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 8px 0; }
button { font: inherit; padding: 4px 12px; border-radius: 6px; border: 1px solid var(--line);
  background: var(--bg); color: var(--fg); cursor: pointer; }
button.playing { border-color: var(--accent); color: var(--accent); }
canvas.wave { display: block; width: 100%; height: 60px; }
pre { white-space: pre-wrap; font-size: 0.8rem; color: var(--muted); margin: 6px 0 0; }
nav { display: flex; flex-wrap: wrap; gap: 4px 12px; margin: 8px 0; }
</style>
</head>
<body>
<main>
<h1>Blenke Husis &amp; Urinjakten: sounds</h1>
<p class="meta">${effects} effects · ${entries.length - effects} songs · ${SAMPLE_RATE} Hz, synthesized in code ·
<span class="verdict ${failing.length ? 'fail' : 'pass'}">${failing.length ? `${failing.length} fail checks` : 'all pass checks'}</span><br>
Rendered ${escape(date)} from commit ${escape(commit)}.</p>
<p class="note">Each file is written at the level the game plays it (effects at the master level, ${MASTER_GAIN};
music at the music level under it, ${MASTER_GAIN * MUSIC_GAIN}), so they compare as in the game. The checks are the ones
the tests hold every sound to (src/soundcheck.js). On a loop's waveform, the marks are where the loop starts and
where it goes round; each waveform is scaled to its own peak. To change a sound, say so; they are made in src/sounds.js and src/music/.</p>
<nav>${groups.map((group) => `<a href="#${escape(group)}">${escape(group)}</a>`).join('')}</nav>
${groups.map((group) => `<h2 id="${escape(group)}">${escape(group)}</h2>\n${entries.filter((entry) => entry.group === group).map(card).join('\n')}`).join('\n')}
</main>
<script>
const COMBO = ${JSON.stringify(COMBO_STEPS)};
let current = null;

function stop() {
  if (!current) return;
  current.audio.pause();
  current.button.classList.remove('playing');
  current = null;
}

function draw(canvas, progress) {
  const { low, high } = JSON.parse(canvas.dataset.wave);
  const marks = JSON.parse(canvas.dataset.marks);
  const ctx = canvas.getContext('2d');
  const style = getComputedStyle(document.documentElement);
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  const step = width / low.length;
  low.forEach((min, i) => {
    ctx.fillStyle = i / low.length < progress ? style.getPropertyValue('--accent') : style.getPropertyValue('--wave');
    ctx.globalAlpha = i / low.length < progress ? 1 : 0.55;
    const top = (1 - high[i]) * height / 2;
    ctx.fillRect(i * step, top, Math.max(step - 0.5, 1), Math.max((high[i] - min) * height / 2, 1));
  });
  ctx.globalAlpha = 1;
  ctx.fillStyle = style.getPropertyValue('--mark');
  for (const mark of marks) ctx.fillRect(mark * width - 1, 0, 2, height);
}

for (const card of document.querySelectorAll('.card')) {
  const canvas = card.querySelector('canvas');
  draw(canvas, 0);
  const button = card.querySelector('.play');
  button.addEventListener('click', () => {
    const playing = current?.button === button;
    stop();
    if (playing) return;
    const audio = new Audio(card.dataset.file);
    current = { audio, button };
    button.classList.add('playing');
    const tick = () => {
      if (current?.audio !== audio) return draw(canvas, 0);
      draw(canvas, audio.duration ? audio.currentTime / audio.duration : 0);
      requestAnimationFrame(tick);
    };
    audio.addEventListener('ended', () => { if (current?.audio === audio) stop(); });
    audio.play().then(tick);
  });
  // A combo: the pickup eight times, 150 ms apart, each a step higher,
  // each cutting off the one before, as the game plays it.
  card.querySelector('.combo')?.addEventListener('click', () => {
    stop();
    let last = null;
    COMBO.forEach((step, i) => setTimeout(() => {
      last?.pause();
      last = new Audio(card.dataset.file);
      last.preservesPitch = false;
      last.playbackRate = 2 ** (step / 12);
      last.play();
    }, i * 150));
  });
}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  for (const canvas of document.querySelectorAll('canvas')) draw(canvas, 0);
});
</script>
</body>
</html>
`;
}

function main() {
  const out = process.argv[2];
  if (!out) {
    console.error('Usage: node tools/audition.js <directory>   (for instance ~/Dropbox/audio/blenkehusis)');
    process.exit(1);
  }
  const directory = resolve(out);
  const listed = new Set(GROUPS.flatMap(([, sounds]) => Object.keys(sounds)));
  const unknown = [...listed].filter((id) => !SOUNDS[id]);
  if (unknown.length) throw new Error(`The page lists sounds that don't exist: ${unknown.join(', ')}`);
  const entries = [
    ...GROUPS.flatMap(([group, sounds]) => Object.entries(sounds).map(([id, about]) => effectEntry(id, about, group))),
    ...Object.keys(SOUNDS).filter((id) => !listed.has(id)).map((id) => effectEntry(id, '', 'Other')),
    ...Object.keys(SONGS).map(songEntry),
  ];
  mkdirSync(join(directory, 'effects'), { recursive: true });
  mkdirSync(join(directory, 'music'), { recursive: true });
  for (const entry of entries) writeFileSync(join(directory, entry.file), entry.bytes);
  const git = (...args) => execFileSync('git', args, { encoding: 'utf8', cwd: REPO }).trim();
  const commit = git('rev-parse', '--short', 'HEAD');
  const dirty = git('status', '--porcelain', 'src') ? ' with changes in src/' : '';
  const date = new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' });
  writeFileSync(join(directory, 'ljud.html'), page(entries, { commit: commit + dirty, date }));
  const failing = entries.filter((entry) => entry.checks.some((check) => !check.pass)).map((entry) => entry.id);
  console.log(`Wrote ${entries.length} sounds and ljud.html to ${directory}`);
  if (failing.length) console.log(`Failing checks: ${failing.join(', ')}`);
}

main();
