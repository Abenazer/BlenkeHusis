// When this copy of the game was built, as an ISO time. Stays null in the repo:
// the Dockerfile and release.yml overwrite this file in what they build, so
// only a built copy shows a time.
export const BUILD_TIME = null;

// Whether this copy is a release. False in the repo and in the image built
// from main (:latest); release.yml writes true into what it releases (the
// zip and the versioned image), so a world still being built (`preview`
// in levels/index.js) is left out of it.
export const RELEASED = false;
