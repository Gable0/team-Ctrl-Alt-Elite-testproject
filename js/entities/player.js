// js/entities/player.js

import { isKeyPressed } from '../core/input.js';
import { audioManager } from '../systems/audioManager.js';

/**
 * Creates the player ship object with default position and properties.
 *
 * @param {HTMLCanvasElement} canvas - The game canvas (used to calculate initial position).
 * @returns {Object} Player object containing x, y, size and speed.
 */
export function createPlayer(canvas) {
  return {
    x: canvas.width / 2,
    y: canvas.height * 0.75,
    size: 20,
    speed: 220,
  };
}

/**
 * Updates player position based on keyboard input and handles shooting logic.
 *
 * @param {Object} game - Global game state object.
 * @param {number} delta - Time elapsed since last frame (in seconds).
 * @param {HTMLCanvasElement} canvas - Game canvas (for boundary clamping).
 * @param {number} barrierY - Upper Y boundary the player cannot cross.
 * @param {Function} createPlayerShot - Factory function that creates a player shot.
 */
export function updatePlayer(game, delta, canvas, barrierY, createPlayerShot) {
  const player = game.player;
  if (!player) return;

  // Horizontal movement
  if (isKeyPressed('ArrowLeft') || isKeyPressed('KeyA'))
    player.x -= player.speed * delta;
  if (isKeyPressed('ArrowRight') || isKeyPressed('KeyD'))
    player.x += player.speed * delta;

  // Vertical movement
  if (isKeyPressed('ArrowUp') || isKeyPressed('KeyW'))
    player.y -= player.speed * delta;
  if (isKeyPressed('ArrowDown') || isKeyPressed('KeyS'))
    player.y += player.speed * delta;

  // Keep player inside canvas bounds
  player.x = Math.max(
    player.size,
    Math.min(canvas.width - player.size, player.x)
  );
  player.y = Math.max(
    barrierY + player.size,
    Math.min(canvas.height - player.size, player.y)
  );

  // Shooting (only when shooting is unlocked and cooldown elapsed)
  if (game.playerShootingUnlocked && isKeyPressed('Space') && game.canShoot) {
    if (game.tripleShotTimer > 0) {
      // Triple-shot power-up active
      const angleOffset = Math.PI / 10; // ~18 degrees
      game.playerShots.push(
        createPlayerShot(player.x, player.y - player.size, -angleOffset)
      );
      game.playerShots.push(
        createPlayerShot(player.x, player.y - player.size, 0)
      );
      game.playerShots.push(
        createPlayerShot(player.x, player.y - player.size, angleOffset)
      );
      game.shotsFired += 3;
    } else {
      // Normal single shot
      game.playerShots.push(
        createPlayerShot(player.x, player.y - player.size, 0)
      );
      game.shotsFired++;
    }

    // Play shoot sound
    audioManager.playShootSound();

    // Simple cooldown
    game.canShoot = false;
    setTimeout(() => {
      game.canShoot = true;
    }, 170);
  }
}

/**
 * Renders the player ship to the canvas, applying the currently active skin
 * and invincibility flash effect.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context.
 * @param {Object} player - Player object with position and size.
 * @param {number} invincibilityTimer - Remaining invincibility time (seconds).
 * @param {Object} game - Global game state (provides activeSkin).
 */
