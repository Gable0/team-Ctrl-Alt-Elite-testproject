# ADR 0004 – Implement Comprehensive CI/CD Pipeline with GitHub Actions

## Status

Accepted — December 2025

## Context

Without automated checks, bad formatting, lint errors, or broken game loading could be merged accidentally.

## Decision

Create a two-stage GitHub Actions workflow:

1. `lint-format` — runs Prettier + ESLint
2. `e2e-load` — starts `http-server`, runs Playwright smoke + visual tests

Both must pass before merge.

## Notes

- Zero tolerance for style violations
- Automatic prevention of broken builds
- Full HTML report + screenshots on failure
- Fast feedback (under 2 minutes)

Author: Roy Haynes  
Repository: team-Ctrl-Alt-Elite-testproject
