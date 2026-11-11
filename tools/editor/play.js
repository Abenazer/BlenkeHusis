// The editor's draft as a level the game can play, for play-testing it:
// the game imports this on ?bana=editor, from a local server only (tools/
// is not part of the game and isn't shipped), and reads the draft the
// editor keeps in the browser's storage.
import { SONGS } from '../../src/music/index.js';
import { checkDraft, DRAFT_KEY, draftFromStored, toDefinition } from './model.js';

// The draft in storage as a level definition with its cast. Fails, saying
// why, when there is no draft or the game couldn't play it.
export function editorLevel(storage) {
  const kept = draftFromStored(storage.getItem(DRAFT_KEY));
  if (!kept) throw new Error('The editor has no draft in this browser; open the level editor and draw one');
  const { errors } = checkDraft(kept.draft, SONGS);
  if (errors.length) throw new Error(`The editor's draft has errors: ${errors.map((error) => error.text).join(' ')}`);
  return { ...toDefinition(kept.draft), cast: kept.draft.cast };
}
