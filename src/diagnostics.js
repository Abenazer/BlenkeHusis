// A measuring panel, shown and hidden with F2: the frame times the browser
// reports, the display rate the clock settled on, steps per frame and the
// canvas size. For finding out why motion judders on a particular machine;
// it changes nothing in the game. Page layer: draws on the screen canvas.

const FRAMES_KEPT = 120;
const STEPS_SHOWN = 40;

export function createDiagnostics() {
  return { visible: false, frames: [] };
}

export function recordFrame(diagnostics, frameTime, steps) {
  diagnostics.frames.push({ frameTime, steps });
  if (diagnostics.frames.length > FRAMES_KEPT) diagnostics.frames.shift();
}

function milliseconds(seconds) {
  return (seconds * 1000).toFixed(1);
}

export function drawDiagnostics(ctx, diagnostics, clock, view, canvas) {
  if (!diagnostics.visible || diagnostics.frames.length === 0) return;
  const times = diagnostics.frames.map((frame) => frame.frameTime).filter((time) => time > 0);
  const sorted = [...times].sort((a, b) => a - b);
  const mean = times.reduce((sum, time) => sum + time, 0) / Math.max(1, times.length);
  const steps = diagnostics.frames.slice(-STEPS_SHOWN).map((frame) => frame.steps).join('');
  const lines = [
    `F2  bildrutor ${(1 / mean).toFixed(1)}/s   rapporterad tid min ${milliseconds(sorted[0] ?? 0)}`
      + `  median ${milliseconds(sorted[Math.floor(sorted.length / 2)] ?? 0)}`
      + `  max ${milliseconds(sorted[sorted.length - 1] ?? 0)} ms`,
    `skärm ${clock.interval > 0 ? (1 / clock.interval).toFixed(2) : '?'} Hz enligt klockan`
      + `   steg per bildruta ${steps}`,
    `canvas ${canvas.width}×${canvas.height}   skala ${view.scale.toFixed(3)}`
      + `   devicePixelRatio ${window.devicePixelRatio}`,
    navigator.userAgent,
  ];

  const fontSize = Math.max(12, Math.round(view.scale * 3.5));
  const lineHeight = Math.round(fontSize * 1.3);
  const graphHeight = fontSize * 4;
  const x = view.x + fontSize;
  const y = view.y + fontSize;
  ctx.save();
  ctx.font = `${fontSize}px monospace`;
  const width = Math.min(view.width - 2 * fontSize, Math.max(...lines.map((line) => ctx.measureText(line).width)) + fontSize);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(x, y, width, lines.length * lineHeight + graphHeight + fontSize);
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'top';
  lines.forEach((line, index) => ctx.fillText(line, x + fontSize / 2, y + fontSize / 2 + index * lineHeight, width - fontSize));

  // One bar per frame, 0–40 ms high; the line is the display interval. Even
  // bars mean even frames; spikes are frames the browser reported late.
  const graphTop = y + fontSize / 2 + lines.length * lineHeight;
  const barWidth = Math.max(1, Math.floor((width - fontSize) / FRAMES_KEPT));
  const perMs = graphHeight / 40;
  diagnostics.frames.forEach((frame, index) => {
    const barHeight = Math.min(graphHeight, frame.frameTime * 1000 * perMs);
    ctx.fillStyle = frame.steps === 1 ? '#7fd17f' : '#f0c040';
    ctx.fillRect(x + fontSize / 2 + index * barWidth, graphTop + graphHeight - barHeight, Math.max(1, barWidth - 1), barHeight);
  });
  if (clock.interval > 0) {
    ctx.fillStyle = '#ff6060';
    ctx.fillRect(x + fontSize / 2, graphTop + graphHeight - clock.interval * 1000 * perMs, FRAMES_KEPT * barWidth, 1);
  }
  ctx.restore();
}
