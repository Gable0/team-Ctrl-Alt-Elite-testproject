# _Project Name TBD_
## Ctrl+Alt+Elite

### Basic Galaga Skeleton (key files)
- `index.html` &rarr; bare-bones page with a canvas plus quick instructions.
- `styles.css` &rarr; minimal styling so the canvas is visible against a black background.
- `js/core/gameLoop.js` &rarr; orchestrates input, entities, systems, collisions, and rendering.
- `js/core/input.js` &rarr; shared key-tracking utility that every system can query.
- `js/entities/player.js` / `js/entities/enemyManager.js` &rarr; entity-specific creation, movement, and drawing logic.
- `js/systems/shootingSystem.js`, `js/systems/collision/*`, `js/systems/enemyAttack.js` &rarr; gameplay systems (projectiles, collisions, enemy attack AI).
- `js/state/gameState.js` & `js/ui/hud.js` &rarr; state helpers plus HUD/transition rendering.

Next steps: flesh out projectile firing, introduce actual enemy formations, and wire the collision stubs into score/health tracking.
