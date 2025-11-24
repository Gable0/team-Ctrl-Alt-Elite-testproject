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

function getPlayerHitbox(player) {
    const width = player.size * 1.2;
    const height = player.size * 2;
    return {
        x: player.x - width / 2,
        y: player.y - height / 2,
        width,
        height
    };
}

function getShotHitbox(shot) {
    if (!shot || shot.active === false) return null;

    // Player bullet - small vertical rectangle
    const width = 5;
    const height = 26;
    return {
        x: shot.x - width / 2,
        y: shot.y - height / 2,
        width,
        height
    };
}

function getEnemyShotHitbox(shot) {
    if (!shot) return null;
    const s = shot.size;
    return {
        x: shot.x - s,
        y: shot.y - s,
        width: s * 2,
        height: s * 2
    };
}

function boxesOverlap(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

export function checkPlayerShotCollisions(game, onEnemyKilled) {
    if (!game.playerShots?.length || !game.enemies?.length) return;

    for (let i = game.playerShots.length - 1; i >= 0; i--) {
        const shot = game.playerShots[i];
        if (!shot || shot.active === false) continue;

        const shotBox = getShotHitbox(shot);
        if (!shotBox) continue;

        let hitSomething = false;
        for (const enemy of game.enemies) {
            if (enemy.state === 'dying') continue;

            const enemyBox = getEnemyHitbox(enemy);
            if (boxesOverlap(shotBox, enemyBox)) {
                // Kill the enemy
                enemy.state = 'dying';
                enemy.dyingTimer = 0.3;

                // Remove the bullet immediately (no piercing)
                shot.active = false;
                hitSomething = true;

                if (typeof onEnemyKilled === 'function') onEnemyKilled(enemy);
                if (typeof shot.onHit === 'function') shot.onHit(enemy);

                break; // Stop checking other enemies - this bullet is gone
            }
        }
    }

    game.playerShots = game.playerShots.filter(s => s && s.active !== false);
}

export function checkEnemyShotCollisions(game, onPlayerHit) {
    if (!game.enemyShots?.length || !game.player) return false;

    const playerBox = getPlayerHitbox(game.player);

    for (let i = game.enemyShots.length - 1; i >= 0; i--) {
        const shot = game.enemyShots[i];
        const shotBox = getEnemyShotHitbox(shot);
        if (!shotBox) continue;

        if (boxesOverlap(shotBox, playerBox)) {
            game.enemyShots.splice(i, 1);
            if (typeof onPlayerHit === 'function') onPlayerHit();
            return true;
        }
    }
    return false;
}

export function checkPlayerEnemyCollision(game, onPlayerHit) {
    if (!game.player || !game.enemies?.length) return false;

    const playerBox = getPlayerHitbox(game.player);

    for (const enemy of game.enemies) {
        // Skip enemies that are already dying or waiting to enter
        if (enemy.state === 'dying' || enemy.state === 'waiting') continue;

        const enemyBox = getEnemyHitbox(enemy);
        if (boxesOverlap(playerBox, enemyBox)) {
            // Kill the enemy immediately
            enemy.state = 'dying';
            enemy.dyingTimer = 0.3;
            
            // Notify that player was hit
            if (typeof onPlayerHit === 'function') onPlayerHit();
            
            // Return true to indicate collision happened
            return true;
        }
    }
    return false;
}