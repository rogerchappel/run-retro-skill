# run-retro-skill

Use this skill when an agent run needs a concise retrospective for handoff, release readiness, or audit review. It accepts local structured logs and emits a redacted markdown-style report. It must not upload logs, send messages, or modify external systems. Validate with npm test, npm run check, and npm run smoke.

## Examples

```sh
npm run smoke
```

## Verification

Run `npm test`, `npm run check`, `npm run build`, and `npm run smoke` before trusting the package in another workflow.
