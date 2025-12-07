import { test, assert } from "vitest";
import {
  spawnEnemyWave,
  initEnemyModule,
} from "../../../js/entities/enemyManager.js";

// Mock canvas and ctx
const canvas = { width: 800, height: 600 };
const ctx = {};

beforeAll(() => {
  initEnemyModule(canvas, ctx); // ← THIS WAS MISSING
});

test("spawnEnemyWave creates exactly 40 enemies", () => {
  const game = { enemies: [] };
  spawnEnemyWave(game);
  assert.equal(game.enemies.length, 40);
});

test("enemies are in perfect grid with correct spacing", () => {
  const game = { enemies: [] };
  spawnEnemyWave(game);

  const e1 = game.enemies[0];
  const e2 = game.enemies[1];
  const e11 = game.enemies[10];

  assert.closeTo(e2.finalX - e1.finalX, 60, 2);
  assert.closeTo(e2.finalY, e1.finalY, 1);
  assert.closeTo(e11.finalY - e1.finalY, 45, 2);
  assert.closeTo(e11.finalX, e1.finalX, 1);
});

test("enemy types progress correctly per row", () => {
  const game = { enemies: [] };
  spawnEnemyWave(game);

  assert.equal(game.enemies[0].size, 14);
  assert.equal(game.enemies[10].size, 15);
  assert.equal(game.enemies[20].size, 16);
  assert.equal(game.enemies[30].size, 18);
});

test("enemies start in waiting state", () => {
  const game = { enemies: [] };
  spawnEnemyWave(game);

  game.enemies.forEach((e) => {
    assert.equal(e.state, "waiting");
    assert.isFalse(e.isAttacking);
  });
});
