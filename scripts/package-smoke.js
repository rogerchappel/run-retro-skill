import { execFileSync } from 'node:child_process';

const output = execFileSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8' });
const [pack] = JSON.parse(output);
const files = new Set(pack.files.map((file) => file.path));
const required = [
  'bin/run-retro-skill.js',
  'src/index.js',
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
  console.error('Package smoke missing files: ' + missing.join(', '));
  process.exit(1);
}

console.log(`package smoke ok: ${pack.files.length} files`);
