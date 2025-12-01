// js/systems/shootingSystem.js
let canvasRef = null;

export function initShooting(canvas) {
    canvasRef = canvas;
}

export function createPlayerShot(x, y, angle = 0) {
    const speed = 800;
    return {
        x: x,
        y: y - 20,
        vx: Math.sin(angle) * speed,
        vy: -Math.cos(angle) * speed,
        speed: speed,
        active: true,
        update(delta) {
            this.x += this.vx * delta;
            this.y += this.vy * delta;
            if (this.y < -50 || this.x < -50 || this.x > canvasRef.width + 50) {
                this.active = false;
            }
        }
    };
}

export function updatePlayerShots(game, delta) {
    for (const shot of game.playerShots) {
        if (shot.active !== false) shot.update(delta);
    }
}

export function fireEnemyShot(enemy, game) {
    if (game.enemyShots.length >= 8) return;
    const p = game.player;
    const dx = p.x - enemy.x + (Math.random() * 80 - 40);
    const dy = p.y - enemy.y + (Math.random() * 60 - 30);
    const dist = Math.hypot(dx, dy) || 1;
    const baseSpeed = 180;
    const speedMultiplier = 1 + (game.level - 1) * 0.5;
    const speed = baseSpeed * speedMultiplier;
    game.enemyShots.push({
        x: enemy.x,
        y: enemy.y + enemy.size,
        vx: (dx / dist) * speed,
        vy: (dy / dist) * speed,
        size: 6
    });
}

export function updateEnemyShots(game, delta) {
    if (!canvasRef) return;

    if (!game.playerShootingUnlocked) {
        // Prevent enemy fire until the player can respond
        game.globalEnemyShotTimer = Math.max(game.globalEnemyShotTimer, 0);
        return;
    }
    
    const fireRateMultiplier = Math.pow(0.9, game.level - 1);
    const currentDelay = game.baseFireRateDelay * fireRateMultiplier;
    const currentVariance = game.baseFireRateVariance * fireRateMultiplier;
    
    game.globalEnemyShotTimer -= delta;
    if (game.globalEnemyShotTimer <= 0) {
        const shooters = game.enemies.filter(e => e.state === 'formation');
        if (shooters.length > 0 && Math.random() < 0.8) {
            const shooter = shooters[Math.floor(Math.random() * shooters.length)];
            fireEnemyShot(shooter, game);
        }
        game.globalEnemyShotTimer = Math.random() * currentVariance + currentDelay;
    }

    for (const enemy of game.enemies) {
        if (enemy.state === 'attacking' && Math.random() < 0.08) {
            fireEnemyShot(enemy, game);
        }
    }

    game.enemyShots = game.enemyShots.filter(shot => {
        shot.x += shot.vx * delta;
        shot.y += shot.vy * delta;
        return shot.y < canvasRef.height + 50;
    });
}

export function drawPlayerShots(ctx, shots) {
    ctx.fillStyle = '#00ff99';
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#00ff99';
    for (const shot of shots) {
        if (shot.active !== false) {
            ctx.fillRect(shot.x - 2.5, shot.y - 13, 5, 26);
        }
    }
    ctx.shadowBlur = 0;
}

export function drawEnemyShots(ctx, shots) {
    ctx.fillStyle = '#ff5555';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff5555';
    for (const shot of shots) {
        ctx.beginPath();
        ctx.arc(shot.x, shot.y, shot.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.shadowBlur = 0;
}
