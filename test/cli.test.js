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

test('CLI reports malformed optional string fields', () => {
  const cases = [
    [{ objective: { name: 'build' } }, 'Run retro objective must be a string.'],
    [{ outcome: ['ready'] }, 'Run retro outcome must be a string.'],
    [{ events: [{ type: 'decision', message: 'Ship it', time: { day: 1 } }] }, 'Run retro event at index 0 time must be a string.']
  ];

  for (const [input, message] of cases) {
    const fixtureDir = mkdtempSync(join(tmpdir(), 'run-retro-skill-'));
    const fixture = join(fixtureDir, 'invalid-optional-field.json');
    writeFileSync(fixture, JSON.stringify(input));
    const result = spawnSync(process.execPath, ['bin/run-retro-skill.js', '--fixture', fixture], {
      cwd: process.cwd(),
      encoding: 'utf8'
    });

    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, `Unable to create run retro: ${message}\n`);
  }
});

test('CLI accepts valid optional strings and keeps report output deterministic', () => {
  const fixtureDir = mkdtempSync(join(tmpdir(), 'run-retro-skill-'));
  const fixture = join(fixtureDir, 'valid-optional-fields.json');
  writeFileSync(fixture, JSON.stringify({
    objective: 'Ship token=objective-secret',
    outcome: 'token=outcome-secret',
    events: [
      { type: 'decision', message: 'Proceed', time: '2026-08-08T14:00:00Z' },
      { type: 'verification', command: 'npm test', status: 'passed' }
    ]
  }));

  const result = spawnSync(process.execPath, ['bin/run-retro-skill.js', '--fixture', fixture], {
    cwd: process.cwd(),
    encoding: 'utf8'
  });

  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');
  assert.equal(result.stdout, [
    '# Run Retro',
    'Objective: Ship [REDACTED]',
    'Outcome: [REDACTED]',
    'Decisions:',
    '- Proceed',
    'Evidence:',
    '- npm test: passed',
    'Risks:',
    '- none',
    'Next actions:',
    '- none',
    ''
  ].join('\n'));
});

test('CLI rejects unknown and extra arguments with usage', () => {
  for (const args of [
    ['--unknown', 'value', '--fixture', 'fixtures/run-log.json'],
    ['--fixture', 'fixtures/run-log.json', 'extra']
  ]) {
    const result = spawnSync(process.execPath, ['bin/run-retro-skill.js', ...args], {
      cwd: process.cwd(),
      encoding: 'utf8'
    });

    assert.equal(result.status, 2);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, 'Usage: run-retro-skill --fixture <file>\n');
  }
});
