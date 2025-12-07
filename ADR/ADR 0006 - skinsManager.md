# ADR 0006 – Centralize Skin Management with `skinsManager.js`

## Status
Accepted — December 06, 2025

## Context
The project initially handled skin ownership and the currently-equipped skin in a fragmented way:

- `shop.html` and `skins.html` duplicated `localStorage` logic
- `gameState.js` read ownership flags directly
- `player.js` and `enemyManager.js` each contained identical conditional rendering code
- Adding a new skin required editing 4–5 files (HTML, `gameState.js`, `player.js`, `enemyManager.js`, and sometimes `gameLoop.js`)
- Equipping/unequipping skins was unreliable because ownership and active state were conflated, leading to the “stuck squares” bug

This made the codebase fragile and future skin packs extremely painful to implement.

## Decision
Introduce a **single source of truth**: `js/skins/skinsManager.js`

**Responsibilities now centralized:**
- Ownership tracking (`squarePackOwned`, future packs, etc.)
- Active skin state (`activeSkin`, defaults to `'default'`)
- Public API:
    - `getActiveSkin()` → returns current skin name
    - `isSkinOwned(skinName)` → boolean
    - `equipSkin(skinName)` → sets active skin or reverts to `'default'`

All other modules now:
- Import only from `skinsManager.js`
- Use `game.activeSkin` (set once in `gameState.js`)
- Render based on `game.activeSkin === 'squarePack'` (or future packs)

Result: adding a new skin now requires changes in only **three places**:
1. `skinsManager.js` (add ownership check)
2. Shop / Skins HTML (buy & equip UI)
3. Rendering files (one new `else if` block)

## Consequences

### Positive
- Unequip bug permanently fixed
- New skins can be added in minutes instead of hours
- Clear single-responsibility location for all skin logic
- Easier testing, debugging, and future features (previews, animations, rarity, etc.)

### Neutral / Negligible
- One extra import in a handful of files
- ~300 bytes added to the bundle

### Risks Mitigated
- No more duplicated `localStorage` reads/writes
- Ownership and active state can never get out of sync
- No more forgotten parameter passing in `gameLoop.js`
