# run-retro-skill

Summarize agent run logs into decisions, evidence, risks, and next actions.

## Quickstart

```sh
npm test
npm run check
npm run smoke
```

## CLI

```sh
node bin/run-retro-skill.js --fixture fixtures/run-log.json
```

## Library

Import from `src/index.js` or package exports once installed. The API is local-first and deterministic for fixture-driven review.

## Limitations

This project is a release-candidate MVP. It expects JSON input and does not call external services.

## Safety Notes

The tool is read-only. Treat any external write, publish, approval, install, or connector execution as outside this package and subject to explicit user approval.

## Release Candidate

See `docs/RELEASE_CANDIDATE.md` and `docs/RELEASE_CHECKLIST.md` for the current readiness notes.

## Release Verification

Run the full release gate before opening a release-facing pull request:

```sh
npm run release:check
```

The gate runs static checks, the Node test suite, the fixture-backed CLI smoke,
and a structured package smoke that verifies the tarball includes the CLI,
library, fixture, example report, safety docs, and release checklist.
