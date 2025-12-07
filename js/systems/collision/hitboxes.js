// js/systems/collision/hitboxes.js

/**
 * Returns the axis-aligned hitbox for an enemy.
 * The hitbox is slightly larger than the visual size for more forgiving collision.
 *
 * @param {Object} enemy - Enemy object with `x`, `y`, and `size` properties.
 * @returns {{x: number, y: number, width: number, height: number}} Enemy hitbox rectangle.
 */
export function getEnemyHitbox(enemy) {
  const width = enemy.size * 1.7;
  const height = enemy.size * 1.3;
  return {
    x: enemy.x - width / 2,
    y: enemy.y - height / 2,
    width,
    height,
  };
}

/**
 * Returns the axis-aligned hitbox for the player ship.
 *
 * @param {Object} player - Player object with `x`, `y`, and `size` properties.
 * @returns {{x: number, y: number, width: number, height: number}} Player hitbox rectangle.
 */
export function getPlayerHitbox(player) {
  const width = player.size * 1.2;
  const height = player.size * 2;
  return {
    x: player.x - width / 2,
    y: player.y - height / 2,
    width,
    height,
  };
}

/**
 * Returns the hitbox for a player-fired shot.
 * Returns `null` if the shot is inactive or missing.
 *
 * @param {Object} shot - Player shot object (must have `x`, `y`, and `active`).
 * @returns {{x: number, y: number, width: number, height: number}|null} Shot hitbox or null.
 */
export function getShotHitbox(shot) {
  if (!shot || shot.active === false) return null;

  // Player bullet - small vertical rectangle
  const width = 5;
  const height = 26;
  return {
    x: shot.x - width / 2,
    y: shot.y - height / 2,
    width,
    height,
  };
}

/**
 * Returns the hitbox for an enemy-fired shot.
 *
 * @param {Object} shot - Enemy shot object (must have `x`, `y`, and `size`).
 * @returns {{x: number, y: number, width: number, height: number}|null} Shot hitbox or null.
 */
export function getEnemyShotHitbox(shot) {
  if (!shot) return null;
  const s = shot.size;
  return {
    x: shot.x - s,
    y: shot.y - s,
    width: s * 2,
    height: s * 2,
  };
}
