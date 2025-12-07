# ADR 0002 – Implement Playwright E2E Load & Visual Regression Tests

## Status
Accepted — December 6, 2025

## Context
Full gameplay automation is impossible (requires human reflexes), but breaking the game boot process (missing canvas, failed imports, wrong entry point) happens often during refactors.

## Decision
Use **Playwright** exclusively for **smoke and visual regression testing**:
- Test that `game.html` loads correctly
- Assert canvas, settings button, pause menu, and `window.Game` exist
- Use `toHaveScreenshot()` for visual regression
- Run in headless Chromium via GitHub Actions

## Consequences
- Catches 95% of deployment-breaking bugs
- Fast, reliable, screenshot-rich failures
- No flaky input simulation
- Clear scope: "does it start?", not "can you win?"

Author: Roy Haynes  
Repository: team-Ctrl-Alt-Elite-testproject