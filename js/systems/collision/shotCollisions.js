import {
  getEnemyHitbox,
  getShotHitbox,
  getEnemyShotHitbox,
  getPlayerHitbox,
} from './hitboxes.js';
import { boxesOverlap } from './detection.js';

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
      // Pass 'ball' as the hit type since this is a projectile
      if (typeof onPlayerHit === 'function') onPlayerHit('ball');
      return true;
    }
  }
  return false;
}
