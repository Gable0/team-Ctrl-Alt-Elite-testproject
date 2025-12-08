// js/systems/powerUps.js
// Handles power-up spawning, collection, triple-shot timer and visual rendering.

import { audioManager } from './audioManager.js';

export function spawnPowerUp(game, enemy) {
  // 10% chance to drop a power-up
  let dropChance = 0.1; // default (medium)

  /*if (game.difficulty === 'easy') {
        dropChance = 0.15; // 15% chance on easy
    } else if (game.difficulty === 'hard') {
        dropChance = 0.01; // 1% chance on hard
        #I am keeping this code her in case we want to adjust the drop-rates later
    }*/
  if (Math.random() < dropChance) {
    game.powerUps.push({
      x: enemy.x,
      y: enemy.y,
      size: 12,
      speed: 80,
      active: true,
    });
  }
}

export function updatePowerUps(game, delta, canvas) {
  // Single-pass update: move, check collection, remove off-screen/collected
  game.powerUps = game.powerUps.filter(powerUp => {
    // Move downward
    powerUp.y += powerUp.speed * delta;

    // Remove when far off-screen
    if (powerUp.y > canvas.height + 50) return false;

    // Player collection check
    const dx = game.player.x - powerUp.x;
    const dy = game.player.y - powerUp.y;
    const distance = Math.hypot(dx, dy);

    if (distance < game.player.size + powerUp.size) {
      // Grant triple-shot for 10 seconds
      game.tripleShotTimer = 10;

      // Play power-up collection sound
      audioManager.playPowerUpSound();

      return false; // collected → remove
    }

    return true; // keep alive
  });

  // Countdown active triple-shot timer
  if (game.tripleShotTimer > 0) {
    game.tripleShotTimer -= delta;
    if (game.tripleShotTimer < 0) game.tripleShotTimer = 0;
  }
}

export function drawPowerUps(ctx, powerUps) {
  for (const powerUp of powerUps) {
    ctx.save();
    ctx.translate(powerUp.x, powerUp.y);

    // Outer glowing circle
    ctx.fillStyle = '#ffdd00';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffdd00';
    ctx.beginPath();
    ctx.arc(0, 0, powerUp.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Inner darker circle for depth
    ctx.fillStyle = '#cc9900';
    ctx.beginPath();
    ctx.arc(0, 0, powerUp.size * 0.85, 0, Math.PI * 2);
    ctx.fill();

    // Triple-shot icon (three white laser lines)
    const iconSize = powerUp.size * 0.7;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    // Left laser
    ctx.beginPath();
    ctx.moveTo(-iconSize * 0.4, iconSize * 0.4);
    ctx.lineTo(-iconSize * 0.25, -iconSize * 0.5);
    ctx.stroke();

    // Center laser
    ctx.beginPath();
    ctx.moveTo(0, iconSize * 0.5);
    ctx.lineTo(0, -iconSize * 0.6);
    ctx.stroke();

    // Right laser
    ctx.beginPath();
    ctx.moveTo(iconSize * 0.4, iconSize * 0.4);
    ctx.lineTo(iconSize * 0.25, -iconSize * 0.5);
    ctx.stroke();

    ctx.restore();
  }
}
