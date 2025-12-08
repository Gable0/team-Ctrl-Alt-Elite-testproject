// js/systems/coins.js

export function spawnCoin(game, enemy) {
  // Chance to drop a coin when an enemy dies
  if (Math.random() < 0.05) {
    // 5% chance
    game.coins = game.coins || [];
    game.coins.push({
      x: enemy.x,
      y: enemy.y,
      size: 10,
      speed: 120,
      value: 1,
      active: true,
      wobble: Math.random() * Math.PI * 2,
    });
  }
}

export function updateCoins(game, delta, canvas) {
  game.coins = (game.coins || []).filter(coin => {
    coin.y += coin.speed * delta;
    coin.wobble += delta * 6; // small horizontal motion
    coin.x += Math.sin(coin.wobble) * 6 * delta;

    // off-screen
    if (coin.y > canvas.height + 50) return false;

    // check collection
    const dx = game.player.x - coin.x;
    const dy = game.player.y - coin.y;
    const distance = Math.hypot(dx, dy);
    if (distance < game.player.size + coin.size) {
      // increment player's stored coins and persist
      game.coinCount = (game.coinCount || 0) + (coin.value || 1);
      try {
        localStorage.setItem('coinCount', String(game.coinCount));
      } catch (e) {
        // ignore storage errors
      }

      // optional: play coin sound if audio system available
      if (
        game.audioManager &&
        typeof game.audioManager.playCoin === 'function'
      ) {
        game.audioManager.playCoin();
      }

      return false; // collected
    }

    return true;
  });
}

export function drawCoins(ctx, coins) {
  if (!coins || !coins.length) return;
  for (const coin of coins) {
    ctx.save();
    ctx.translate(coin.x, coin.y);

    // simple coin with radial gradient
    const r = coin.size;
    const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    g.addColorStop(0, '#fff9c4');
    g.addColorStop(0.5, '#ffd54f');
    g.addColorStop(1, '#bf8f00');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // coin rim
    ctx.strokeStyle = '#ffffff55';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // small dollar/coin mark
    ctx.fillStyle = '#8a5600';
    ctx.font = `${Math.max(8, r * 0.9)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('¢', 0, 0);

    ctx.restore();
  }
}
