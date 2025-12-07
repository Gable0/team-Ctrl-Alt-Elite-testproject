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