# ADR 0001 – Adopt Prettier and ESLint with Flat Config for Code Quality

## Status

Accepted — December 6, 2025

## Context

The codebase had inconsistent formatting and no linting, making collaboration and reviews difficult. The project uses `"type": "module"`, which broke legacy ESLint configs.

## Decision

Implement:

- Prettier for automatic formatting
- ESLint v9+ with **flat config** (`eslint.config.js`) using ESM imports
- Integration via `eslint-plugin-prettier` and `eslint-config-prettier`

## Notes

- Consistent, professional code style
- Zero configuration conflicts with ES modules
- Automatic fixing via `npm run lint:fix` and `npm run format:fix`
- CI fails fast on style violations

Author: Roy Haynes  
Repository: team-Ctrl-Alt-Elite-testproject
