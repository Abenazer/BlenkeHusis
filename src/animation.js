// Which of Blenke's animations plays and how far into it he is. The
// animations themselves (frame names, frame rates) are data, from his
// sprite sheet's description. Pure: no DOM.
import { PLAYER } from './config.js';

// Slower than this on the ground and he stands still.
const STANDING_SPEED = 5;

export function createAnimation() {
  return { name: 'idle', time: 0 };
}

export function chooseAnimation(player) {
  if (player.hurt > 0) return 'hurt';
  if (player.crouching) return 'crouch';
  if (!player.onGround) return player.vy < 0 ? 'jump' : 'fall';
  const speed = Math.abs(player.vx);
  if (speed < STANDING_SPEED) return 'idle';
  return speed > PLAYER.walkSpeed ? 'run' : 'walk';
}

// A new animation starts from its first frame. Crouching only plays on
// while he crawls, so he keeps still when he just ducks.
export function updateAnimation(animation, player, dt) {
  const name = chooseAnimation(player);
  if (name !== animation.name) {
    animation.name = name;
    animation.time = 0;
    return;
  }
  if (name === 'crouch' && Math.abs(player.vx) < STANDING_SPEED) return;
  animation.time += dt;
}

// The frame to draw: animations maps a name to its frames in order,
// playback a name to { fps, loop }.
export function frameName(animation, animations, playback) {
  const frames = animations[animation.name];
  if (!frames || frames.length === 0) throw new Error(`No frames for the animation '${animation.name}'`);
  const { fps, loop = true } = playback[animation.name];
  const index = Math.floor(animation.time * fps + 1e-9);
  return frames[loop ? index % frames.length : Math.min(index, frames.length - 1)];
}
