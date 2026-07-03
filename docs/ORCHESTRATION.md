# Orchestration

Run at the end of an agent session or before a handoff. Review redactions, attach the report to PR notes, and keep raw logs local.

## Suggested Flow

1. Collect local input fixtures.
2. Run `npm run smoke`.
3. Review the report before any separate side-effecting tool runs.
4. Record verification output in the release-candidate PR.
