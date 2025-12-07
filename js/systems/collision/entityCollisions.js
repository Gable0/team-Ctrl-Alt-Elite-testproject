// js/systems/collision/entityCollisions.js

import { getEnemyHitbox, getPlayerHitbox } from './hitboxes.js';
import { boxesOverlap } from './detection.js';

/**
 * Checks for collisions between the player ship and any active enemy.
 * When a collision occurs the enemy is instantly killed and the player
 * takes damage (handled via the `onPlayerHit` callback).
 *
 * @param {Object} game - Global game state object.
 * @param {Function} onPlayerHit - Callback executed when the player is hit.
 * @returns {boolean} `true` if a collision occurred this frame, otherwise `false`.
 */
export function checkPlayerEnemyCollision(game, onPlayerHit) {
  if (!game.player || !game.enemies?.length) return false;

  const playerBox = getPlayerHitbox(game.player);

  for (const enemy of game.enemies) {
    // Skip enemies that are already dying or still waiting to enter the screen
    if (enemy.state === 'dying' || enemy.state === 'waiting') continue;

    const enemyBox = getEnemyHitbox(enemy);
    if (boxesOverlap(playerBox, enemyBox)) {
      // Kill the enemy immediately
      enemy.state = 'dying';
      enemy.dyingTimer = 0.3;

      // Notify that the player was hit by an enemy (not a laser)
      if (typeof onPlayerHit === 'function') onPlayerHit('enemy'); // Pass "enemy" as hit type

      // Return true to indicate a collision happened
      return true;
    }
  }
  return false;
}
