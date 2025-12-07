let canvasRef = null;

export function initEnemyAttack(canvas) {
  canvasRef = canvas;
}

export function selectAttackingEnemy(enemies) {
  // Filter enemies that are in formation and not already attacking
  const availableEnemies = enemies.filter(
    enemy => enemy.state === 'formation' && !enemy.isAttacking
  );

  if (availableEnemies.length === 0) return null;

  // Randomly select an enemy to attack
  const randomIndex = Math.floor(Math.random() * availableEnemies.length);
  return availableEnemies[randomIndex];
}

export function startEnemyAttack(enemy, player) {
  if (!canvasRef || !player) return;

  enemy.isAttacking = true;
  enemy.state = 'attacking';
  enemy.attackPath = generateAttackPath(enemy, player);
  enemy.attackPathIndex = 0;
  enemy.attackSpeed = 250;
}

function generateAttackPath(enemy, player) {
  if (!canvasRef) return [];

  // Create a dive path toward the player
  const startX = enemy.x;
  const startY = enemy.y;

  // Dive point near player
  const diveX = player.x + (Math.random() - 0.5) * 100;
  const diveY = player.y;

  // Exit point off screen
  const exitX = startX < canvasRef.width / 2 ? -80 : canvasRef.width + 80;
  const exitY = canvasRef.height + 80;

  // Return point to formation
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

export function updateAttackingEnemy(enemy, delta) {
  if (
    !enemy.attackPath ||
    enemy.attackPathIndex >= enemy.attackPath.length - 1
  ) {
    // Attack complete, return to formation
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

export function scheduleEnemyAttacks(enemies, player, delta, attackTimer) {
  // Attack every 3-5 seconds
  attackTimer.current -= delta;

  if (attackTimer.current <= 0) {
    const attacker = selectAttackingEnemy(enemies);
    if (attacker) {
      startEnemyAttack(attacker, player);
    }
    attackTimer.current = 3 + Math.random() * 2; // Reset timer
  }

  return attackTimer;
}
