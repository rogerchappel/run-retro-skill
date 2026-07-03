#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { createRunRetro, formatRetroReport } from '../src/index.js';
const idx = process.argv.indexOf('--fixture');
if (idx === -1 || !process.argv[idx + 1]) { console.error('Usage: run-retro-skill --fixture <file>'); process.exit(2); }
const input = JSON.parse(readFileSync(process.argv[idx + 1], 'utf8'));
console.log(formatRetroReport(createRunRetro(input)));
