function getEnemyHitbox(enemy) {
    const width = enemy.size * 1.7;
    const height = enemy.size * 1.3;
    return {
        x: enemy.x - width / 2,
        y: enemy.y - height / 2,
        width,
        height
    };
}

function getPlayerHitbox(player) { // enemies.js
    const width = player.size * 1.2;
    const height = player.size * 2;
    return {
        x: player.x - width / 2,
        y: player.y - height / 2,
        width,
        height
    };
}

function getLaserHitbox(shot, canvasHeight) {
    if (!shot) return null;
    if (shot.hitbox) {
        const { x, y, width, height } = shot.hitbox;
        return { x, y, width, height };
    }

    if (typeof shot.x === 'number' && typeof shot.y === 'number') {
        const width = shot.width ?? 6;
        const height = shot.height ?? canvasHeight;
        const direction = shot.direction ?? -1;
        const topY = direction < 0 ? shot.y - height : shot.y;
        return {
            x: shot.x - width / 2,
            y: topY,
            width,
            height
        };
    }

    return null;
}

function boxesOverlap(a, b) { // enemies.js
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

export function checkPlayerShotCollisions(game, canvasHeight, onEnemyKilled) {
    if (!game.playerShots.length || !game.enemies.length) return;

    for (const shot of game.playerShots) {
        if (!shot || shot.active === false) continue;

        const shotBox = getLaserHitbox(shot, canvasHeight);
        if (!shotBox) continue;

        for (const enemy of game.enemies) {
            if (enemy.state === 'dying') continue;
            const enemyBox = getEnemyHitbox(enemy);
            if (boxesOverlap(shotBox, enemyBox)) {
                if (typeof onEnemyKilled === 'function') {
                    onEnemyKilled(enemy);
                }
                if (typeof shot.onHit === 'function') {
                    shot.onHit(enemy);
                }
                if (!shot.pierces) {
                    shot.active = false;
                }
                break;
            }
        }
    }

    game.playerShots = game.playerShots.filter((shot) => shot && shot.active !== false);
}

export function checkPlayerEnemyCollision(game, onPlayerHit) {
    if (!game.player || !game.enemies.length) return false;

    const playerBox = getPlayerHitbox(game.player);

    for (const enemy of game.enemies) {
        if (enemy.state === 'dying' || enemy.state === 'waiting') continue;
        
        const enemyBox = getEnemyHitbox(enemy);
        if (boxesOverlap(playerBox, enemyBox)) {
            if (typeof onPlayerHit === 'function') {
                onPlayerHit(enemy);
            }
            return true; // Collision detected
        }
    }

    return false;
}
