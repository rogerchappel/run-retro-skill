# run-retro-skill

Use this skill when an agent run needs a concise retrospective for handoff, release readiness, or audit review. It accepts local structured logs and emits a redacted markdown-style report. It must not upload logs, send messages, or modify external systems. Validate with npm test, npm run check, and npm run smoke.

Input must be a JSON object. If `events` is an array, each entry must be an
object. Invalid input is rejected with a concise error, and user-controlled
string fields are redacted before output.

## Examples

```sh
npm run smoke
```

## Verification

Run `npm test`, `npm run check`, `npm run build`, and `npm run smoke` before trusting the package in another workflow.
