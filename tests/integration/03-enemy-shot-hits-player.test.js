// tests/integration/03-enemy-shot-hits-player.test.js
import { test, assert } from 'vitest';
import { createInitialGame } from '../../js/state/gameState.js';
import { checkEnemyShotCollisions } from '../../js/systems/collision/shotCollisions.js';
import { handlePlayerHit } from '../../js/state/gameState.js';
beforeAll(() => {
  global.canvasRef = { width: 800, height: 600 };
});

test('INTEGRATION: Enemy shot hits player — life lost + invincibility', () => {
  const game = createInitialGame();
  game.player = { x: 400, y: 500, size: 20 };
  game.enemyShots.push({ x: 400, y: 500, size: 6 });

  checkEnemyShotCollisions(game, () => handlePlayerHit(game));

  assert.equal(game.lives, 2);
  assert.isAbove(game.invincibilityTimer, 0);
  console.log('PLAYER HIT — SHIELD UP');
});
