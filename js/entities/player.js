import { isKeyPressed } from '../core/input.js';

export function createPlayer(canvas) {
  return {
    x: canvas.width / 2,
    y: canvas.height * 0.75,
    size: 20,
    speed: 220,
  };
}

export function updatePlayer(game, delta, canvas, barrierY, createPlayerShot) {
  const player = game.player;
  if (!player) return;

  if (isKeyPressed('ArrowLeft') || isKeyPressed('KeyA'))
    player.x -= player.speed * delta;
  if (isKeyPressed('ArrowRight') || isKeyPressed('KeyD'))
    player.x += player.speed * delta;
  if (isKeyPressed('ArrowUp') || isKeyPressed('KeyW'))
    player.y -= player.speed * delta;
  if (isKeyPressed('ArrowDown') || isKeyPressed('KeyS'))
    player.y += player.speed * delta;

  player.x = Math.max(
    player.size,
    Math.min(canvas.width - player.size, player.x)
  );
  player.y = Math.max(
    barrierY + player.size,
    Math.min(canvas.height - player.size, player.y)
  );

  if (game.playerShootingUnlocked && isKeyPressed('Space') && game.canShoot) {
    if (game.tripleShotTimer > 0) {
      // Triple shot - shotgun pattern
      // Play sound only once for all three bullets
      const angleOffset = Math.PI / 10; // 18 degrees
      game.playerShots.push(
        createPlayerShot(player.x, player.y - player.size, -angleOffset, true) // First bullet plays sound
      );
      game.playerShots.push(
        createPlayerShot(player.x, player.y - player.size, 0, false) // Second bullet silent
      );
      game.playerShots.push(
        createPlayerShot(player.x, player.y - player.size, angleOffset, false) // Third bullet silent
      );
    } else {
      // Normal single shot
      game.playerShots.push(
        createPlayerShot(player.x, player.y - player.size, 0, true) // Play sound
      );
    }
    game.canShoot = false;
    setTimeout(() => {
      game.canShoot = true;
    }, 170);
  }
}

export function drawPlayer(ctx, player, invincibilityTimer, game) {
  if (!player) return;

  ctx.save();
  ctx.translate(player.x, player.y);

  if (invincibilityTimer > 0) {
    const flash = Math.floor(invincibilityTimer * 10) % 2;
    if (flash === 0) {
      ctx.globalAlpha = 0.3;
    }
  }

  ctx.fillStyle = '#00d9ff';
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#00d9ff';
  if (game.activeSkin === 'squarePack') {
    // CHANGED: Check activeSkin
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
    // Original triangle
    ctx.beginPath();
    ctx.moveTo(0, -player.size);
    ctx.lineTo(player.size * 0.7, player.size * 0.8);
    ctx.lineTo(0, player.size * 0.4);
    ctx.lineTo(-player.size * 0.7, player.size * 0.8);
    ctx.closePath();
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  ctx.restore();
}