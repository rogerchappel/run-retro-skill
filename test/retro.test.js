import test from 'node:test';
import assert from 'node:assert/strict';
import { createRunRetro, formatRetroReport, redact } from '../src/index.js';
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
test('rejects an events value that is not an array', () => {
  assert.throws(() => createRunRetro({ events: {} }), {
    name: 'TypeError',
    message: 'Run retro events must be an array.'
  });
});
test('rejects unknown event types', () => {
  assert.throws(() => createRunRetro({ events: [{ type: 'note', message: 'Remember this' }] }), {
    name: 'TypeError',
    message: 'Run retro event at index 0 has unsupported type "note".'
  });
});
test('requires non-empty messages for message events', () => {
  for (const type of ['decision', 'risk', 'next']) {
    assert.throws(() => createRunRetro({ events: [{ type, message: '  ' }] }), {
      name: 'TypeError',
      message: `Run retro ${type} event at index 0 requires a non-empty message.`
    });
  }
});
test('requires verification status and useful evidence text', () => {
  assert.throws(() => createRunRetro({ events: [{ type: 'verification', command: 'npm test' }] }), {
    name: 'TypeError',
    message: 'Run retro verification event at index 0 requires a non-empty status.'
  });
  assert.throws(() => createRunRetro({ events: [{ type: 'verification', status: 'passed' }] }), {
    name: 'TypeError',
    message: 'Run retro verification event at index 0 requires a non-empty command or message.'
  });
});
test('unknown verification evidence cannot produce a ready outcome', () => {
  const retro = createRunRetro({
    outcome: 'ready',
    events: [{ type: 'verification', command: 'npm test', status: 'unknown' }]
  });
  assert.equal(retro.outcome, 'needs-follow-up');
  assert.deepEqual(retro.risks, ['Verification status is unknown: npm test.']);
});
test('formatted reports never contain undefined values', () => {
  const report = formatRetroReport(createRunRetro({ events: [] }));
  assert.doesNotMatch(report, /undefined/);
});
