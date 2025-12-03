# Plan: Auto-Generate ci.sh from ci.yml

## Goal

Implement automatic synchronization between `.github/workflows/ci.yml` and `scripts/ci.sh` by generating the shell script from the YAML workflow file, ensuring they never drift out of sync.

## Scope

**In Scope:**

- Add `generate:ci-sh` npm script to package.json
- Create validation script to verify ci.sh is up-to-date with ci.yml
- Add pre-commit hook to auto-generate ci.sh
- Add CI job to enforce sync validation
- Update documentation (CONTRIBUTING.md)
- Handle `continue-on-error` flag properly in generated script

**Out of Scope:**

- Modifying existing CI job logic or adding new checks
- Bi-directional sync (YAML → Shell only)
- Support for complex YAML features (matrix, conditions, etc.)
- Auto-generating ci.yml from other sources

## Status

✅ **COMPLETED** - All tasks implemented and tested successfully.

## Implementation Summary

All planned tasks completed:

- ✅ npm scripts added (generate:ci-sh, validate:ci-sync)
- ✅ Validation script created and tested
- ✅ Pre-commit hook configured
- ✅ CI validation job added
- ✅ Documentation updated

## References

- `scripts/generate-ci-sh.ts` - YAML parser and shell script generator
- `scripts/validate-ci-sync.ts` - Sync validation script
- `.github/workflows/ci.yml` - CI workflow (source of truth)
- `scripts/ci.sh` - Auto-generated local CI script
