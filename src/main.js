// Entry point. Game logic modules stay free of the DOM (see AGENTS.md); this
// file is where they get wired to the page.
import { BUILD_TIME } from './build.js';
import { VERSION } from './version.js';

const root = document.getElementById('game');
const canvas = document.getElementById('screen');
const context = canvas.getContext('2d');

// The backing store follows the device pixel ratio so the canvas stays sharp
// on high-density screens; drawing happens in CSS pixels.
function resize() {
  const ratio = window.devicePixelRatio || 1;
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  draw(width, height);
}

function draw(width, height) {
  context.fillStyle = '#12141a';
  context.fillRect(0, 0, width, height);
  context.fillStyle = '#e8d44d';
  context.font = 'bold 32px system-ui, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('Super Lelle: Urine Hunt', width / 2, height / 2);
}

const built = BUILD_TIME
  ? ` · byggd ${new Date(BUILD_TIME).toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm' })}`
  : '';
document.getElementById('version').textContent = `v${VERSION}${built}`;

window.addEventListener('resize', resize);
resize();
root.dataset.ready = 'true';
