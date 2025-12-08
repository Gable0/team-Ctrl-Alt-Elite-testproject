# ADR 0009 – Implement Canvas-Based Game Over Screen

## Status

Accepted — December 7, 2025

## Context

When the player loses all lives, the game needs to transition to a Game Over state that:

- Displays final score and wave reached
- Provides clear restart/exit options
- Maintains the retro arcade aesthetic
- Feels like a natural part of the game flow (not a jarring popup)
- Stops gameplay updates but keeps rendering the final game state

We needed to decide between:
1. **DOM overlay** (HTML elements positioned over canvas)
2. **Canvas rendering** (draw directly on game canvas)
3. **Separate HTML page** (redirect to `gameover.html`)
4. **Modal dialog** (browser `alert()` or custom modal)

## Decision

Implement the Game Over screen as **canvas-rendered UI** drawn directly on the game canvas.

### Key Implementation Details:

```javascript
// In drawHUD() within hud.js
if (Game.gameOver) {
  // Semi-transparent black overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Game Over text
  ctx.font = '72px "Jersey 10"';
  ctx.fillStyle = '#ff0844';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 3);
  
  // Score display + restart instructions
  // ...rendered as canvas text
}
```

## Rationale

### 1. **Consistent Visual Experience**
   - Game Over UI uses same rendering pipeline as gameplay
   - Fonts, colors, and styling automatically match HUD
   - No CSS/HTML maintenance separate from game code

### 2. **Preserved Game State Visibility**
   - Player can still see their final position, remaining enemies, score
   - Adds emotional weight to defeat (seeing the moment they died)
   - Better than covering everything with opaque HTML overlay

### 3. **No Layout Shift or Flicker**
   - Canvas rendering is synchronous with game loop
   - No DOM reflow or repaint costs
   - Smooth fade-in effect via `rgba()` alpha channel

### 4. **Simpler State Management**
   - Single `Game.gameOver` boolean controls everything
   - Update loop: `if (Game.gameOver) return;` stops gameplay
   - Draw loop: `if (Game.gameOver) drawGameOverScreen();` overlays UI
   - No need to manage separate HTML template lifecycle

### 5. **Mobile/Touch Friendly**
   - Canvas-rendered buttons can have larger touch targets
   - Single coordinate system for all input handling
   - No viewport/scaling issues with mixed DOM/canvas

### 6. **Screenshot-able**
   - Players can capture their final moment with `canvas.toDataURL()`
   - Future feature: "Share Your Score" button generates image
   - Everything rendered in single canvas element

## Trade-offs Accepted

- **Accessibility**: Canvas text isn't screen-reader friendly
  - Mitigation: Add `aria-live` announcement in DOM when `gameOver` triggers
  
- **No HTML rich text**: Can't use hyperlinks or styled buttons
  - Mitigation: Keyboard controls (`Enter` to restart, `Esc` to exit) supplement visual UI
  
- **Manual text layout**: Need to calculate pixel positions
  - Mitigation: Centralized in `hud.js`, only ~50 lines of code

## Implementation Notes

- Overlay draws **after** all game entities (player, enemies, shots)
- Text uses `Jersey 10` font for consistency with HUD
- Color palette matches existing game theme:
  - Red (`#ff0844`) for "GAME OVER"
  - Cyan (`#00d9ff`) for score/stats
  - Green (`#00ff41`) for action prompts
- Restart button click detection uses canvas coordinate mapping

## Alternatives Considered

### DOM Overlay (Rejected)
```html
<div id="game-over-modal">
  <h1>GAME OVER</h1>
  <p>Score: 12,500</p>
  <button>Restart</button>
</div>
```
**Pros**: Easier styling with CSS, better accessibility  
**Cons**: Visual disconnect from game, requires CSS positioning, potential z-index battles

### Separate Page (Rejected)
```javascript
if (lives <= 0) {
  window.location.href = 'gameover.html?score=' + score;
}
```
**Pros**: Full HTML/CSS flexibility  
**Cons**: Page reload destroys game state, loses "in-game" feel, slower transition

### Browser Alert (Rejected)
```javascript
alert('Game Over! Score: ' + score);
window.location.href = 'homepage.html';
```
**Pros**: Zero code  
**Cons**: Extremely jarring, breaks immersion, no visual polish

## Future Enhancements

- Add particle effects (explosions fading in background)
- High score comparison: "New Record!" vs "12,500 from best"
- Animated stat reveal (score counts up, wave # slides in)
- Canvas-drawn restart button with hover effect

---

Author: Chloe Ogamba 
Repository: team-Ctrl-Alt-Elite-testproject