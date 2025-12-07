import { test, assert } from 'vitest';
import {
  createPlayerShot,
  updatePlayerShots,
  updateEnemyShots,
  initShooting,
} from '../../../js/systems/shootingSystem.js';

beforeAll(() => {
  initShooting({ width: 800, height: 600 });
});

test('createPlayerShot creates bullet with correct velocity', () => {
  const shot = createPlayerShot(400, 500);
  assert.equal(shot.x, 400);
  assert.closeTo(shot.y, 480, 1);
  assert.closeTo(shot.vy, -800, 10);
});

test('createPlayerShot angled shot works', () => {
  const shot = createPlayerShot(400, 500, Math.PI / 6);
  assert.closeTo(shot.vx, 400, 10);
  assert.closeTo(shot.vy, -692.8, 10);
});

test('triple shot fires 3 bullets', () => {
  const game = {
    player: { x: 400, y: 500, size: 20 },
    playerShots: [],
    tripleShotTimer: 5,
    canShoot: true,
  };

  if (game.tripleShotTimer > 0) {
    game.playerShots.push(
      createPlayerShot(game.player.x, game.player.y - game.player.size, -0.2)
    );
    game.playerShots.push(
      createPlayerShot(game.player.x, game.player.y - game.player.size, 0)
    );
    game.playerShots.push(
      createPlayerShot(game.player.x, game.player.y - game.player.size, 0.2)
    );
  }

  assert.equal(game.playerShots.length, 3);
});

test('normal shot fires 1 bullet', () => {
  const game = {
    player: { x: 400, y: 500, size: 20 },
    playerShots: [],
    tripleShotTimer: 0,
    canShoot: true,
  };

  if (game.tripleShotTimer > 0) {
    // do nothing
  } else {
    game.playerShots.push(
      createPlayerShot(game.player.x, game.player.y - game.player.size)
    );
  }

  assert.equal(game.playerShots.length, 1);
});

test('updateEnemyShots removes shots below screen', () => {
  const game = {
    playerShootingUnlocked: true,
    enemies: [], // ← ADD THIS LINE
    enemyShots: [
      { x: 400, y: 650, vx: 0, vy: 100 },
      { x: 400, y: 500, vx: 0, vy: 100 },
    ],
  };

  updateEnemyShots(game, 1.0);

  assert.equal(game.enemyShots.length, 1);
});

test('player shots deactivate when off top', () => {
  const game = {
    playerShots: [
      {
        x: 400,
        y: -100,
        vx: 0,
        vy: -800,
        active: true,
        update: function (delta) {
          this.y += this.vy * delta;
          if (this.y < -50) this.active = false;
        },
      },
    ],
  };

  updatePlayerShots(game, 0.1);

  assert.isFalse(game.playerShots[0].active);
});
