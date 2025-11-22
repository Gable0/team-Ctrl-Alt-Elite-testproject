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

function boxesOverlap(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

export function checkPlayerEnemyCollision(game, onPlayerHit) {
    if (!game.player || !game.enemies.length) return false;

    const playerBox = getPlayerHitbox(game.player);

    for (const enemy of game.enemies) {
        // Check collision with enemies in any state except dying and waiting
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