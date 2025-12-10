# Changelog

## [0.5.0-pre] – 2025-12-06 — First Playable Release

This is the **first public pre-release** of RetroGa — a fully functional, polished Galaga-inspired arcade shooter built entirely with vanilla JavaScript, HTML5 Canvas, and CSS.

### Game Systems & Core Loop

- Complete game loop with delta-time handling and `requestAnimationFrame`
- Modular entity system (player, enemies, shots, power-ups)
- Player movement (Arrow Keys + WASD) with screen boundary clamping
- Player shooting with fire-rate cooldown
- Enemy wave spawning (4×10 grid) with staggered side-entry animations
- Enemy formation oscillation and dive-attack AI with pathing
- Enemy shooting with predictive aiming + variance
- Accurate AABB collision detection for player shots, enemy shots, and player-enemy contact
- Lives system with invincibility flash on hit
- Game over → redirect to high-score screen
- Level progression with “LEVEL X / GET READY!” transition overlay

### Visual & Audio Polish

- Neon glow effects on player, enemies, shots, and power-ups
- Background starfield with parallax scrolling
- Retro arcade color palette and particle-style explosions
- Full audio system (shoot, enemy death, power-up, game over, intro music)
- “Fun Mode” toggle with legendary shooting sound

### UI & Menus

- Stylized homepage with animated title and neon buttons
- Difficulty selection screen (Easy / Medium / Hard)
- In-game HUD showing Score, Level, Lives (color-coded by difficulty)
- Pause menu (ESC key) with Resume / Restart / Exit to Menu
- Settings modal (gear icon) with:
  - Audio & SFX volume sliders
  - Language selector
  - Fun Mode toggle
- Basic Shop and Skins library pages (layout only)

### Technical Foundation

- Mobile-responsive canvas
- Cross-browser tested (Chrome, Firefox, Safari, Edge)
- GitHub Actions CI pipeline
- Architecture Decision Records (ADR) process established

This release marks the point where RetroGa became a **functional, playable arcade experience** — everything needed for endless retro fun is now in place.

## [0.6.0-pre] - 2025-12-06

### Added

- Centralized `skinsManager.js` with full ownership/equip API
- Shop & Skins pages now use rem units and are fully responsive
- All UI text now consistently uses **Jersey 10** (including HUD, pause menu, settings)
- JSDoc documentation generation (`npm run docs`)
- ADR 0002 (skin manager) and ADR 0007 (JSDoc adoption)

### Fixed

- Unequip bug — skins now correctly revert to default
- Font flash/fallback issues resolved with proper preload and CSS enforcement

## [0.7.0] – 2025-12-10

### Added

- New HTML backgrounds for homepage and arcade mode, bringing a fresh retro vibe to the game's visual style
- ESLint and Prettier configured and functional for code quality, ensuring consistent formatting and early bug catching across the team
- High score board feature, allowing players to track and compete for top rankings with seamless integration into the game over screen
- Modified audio system for enhanced sound effects and music, improving immersion with better volume controls and dynamic audio cues
- Currency system for purchasing skin packs, enabling players to earn and spend in-game coins on new cosmetic options like the Prof Pack

### Improvements

- Refined skin equipping logic for smoother transitions and better compatibility with new packs
- Overall performance tweaks to support the new features without impacting gameplay smoothness
