# run-retro-skill

Use this skill when an agent run needs a concise retrospective for handoff, release readiness, or audit review. It accepts local structured logs and emits a redacted markdown-style report. It must not upload logs, send messages, or modify external systems. Validate with npm test, npm run check, and npm run smoke.

Input must be a JSON object. Its optional `events` field must be an array. Each
event is one of `decision`, `risk`, `next`, or `verification`. Decision, risk,
and next events require a non-empty `message`. Verification events require a
non-empty `status` and at least one non-empty `command` or `message`; only the
exact status `passed` counts as successful verification. Unknown statuses add
a risk and cannot produce a `ready` outcome. Unknown types and malformed input
are rejected with a concise indexed error, and user-controlled string fields
are redacted before output.

Invoke the CLI with exactly `--fixture <file>`. Unknown, missing, or extra
arguments print usage and exit with status 2.

## Examples

```sh
npm run smoke
```

## Verification

Run `npm test`, `npm run check`, `npm run build`, and `npm run smoke` before trusting the package in another workflow.
