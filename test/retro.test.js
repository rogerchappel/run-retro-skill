import test from 'node:test';
import assert from 'node:assert/strict';
import { createRunRetro, redact } from '../src/index.js';
test('groups decisions evidence risks and next actions', () => {
  const retro = createRunRetro({ events: [{ type: 'decision', message: 'Use CLI' }, { type: 'verification', command: 'npm test', status: 'passed' }, { type: 'next', message: 'Open PR' }] });
  assert.equal(retro.decisions[0], 'Use CLI');
  assert.equal(retro.evidence[0], 'npm test: passed');
  assert.equal(retro.nextActions[0], 'Open PR');
});
test('adds a risk when verification is missing', () => {
  const retro = createRunRetro({ events: [{ type: 'decision', message: 'Ship docs' }] });
  assert.match(retro.risks[0], /No verification/);
});
test('keeps blocked failures as risks', () => {
  const retro = createRunRetro({ events: [{ type: 'verification', status: 'failed', message: 'npm test failed' }] });
  assert.equal(retro.risks[0], 'npm test failed');
});
test('redacts obvious tokens', () => {
  assert.equal(redact('token=abc123'), '[REDACTED]');
});
test('redacts modern GitHub and npm tokens', () => {
  const githubToken = 'github_pat_' + 'A'.repeat(82);
  const npmToken = 'npm_' + 'B'.repeat(36);
  assert.equal(redact(`github: ${githubToken}, npm: ${npmToken}`), 'github: [REDACTED], npm: [REDACTED]');
});
test('redacts the supplied outcome', () => {
  const retro = createRunRetro({ outcome: 'token=abc123', events: [] });
  assert.equal(retro.outcome, '[REDACTED]');
});
test('rejects a non-object input with a deterministic error', () => {
  assert.throws(() => createRunRetro(null), {
    name: 'TypeError',
    message: 'Run retro input must be an object.'
  });
});
test('rejects invalid event entries with their index', () => {
  assert.throws(() => createRunRetro({ events: [null] }), {
    name: 'TypeError',
    message: 'Run retro event at index 0 must be an object.'
  });
});
