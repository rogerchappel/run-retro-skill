#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { createRunRetro, formatRetroReport } from '../src/index.js';
const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== '--fixture' || !args[1]) {
  console.error('Usage: run-retro-skill --fixture <file>');
  process.exit(2);
}
try {
  const input = JSON.parse(readFileSync(args[1], 'utf8'));
  console.log(formatRetroReport(createRunRetro(input)));
} catch (error) {
  console.error(`Unable to create run retro: ${error.message}`);
  process.exitCode = 1;
}
