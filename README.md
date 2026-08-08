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

`createRunRetro(input)` requires a non-array object. `events` is optional, but
when present it must be an array of objects with one of these shapes:

- `{ "type": "decision", "message": "..." }`
- `{ "type": "risk", "message": "..." }`
- `{ "type": "next", "message": "..." }`
- `{ "type": "verification", "status": "passed", "command": "..." }`

Decision, risk, and next-action messages must contain non-whitespace text. A
verification requires a non-empty `status` plus at least one non-empty
`command` or `message`. Only the exact status `passed` is successful; any other
status records a risk, so missing, incomplete, or unknown evidence cannot
produce a `ready` outcome. Unknown event types and malformed fields produce a
`TypeError` that identifies the entry index. Optional `objective` and `outcome`
fields must be strings when provided. An event's optional `time` field must
also be a string; malformed event times produce a `TypeError` identifying the
entry index. User-controlled strings are redacted before the report is
returned.

The CLI accepts exactly `--fixture <file>`. It exits with status 2 and prints
usage for missing, unknown, or extra arguments. It exits with status 1 and a
concise `Unable to create run retro: ...` message when a fixture cannot be
read, parsed, or validated.

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
and a structured package smoke. CI starts with `npm ci` for clean, reproducible
install coverage; the package smoke verifies the tarball contents, installs it
in an isolated temporary project, and executes the packed CLI against a fixture.
