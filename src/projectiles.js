// What enemies throw: paperwork that flutters down slowly, test tubes that
// fly in an arc and shatter, shouted slogans that carry straight ahead,
// and the prosecutor's binders of charges, lobbed, and documents that
// skim along the floor; the synth's square waves step up and down.
// Each hurts Blenke and is gone when it hits a wall or the ground or has
// flown its time. Pure: no DOM.
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
  };
}

// Moves it on by dt. Returns false once it has hit something or flown its
// time, and the world drops it.
export function updateProjectile(projectile, level, dt) {
  const { gravity, maxFall, life, square } = PROJECTILES[projectile.type];
  projectile.px = projectile.x;
  projectile.py = projectile.y;
  projectile.age += dt;
  if (gravity > 0) projectile.vy = Math.min(projectile.vy + gravity * dt, maxFall);
  projectile.x += projectile.vx * dt;
  projectile.y += projectile.vy * dt;
  if (square) projectile.y = projectile.baseY - (Math.floor(projectile.age / square.every) % 2) * square.height;
  const middleX = projectile.x + projectile.w / 2;
  const middleY = projectile.y + projectile.h / 2;
  if (projectile.age >= life) return false;
  if (middleX < 0 || middleX >= pixelWidth(level) || middleY >= pixelHeight(level)) return false;
  return !isSolid(tileAt(level, Math.floor(middleX / TILE), Math.floor(middleY / TILE)));
}
