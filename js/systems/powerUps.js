// js/systems/powerUps.js

export function spawnPowerUp(game, enemy) {
  // 25% chance to drop a power-up
  let dropChance = 0.1; // default (medium)

  if (game.difficulty === 'easy') {
    dropChance = 0.25; // 40% chance on easy
  } else if (game.difficulty === 'hard') {
    dropChance = 0.05; // 5% chance on hard
  }
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
  // ONE PASS — move + collect + filter all at once
  game.powerUps = game.powerUps.filter(powerUp => {
    // Move down
    powerUp.y += powerUp.speed * delta;

    // Off-screen → remove
    if (powerUp.y > canvas.height + 50) return false;

    // Check player collection
    const dx = game.player.x - powerUp.x;
    const dy = game.player.y - powerUp.y;
    const distance = Math.hypot(dx, dy);

    if (distance < game.player.size + powerUp.size) {
      game.tripleShotTimer = 30; // 30 seconds of triple shot
      return false; // collected → remove
    }

    return true; // keep on screen
  });

  // Timer countdown
  if (game.tripleShotTimer > 0) {
    game.tripleShotTimer -= delta;
    if (game.tripleShotTimer < 0) game.tripleShotTimer = 0;
  }
}

export function drawPowerUps(ctx, powerUps) {
  for (const powerUp of powerUps) {
    ctx.save();
    ctx.translate(powerUp.x, powerUp.y);

    // Outer glow circle
    ctx.fillStyle = '#ffdd00';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffdd00';
    ctx.beginPath();
    ctx.arc(0, 0, powerUp.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Inner darker circle for contrast
    ctx.fillStyle = '#cc9900';
    ctx.beginPath();
    ctx.arc(0, 0, powerUp.size * 0.85, 0, Math.PI * 2);
    ctx.fill();

    // Triple shot icon - white with black outline for clarity
    const iconSize = powerUp.size * 0.7;

    // Draw white strokes first (thicker)
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
