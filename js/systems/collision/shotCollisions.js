// js/systems/collision/shotCollisions.js

import {
  getEnemyHitbox,
  getShotHitbox,
  getEnemyShotHitbox,
  getPlayerHitbox,
} from "./hitboxes.js";
import { boxesOverlap } from "./detection.js";

/**
 * Checks all active player shots for collisions with enemies.
 * When a hit occurs the enemy is marked as dying and the bullet is deactivated.
 * Supports optional callbacks for scoring, power-ups, etc.
 *
 * @param {Object} game - Global game state.
 * @param {function(Object): void} [onEnemyKilled] - Called when an enemy is hit (receives the enemy object).
 */
export function checkPlayerShotCollisions(game, onEnemyKilled) {
  if (!game.playerShots?.length || !game.enemies?.length) return;

  // Iterate backwards so we can safely remove bullets while looping
  for (let i = game.playerShots.length - 1; i >= 0; i--) {
    const shot = game.playerShots[i];
    if (!shot || shot.active === false) continue;

    const shotBox = getShotHitbox(shot);
    if (!shotBox) continue;

    let hitSomething = false;
    for (const enemy of game.enemies) {
      if (enemy.state === "dying") continue;

      const enemyBox = getEnemyHitbox(enemy);
      if (boxesOverlap(shotBox, enemyBox)) {
        // Kill the enemy
        enemy.state = "dying";
        enemy.dyingTimer = 0.3;

        // Deactivate the bullet (no piercing)
        shot.active = false;
        hitSomething = true;

        if (typeof onEnemyKilled === "function") onEnemyKilled(enemy);
        if (typeof shot.onHit === "function") shot.onHit(enemy);

        break; // One bullet = one hit
      }
    }
  }

  // Clean up inactive shots
  game.playerShots = game.playerShots.filter((s) => s && s.active !== false);
}

/**
 * Checks all active enemy shots for collisions with the player.
 *
 * @param {Object} game - Global game state.
 * @param {function(string): void} [onPlayerHit] - Called when the player is hit by a laser (receives hit type).
 * @returns {boolean} `true` if the player was hit this frame, otherwise `false`.
 */
export function checkEnemyShotCollisions(game, onPlayerHit) {
  if (!game.enemyShots?.length || !game.player) return false;

  const playerBox = getPlayerHitbox(game.player);

  for (let i = game.enemyShots.length - 1; i >= 0; i--) {
    const shot = game.enemyShots[i];
    const shotBox = getEnemyShotHitbox(shot);
    if (!shotBox) continue;

    if (boxesOverlap(shotBox, playerBox)) {
      game.enemyShots.splice(i, 1);
      if (typeof onPlayerHit === "function") onPlayerHit("laser"); // Pass "laser" as hit type
      return true;
    }
  }
  return false;
}