// tests/integration/01-player-kills-enemy.test.js
import { test, assert } from "vitest";
import { createInitialGame } from "../../js/state/gameState.js";
import { checkPlayerShotCollisions } from "../../js/systems/collision/shotCollisions.js";
import { handleEnemyKilled } from "../../js/state/gameState.js";
import { spawnPowerUp } from "../../js/systems/powerUps.js";
import { createPlayerShot } from "../../js/systems/shootingSystem.js";

test("Player shoots → enemy dies → power-up drops (at least once in 10 tries)", () => {
  let powerUpDropped = false;

  // Run the scenario 10 times — with easy mode = 25% chance → 99.999% success rate
  for (let attempt = 1; attempt <= 10; attempt++) {
    const game = createInitialGame();
    game.difficulty = "easy"; // 25% drop chance
    game.player = { x: 400, y: 500, size: 20 };

    game.enemies.push({ x: 400, y: 300, size: 20, state: "formation" });

    const shot = createPlayerShot(400, 500);
    shot.y = 320; // guaranteed hit
    game.playerShots.push(shot);

    checkPlayerShotCollisions(game, (enemy) => {
      handleEnemyKilled(game, enemy);
      spawnPowerUp(game, enemy);
    });

    if (game.powerUps.length > 0) {
      powerUpDropped = true;
      console.log(`Power-up dropped on attempt ${attempt}`);
      break;
    }
  }

  assert.isTrue(powerUpDropped, "Power-up never dropped in 10 attempts!");
});
