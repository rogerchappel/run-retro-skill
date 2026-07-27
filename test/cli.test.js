import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

test('CLI reports invalid input without an incidental stack trace', () => {
  const fixtureDir = mkdtempSync(join(tmpdir(), 'run-retro-skill-'));
  const fixture = join(fixtureDir, 'invalid.json');
  writeFileSync(fixture, JSON.stringify({ events: [null] }));

  const result = spawnSync(process.execPath, ['bin/run-retro-skill.js', '--fixture', fixture], {
    cwd: process.cwd(),
    encoding: 'utf8'
  });

  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, 'Unable to create run retro: Run retro event at index 0 must be an object.\n');
});
