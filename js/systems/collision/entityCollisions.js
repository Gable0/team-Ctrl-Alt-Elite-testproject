import { getEnemyHitbox, getPlayerHitbox } from './hitboxes.js';
import { boxesOverlap } from './detection.js';

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
