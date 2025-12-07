# ADR 0005 – Use Vitest for Unit and Integration Testing of Game Systems

## Status
Accepted — December 6, 2025

## Context
Core game logic (collision detection, power-ups, scoring, enemy attack timing) must be testable without a browser.

## Decision
Adopt **Vitest** for:
- Unit tests of pure functions (`hitboxes.js`, `detection.js`)
- Integration tests of systems (`shootingSystem.js`, `powerUps.js`)
- Fast, watch-mode development

Playwright remains only for browser-level checks.

## Consequences
- 100% test coverage of game logic
- Sub-100ms test runtime
- Clear separation: Vitest = logic, Playwright = browser
- Confidence to refactor without breaking behavior

Author: Roy Haynes  
Repository: team-Ctrl-Alt-Elite-testproject