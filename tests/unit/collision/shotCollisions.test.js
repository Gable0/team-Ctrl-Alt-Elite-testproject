import { test, assert } from "vitest";
import {
  checkPlayerShotCollisions,
  checkEnemyShotCollisions,
} from "../../../js/systems/collision/shotCollisions.js";

test("player shot kills enemy and removes bullet (no piercing)", () => {
  const game = {
    playerShots: [{ x: 400, y: 300, active: true }],
    enemies: [{ x: 400, y: 300, size: 20, state: "formation" }],
  };

  let killed = false;
  checkPlayerShotCollisions(game, () => {
    killed = true;
  });

  assert.isTrue(killed);
  assert.equal(game.enemies[0].state, "dying");
  assert.closeTo(game.enemies[0].dyingTimer, 0.3, 0.01);
  assert.equal(game.playerShots.length, 0);
});

test("player shot ignores dying enemies", () => {
  const game = {
    playerShots: [{ x: 400, y: 300, active: true }],
    enemies: [{ x: 400, y: 300, size: 20, state: "dying" }],
  };

  checkPlayerShotCollisions(game, () => {
    assert.fail("should not call");
  });
  assert.equal(game.playerShots.length, 1);
});

test("multiple player shots — only one hits per bullet", () => {
  const game = {
    playerShots: [
      { x: 400, y: 300, active: true },
      { x: 410, y: 300, active: true },
    ],
    enemies: [{ x: 400, y: 300, size: 30, state: "formation" }],
  };

  let killCount = 0;
  checkPlayerShotCollisions(game, () => {
    killCount++;
  });

  assert.equal(killCount, 1);
  assert.equal(game.enemies[0].state, "dying");
  assert.equal(game.playerShots.length, 1);
});

test("enemy shot hits player — returns true and removes shot", () => {
  const game = {
    player: { x: 400, y: 500, size: 20 },
    enemyShots: [{ x: 400, y: 500, size: 6 }],
  };

  let hit = false;
  const result = checkEnemyShotCollisions(game, () => {
    hit = true;
  });

  assert.isTrue(hit);
  assert.isTrue(result);
  assert.equal(game.enemyShots.length, 0);
});

test("enemy shot misses player — returns false", () => {
  const game = {
    player: { x: 400, y: 500, size: 20 },
    enemyShots: [{ x: 100, y: 100, size: 6 }],
  };

  const result = checkEnemyShotCollisions(game, () => {
    assert.fail("should not hit");
  });

  assert.isFalse(result);
  assert.equal(game.enemyShots.length, 1);
});
