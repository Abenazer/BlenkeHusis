// The line of text shown under the HUD: the level's name as it starts, then
// the satirical remarks pickups and promotions earn. One shows at a time;
// later ones wait their turn, and a waiting one cuts the current one short
// so the remarks keep up with the play. Pure: no DOM, and time is passed in.

export const MESSAGE_TIME = 2.5;
// A message shows at least this long, even with others waiting.
export const MIN_MESSAGE_TIME = 1;
// Beyond this many waiting, the oldest is dropped: by then it is stale.
export const MAX_WAITING = 2;

export function createMessages() {
  return { current: null, shown: 0, waiting: [] };
}

// colour is a palette name.
export function showMessage(messages, text, colour = 'urine_4', time = MESSAGE_TIME) {
  const message = { text, colour, time };
  if (!messages.current) {
    messages.current = message;
    messages.shown = 0;
    return;
  }
  messages.waiting.push(message);
  if (messages.waiting.length > MAX_WAITING) messages.waiting.shift();
}

export function updateMessages(messages, dt) {
  if (!messages.current) return;
  messages.shown += dt;
  const limit = messages.waiting.length > 0 ? Math.min(MIN_MESSAGE_TIME, messages.current.time) : messages.current.time;
  if (messages.shown < limit) return;
  messages.current = messages.waiting.shift() ?? null;
  messages.shown = 0;
}
