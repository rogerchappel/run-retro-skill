import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const temporaryProject = mkdtempSync(join(tmpdir(), 'run-retro-skill-package-'));
const packageRoot = fileURLToPath(new URL('..', import.meta.url));

try {
  const output = execFileSync('npm', ['pack', '--json', '--pack-destination', temporaryProject], {
    cwd: packageRoot,
    encoding: 'utf8'
  });
  const [pack] = JSON.parse(output);
  const files = new Set(pack.files.map((file) => file.path));
  const required = [
    'bin/run-retro-skill.js',
    'src/index.js',
    'scripts/check.js',
    'scripts/package-smoke.js',
    'test/retro.test.js',
    'test/cli.test.js',
    'fixtures/run-log.json',
    'examples/report.md',
    'docs/RELEASE_CANDIDATE.md',
    'docs/RELEASE_CHECKLIST.md',
    'docs/SAFETY.md',
    'SKILL.md',
    'README.md',
    'LICENSE'
  ];

  const missing = required.filter((file) => !files.has(file));
  if (missing.length > 0) {
    throw new Error('Package smoke missing files: ' + missing.join(', '));
  }

  writeFileSync(join(temporaryProject, 'package.json'), JSON.stringify({ private: true }));
  execFileSync('npm', [
    'install',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    join(temporaryProject, pack.filename)
  ], { cwd: temporaryProject, stdio: 'pipe' });

  const report = execFileSync(
    join(temporaryProject, 'node_modules', '.bin', 'run-retro-skill'),
    ['--fixture', join(temporaryProject, 'node_modules', 'run-retro-skill', 'fixtures', 'run-log.json')],
    { cwd: temporaryProject, encoding: 'utf8' }
  );

  for (const expected of ['# Run Retro', 'Decisions:', 'Evidence:', 'Next actions:']) {
    if (!report.includes(expected)) {
      throw new Error(`Installed CLI report missing expected section: ${expected}`);
    }
  }

  for (const script of ['test', 'check', 'smoke']) {
    execFileSync('npm', ['run', script], {
      cwd: join(temporaryProject, 'node_modules', 'run-retro-skill'),
      stdio: 'pipe'
    });
  }

  console.log(`package smoke ok: ${pack.files.length} files; packed CLI and shipped scripts executed successfully`);
} finally {
  rmSync(temporaryProject, { recursive: true, force: true });
}
