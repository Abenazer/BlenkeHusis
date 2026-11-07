import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BUILD_TIME } from '../src/build.js';
import { VERSION } from '../src/version.js';

function readRepoFile(name) {
  return readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
}

test('the version is MAJOR.MINOR.PATCH', () => {
  assert.match(VERSION, /^\d+\.\d+\.\d+$/);
});

test('package.json has the same version', () => {
  assert.equal(JSON.parse(readRepoFile('package.json')).version, VERSION);
});

// The release workflow uses this section as the release notes, so a version
// bump without it would fail there; catching it here fails before the push.
// 0.0.0 is the unreleased scaffold and has no section.
test('the changelog has a section for the version', { skip: VERSION === '0.0.0' && 'nothing released yet' }, () => {
  assert.ok(
    readRepoFile('CHANGELOG.md').includes(`\n## [${VERSION}] - `),
    `CHANGELOG.md has no "## [${VERSION}] - <date>" section`,
  );
});

// The Dockerfile and release.yml write the real time into their own copy; a
// stamped file in the repo would show a stale time on every dev copy.
test('the repo carries no build time', () => {
  assert.equal(BUILD_TIME, null);
});