export function drawPlayer(ctx, player, invincibilityTimer, game) {
  if (!player) return;

  ctx.save();
  ctx.translate(player.x, player.y);

  // Flash effect while invincible
  if (invincibilityTimer > 0) {
    const flash = Math.floor(invincibilityTimer * 10) % 2;
    if (flash === 0) {
      ctx.globalAlpha = 0.3;
    }
  }

  ctx.fillStyle = '#888888';
  ctx.shadowBlur = 8;
  ctx.shadowColor = 'rgba(136, 136, 136, 0.3)';

  if (game.activeSkin === 'squarePack') {
    // Square skin
    ctx.fillRect(-player.size / 2, -player.size / 2, player.size, player.size);
  } else if (game.activeSkin === 'starPack') {
    // Star skin (simple 5-point star)
    const r1 = player.size;
    const r2 = player.size * 0.4;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI / 2.5) * i * 2;
      ctx.lineTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
      ctx.lineTo(
        Math.cos(angle + Math.PI / 5) * r2,
        Math.sin(angle + Math.PI / 5) * r2
      );
    }
    ctx.closePath();
    ctx.fill();
  } else {
    // Default pixelated grey space battleship
    const pixelSize = player.size * 0.1; // Each "pixel" is 10% of ship size

    // Disable anti-aliasing for crisp pixel edges
    ctx.imageSmoothingEnabled = false;

    // Main hull (central body) - medium grey
    ctx.fillStyle = '#888888';
    ctx.fillRect(
      -player.size * 0.3,
      -player.size * 0.6,
      player.size * 0.6,
      player.size * 1.2
    );

    // Cockpit/nose (front section) - light grey
    ctx.fillStyle = '#aaaaaa';
    ctx.fillRect(-pixelSize * 2, -player.size, pixelSize * 4, pixelSize * 4);
    ctx.fillRect(
      -pixelSize,
      -player.size - pixelSize,
      pixelSize * 2,
      pixelSize
    );

    // Left wing - medium grey
    ctx.fillStyle = '#888888';
    ctx.fillRect(-player.size, -pixelSize * 2, pixelSize * 7, pixelSize * 6);

    // Right wing - medium grey
    ctx.fillRect(
      player.size * 0.3,
      -pixelSize * 2,
      pixelSize * 7,
      pixelSize * 6
    );

    // Dark hull details (shadows/panels)
    ctx.fillStyle = '#555555';
    // Left wing panel
    ctx.fillRect(-player.size * 0.9, -pixelSize, pixelSize * 3, pixelSize * 2);
    // Right wing panel
    ctx.fillRect(player.size * 0.4, -pixelSize, pixelSize * 3, pixelSize * 2);
    // Center hull panels
    ctx.fillRect(-pixelSize * 2, -pixelSize * 4, pixelSize * 4, pixelSize * 3);
    ctx.fillRect(-pixelSize * 2, pixelSize, pixelSize * 4, pixelSize * 3);

    // Bridge window - bright cyan
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(-pixelSize, -pixelSize * 7, pixelSize * 2, pixelSize);

    // Engine housings - dark grey
    ctx.fillStyle = '#444444';
    ctx.fillRect(
      -pixelSize * 2,
      player.size * 0.6,
      pixelSize * 1.5,
      pixelSize * 3
    );
    ctx.fillRect(
      pixelSize * 0.5,
      player.size * 0.6,
      pixelSize * 1.5,
      pixelSize * 3
    );

    // Engine cores - bright orange/yellow (active thrust)
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(
      -pixelSize * 1.75,
      player.size * 0.7,
      pixelSize,
      pixelSize * 1.5
    );
    ctx.fillRect(
      pixelSize * 0.75,
      player.size * 0.7,
      pixelSize,
      pixelSize * 1.5
    );

    // Wing tip lights - red
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-player.size * 0.95, -pixelSize * 1.5, pixelSize, pixelSize);
    ctx.fillRect(player.size * 0.95, -pixelSize * 1.5, pixelSize, pixelSize);

    // Additional hull highlights - light grey accents
    ctx.fillStyle = '#bbbbbb';
    ctx.fillRect(-pixelSize * 0.5, -pixelSize * 2, pixelSize, pixelSize);
    ctx.fillRect(-pixelSize * 0.5, pixelSize * 2, pixelSize, pixelSize);

    // Re-enable smoothing for other elements
    ctx.imageSmoothingEnabled = true;
  }

  ctx.shadowBlur = 0;
  ctx.restore();
}
