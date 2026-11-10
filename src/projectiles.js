// What enemies throw: paperwork that flutters down slowly, test tubes that
// fly in an arc and shatter, shouted slogans that carry straight ahead,
// and the prosecutor's binders of charges, lobbed, and documents that
// skim along the floor; the synth's square waves step up and down; the
// raver's glow sticks land and lie glowing.
// Each hurts Blenke (but a glow stick) and is gone when it hits a wall or
// the ground or has flown its time. Pure: no DOM.
import { TILE } from './config.js';
import { isSolid, pixelHeight, pixelWidth, tileAt } from './level.js';

export const PROJECTILES = {
  paper: { width: 8, height: 6, gravity: 90, maxFall: 45, life: 4 },
  tube: { width: 4, height: 8, gravity: 700, maxFall: 430, life: 3 },
  shout: { width: 8, height: 9, gravity: 0, maxFall: 0, life: 1.3 },
  binder: { width: 12, height: 12, gravity: 600, maxFall: 430, life: 3 },
  brief: { width: 14, height: 6, gravity: 0, maxFall: 0, life: 3.5 },
  // The synth's square wave: straight ahead, jumping between two heights
  // every `square.every` seconds.
  wave: { width: 8, height: 6, gravity: 0, maxFall: 0, life: 2.5, square: { every: 0.12, height: 8 } },
  // The raver's glow stick: lobbed, it hurts nobody, lands and lies
  // glowing, and shows hidden items within `glow` of its middle.
  glowStick: { width: 8, height: 4, gravity: 600, maxFall: 430, life: 7, harmless: true, lands: true, glow: 56 },
};

// x, y is where its middle starts.
export function createProjectile(type, x, y, vx, vy) {
  const projectile = PROJECTILES[type];
  if (!projectile) throw new Error(`Unknown projectile type '${type}'`);
  const left = x - projectile.width / 2;
  const top = y - projectile.height / 2;
  return {
    type,
    x: left,
    y: top,
    px: left,
    py: top,
    w: projectile.width,
    h: projectile.height,
    vx,
    vy,
    age: 0,
    // Where a square wave's low steps are.
    baseY: top,
    // Whether it has landed (one that lands), and lies still.
    landed: false,
  };
}

// Moves it on by dt. Returns false once it has hit something or flown its
// time, and the world drops it; one that lands lies still where it came
// down on top of a tile until its time is up.
export function updateProjectile(projectile, level, dt) {
  const { gravity, maxFall, life, square, lands } = PROJECTILES[projectile.type];
  projectile.px = projectile.x;
  projectile.py = projectile.y;
  projectile.age += dt;
  if (projectile.landed) return projectile.age < life;
  if (gravity > 0) projectile.vy = Math.min(projectile.vy + gravity * dt, maxFall);
  projectile.x += projectile.vx * dt;
  projectile.y += projectile.vy * dt;
  if (square) projectile.y = projectile.baseY - (Math.floor(projectile.age / square.every) % 2) * square.height;
  const middleX = projectile.x + projectile.w / 2;
  const middleY = projectile.y + projectile.h / 2;
  if (projectile.age >= life) return false;
  if (middleX < 0 || middleX >= pixelWidth(level) || middleY >= pixelHeight(level)) return false;
  const row = Math.floor(middleY / TILE);
  if (!isSolid(tileAt(level, Math.floor(middleX / TILE), row))) return true;
  // Only coming down onto a tile's top does it land; a wall stops it.
  if (!lands || projectile.vy <= 0 || projectile.py + projectile.h / 2 > row * TILE) return false;
  projectile.y = row * TILE - projectile.h;
  projectile.vx = 0;
  projectile.vy = 0;
  projectile.landed = true;
  return true;
}

// Whether a projectile lies glowing within reach of a point.
export function glowsOn(projectile, x, y) {
  const { glow } = PROJECTILES[projectile.type];
  if (!glow || !projectile.landed) return false;
  return Math.hypot(projectile.x + projectile.w / 2 - x, projectile.y + projectile.h / 2 - y) <= glow;
}
