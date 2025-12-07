# ADR 0004 – Add Dedicated FPS Performance Validation Script

## Status

Accepted — December 6, 2025

## Context

Canvas games must maintain 60 FPS. We needed a reliable way to detect performance regressions during development without relying on manual observation.

## Decision

Create `tests/fps/fps-check.js` — a standalone Playwright script that:

- Launches real Chromium
- Navigates to `http://localhost:3000/game.html`
- Measures actual rendered FPS over 5 seconds using `requestAnimationFrame`
- Fails with exit code 1 if FPS ever drops below 60

Run manually via `node tests/fps/fps-check.js`

## Notes

- Real, accurate FPS measurement (not simulated)
- Zero dependencies beyond Playwright
- Instant feedback when optimizing rendering
- Can be added to CI later if needed

Author: Roy Haynes  
Repository: team-Ctrl-Alt-Elite-testproject
