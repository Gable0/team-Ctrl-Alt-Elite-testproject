import { isKeyPressed } from '../core/input.js';

export function createPlayer(canvas) {
    return {
        x: canvas.width / 2,
        y: canvas.height * 0.75,
        size: 20,
        speed: 220
    };
}

export function updatePlayer(game, delta, canvas, barrierY, createPlayerShot) {
    const player = game.player;
    if (!player) return;

    if (isKeyPressed('ArrowLeft') || isKeyPressed('KeyA')) player.x -= player.speed * delta;
    if (isKeyPressed('ArrowRight') || isKeyPressed('KeyD')) player.x += player.speed * delta;
    if (isKeyPressed('ArrowUp') || isKeyPressed('KeyW')) player.y -= player.speed * delta;
    if (isKeyPressed('ArrowDown') || isKeyPressed('KeyS')) player.y += player.speed * delta;

    player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
    player.y = Math.max(barrierY + player.size, Math.min(canvas.height - player.size, player.y));

    if (game.playerShootingUnlocked && isKeyPressed('Space') && game.canShoot) {
        game.playerShots.push(createPlayerShot(player.x, player.y - player.size));
        game.canShoot = false;
        setTimeout(() => {
            game.canShoot = true;
        }, 170);
    }
}

export function drawPlayer(ctx, player, invincibilityTimer) {
    if (!player) return;

    ctx.save();
    ctx.translate(player.x, player.y);

    if (invincibilityTimer > 0) {
        const flash = Math.floor(invincibilityTimer * 10) % 2;
        if (flash === 0) {
            ctx.globalAlpha = 0.3;
        }
    }

    ctx.fillStyle = '#5eead4';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#5eead4';
    ctx.beginPath();
    ctx.moveTo(0, -player.size);
    ctx.lineTo(player.size * 0.7, player.size * 0.8);
    ctx.lineTo(0, player.size * 0.4);
    ctx.lineTo(-player.size * 0.7, player.size * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
}
