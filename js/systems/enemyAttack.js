// js/systems/enemyAttack.js
// Handles enemy dive-attack behavior: selection, path generation, movement, and scheduling.

let canvasRef = null;

/**
 * Stores a reference to the game canvas (used for off-screen exit points).
 *
 * @param {HTMLCanvasElement} canvas
 */
export function initEnemyAttack(canvas) {
    canvasRef = canvas;
}

/**
 * Randomly selects one enemy from those currently in formation that are not already attacking.
 *
 * @param {Array<Object>} enemies - List of all enemy objects.
 * @returns {Object|null} Selected enemy or null if none are available.
 */
export function selectAttackingEnemy(enemies) {
    const availableEnemies = enemies.filter(
        enemy => enemy.state === 'formation' && !enemy.isAttacking
    );

    if (availableEnemies.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * availableEnemies.length);
    return availableEnemies[randomIndex];
}

/**
 * Initiates a dive attack for a single enemy.
 *
 * @param {Object} enemy  - The enemy that will perform the attack.
 * @param {Object} player - The player object (used to calculate dive point).
 */
export function startEnemyAttack(enemy, player) {
    if (!canvasRef || !player) return;

    enemy.isAttacking = true;
    enemy.state = 'attacking';
    enemy.attackPath = generateAttackPath(enemy, player);
    enemy.attackPathIndex = 0;
    enemy.attackSpeed = 250;
}

/**
 * Generates a five-point attack path:
 *   1. Current position
 *   2. Dive toward player
 *   3. Exit off-screen
 *   4. Return above the formation
 *   5. Back to original formation slot
 *
 * @param {Object} enemy
 * @param {Object} player
 * @returns {Array<{x:number, y:number}>}
 */
function generateAttackPath(enemy, player) {
    if (!canvasRef) return [];

    const startX = enemy.x;
    const startY = enemy.y;

    // Randomised dive point near the player
    const diveX = player.x + (Math.random() - 0.5) * 100;
    const diveY = player.y;

    // Exit direction depends on which side of the screen the enemy started from
    const exitX = startX < canvasRef.width / 2 ? -80 : canvasRef.width + 80;
    const exitY = canvasRef.height + 80;

    // Return above the formation, then final slot
    const returnX = enemy.finalX;
    const returnY = -80;

    return [
        { x: startX, y: startY },
        { x: diveX, y: diveY },
        { x: exitX, y: exitY },
        { x: returnX, y: returnY },
        { x: enemy.finalX, y: enemy.finalY },
    ];
}

/**
 * Moves an attacking enemy along its pre-calculated attack path.
 *
 * @param {Object} enemy - The attacking enemy.
 * @param {number} delta - Time elapsed since last frame (seconds).
 */
export function updateAttackingEnemy(enemy, delta) {
    if (
        !enemy.attackPath ||
        enemy.attackPathIndex >= enemy.attackPath.length - 1
    ) {
        // Attack finished – return to formation
        enemy.isAttacking = false;
        enemy.state = 'formation';
        enemy.x = enemy.finalX;
        enemy.y = enemy.finalY;
        return;
    }

    let remaining = enemy.attackSpeed * delta;

    while (remaining > 0 && enemy.attackPathIndex < enemy.attackPath.length - 1) {
        const currentTarget = enemy.attackPath[enemy.attackPathIndex + 1];
        const dx = currentTarget.x - enemy.x;
        const dy = currentTarget.y - enemy.y;
        const distance = Math.hypot(dx, dy);

        if (distance <= remaining) {
            enemy.x = currentTarget.x;
            enemy.y = currentTarget.y;
            enemy.attackPathIndex += 1;
            remaining -= distance;
        } else {
            const ratio = remaining / distance;
            enemy.x += dx * ratio;
            enemy.y += dy * ratio;
            remaining = 0;
        }
    }
}

/**
 * Schedules enemy dive attacks on an interval (approximately every 3–5 seconds).
 *
 * @param {Array<Object>} enemies - All enemies.
 * @param {Object} player - Player object.
 * @param {number} delta - Delta time (seconds).
 * @param {Object} attackTimer - Timer object with a `current` property.
 * @returns {Object} Updated timer object.
 */
export function scheduleEnemyAttacks(enemies, player, delta, attackTimer) {
    attackTimer.current -= delta;

    if (attackTimer.current <= 0) {
        const attacker = selectAttackingEnemy(enemies);
        if (attacker) {
            startEnemyAttack(attacker, player);
        }
        attackTimer.current = 3 + Math.random() * 2; // next attack in 3-5 seconds
    }

    return attackTimer;
}