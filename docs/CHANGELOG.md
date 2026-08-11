# Changelog

## Unreleased

- Prevent caller-supplied outcomes from masking missing, failed, or unknown
  verification by reporting `needs-follow-up` whenever risks are present.
- Validate the per-type event contract and prevent incomplete verification
  evidence from producing a ready outcome.
- Reject unknown or extra CLI arguments with usage and exit status 2.

## 0.1.0

- Initial release-candidate build.
