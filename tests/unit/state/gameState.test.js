import { test, assert } from 'vitest';
import {
  createInitialGame,
  handleEnemyKilled,
  handlePlayerHit,
  updateInvincibility,
} from '../../../js/state/gameState.js';

test('createInitialGame sets correct default values', () => {
  const game = createInitialGame();

  assert.equal(game.score, 0);
  assert.equal(game.lives, 3);
  assert.equal(game.level, 1);
  assert.equal(game.tripleShotTimer, 0);
  assert.isFalse(game.gameOver);
  assert.equal(game.invincibilityTimer, 0);
  assert.isFalse(game.paused);
  assert.equal(game.difficulty, 'medium'); // default from localStorage or fallback
});

test('handleEnemyKilled increases score by 100', () => {
  const game = createInitialGame();
  game.score = 500;

  handleEnemyKilled(game, { x: 400, y: 100 });

  assert.equal(game.score, 600);
});

test('handlePlayerHit reduces lives and sets invincibility', () => {
  const game = createInitialGame();
  game.lives = 3;
  game.invincibilityTimer = 0;

  const hit = handlePlayerHit(game);

  assert.isTrue(hit);
  assert.equal(game.lives, 2);
  assert.closeTo(game.invincibilityTimer, 1.0, 0.01);
});

test('handlePlayerHit during invincibility does nothing', () => {
  const game = createInitialGame();
  game.lives = 2;
  game.invincibilityTimer = 0.5;

  const hit = handlePlayerHit(game);

  assert.isFalse(hit);
  assert.equal(game.lives, 2); // no change
});

test('handlePlayerHit with 1 life triggers gameOver', () => {
  const game = createInitialGame();
  game.lives = 1;
  game.invincibilityTimer = 0;

  handlePlayerHit(game);

  assert.isTrue(game.gameOver);
  assert.equal(game.lives, 0);
});

test('updateInvincibility decreases timer and stops at 0', () => {
  const game = { invincibilityTimer: 1.0 };

  updateInvincibility(game, 0.3);
  assert.closeTo(game.invincibilityTimer, 0.7, 0.01);

  updateInvincibility(game, 1.0);
  assert.equal(game.invincibilityTimer, 0);
});

test('game starts with correct difficulty from localStorage', () => {
  localStorage.setItem('gameDifficulty', 'hard');
  const game = createInitialGame();
  assert.equal(game.difficulty, 'hard');

  localStorage.removeItem('gameDifficulty');
  const game2 = createInitialGame();
  assert.equal(game2.difficulty, 'medium'); // fallback
});
