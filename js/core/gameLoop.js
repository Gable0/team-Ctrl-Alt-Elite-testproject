/**
 * js/core/gameLoop.js
 * Main game loop and orchestration hub. Initializes all systems,
 * runs the update/draw cycle, and coordinates game state.
 */

import {
  initEnemyModule,
  spawnEnemyWave,
  updateEnemies,
  drawEnemies,
} from "../entities/enemyManager.js";
import { createPlayer, updatePlayer, drawPlayer } from "../entities/player.js";
import { initInput } from "./input.js";
import {
  initShooting,
  updatePlayerShots,
  updateEnemyShots,
  drawPlayerShots,
  drawEnemyShots,
  createPlayerShot,
} from "../systems/shootingSystem.js";
import {
  checkPlayerShotCollisions,
  checkEnemyShotCollisions,
} from "../systems/collision/shotCollisions.js";
import { checkPlayerEnemyCollision } from "../systems/collision/entityCollisions.js";
import {
  initEnemyAttack,
  scheduleEnemyAttacks,
  updateAttackingEnemy,
} from "../systems/enemyAttack.js";
import {
  createInitialGame,
  handleEnemyKilled,
  handlePlayerHit,
  handleLevelProgression,
  updateInvincibility,
  updateLevelTransition,
} from "../state/gameState.js";
import { drawHUD, drawLevelTransition } from "../ui/hud.js";
import { initPauseMenu } from "../ui/pauseMenu.js";
import {
  spawnPowerUp,
  updatePowerUps,
  drawPowerUps,
} from "../systems/powerUps.js";
import {
  initBackground,
  updateBackground,
  drawBackground,
} from "./background.js";
import { initAudio } from "../systems/audioManager.js";

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("game");

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

/** Y-position that acts as a movement barrier for the player (75% of canvas height) */
const barrierY = canvas.height * 0.75;

// ---------------------------------------------------------------------
// System initialization
// ---------------------------------------------------------------------
initInput();
initEnemyModule(canvas, ctx);
initEnemyAttack(canvas);
initShooting(canvas);
initBackground(canvas);
initAudio(); // Initialize audio system

/** Global game state object created from gameState.js */
const Game = createInitialGame();
Game.player = createPlayer(canvas);

initPauseMenu(Game);

/**
 * Updates all game logic each frame.
 *
 * @param {number} delta - Time elapsed since the last frame in seconds.
 */
function update(delta) {
  if (Game.gameOver || Game.paused) return;

  updateInvincibility(Game, delta);

  // Level transition screen blocks normal gameplay updates
  if (updateLevelTransition(Game, delta)) {
    return;
  }

  updateBackground(delta, canvas);
  updateEnemies(Game, delta);
  updatePlayer(Game, delta, canvas, barrierY, createPlayerShot);
  updatePlayerShots(Game, delta);
  updateEnemyShots(Game, delta);
  updatePowerUps(Game, delta, canvas);

  // Enemy dive attacks only start after the player can shoot
  if (Game.playerShootingUnlocked) {
    Game.attackTimer = scheduleEnemyAttacks(
      Game.enemies,
      Game.player,
      delta,
      Game.attackTimer,
    );
  }

  // Update any enemies currently performing a dive attack
  for (const enemy of Game.enemies) {
    if (enemy.state === "attacking") {
      updateAttackingEnemy(enemy, delta);
    }
  }

  // Player bullet → enemy collision
  checkPlayerShotCollisions(Game, (enemy) => {
    handleEnemyKilled(Game, enemy);
    spawnPowerUp(Game, enemy);
  });

  // Player can only be hit when not invincible
  if (Game.invincibilityTimer <= 0) {
    // Check enemy laser hits (pass hit type to handlePlayerHit)
    checkEnemyShotCollisions(Game, (hitType) => handlePlayerHit(Game, hitType));
    
    // Check enemy collision (pass hit type to handlePlayerHit)
    checkPlayerEnemyCollision(Game, (hitType) => handlePlayerHit(Game, hitType));
  }

  // Handles wave completion → next level progression
  handleLevelProgression(Game, delta, spawnEnemyWave);
}

/**
 * Renders a single frame to the canvas.
 */
function draw() {
  drawBackground(ctx, canvas);

  if (Game.showingLevelTransition) {
    // Only player and transition text are shown during level change
    drawPlayer(ctx, Game.player, Game.invincibilityTimer, Game);
    drawLevelTransition(ctx, canvas, Game);
  } else {
    drawEnemies(Game.enemies, Game);
    drawEnemyShots(ctx, Game.enemyShots);
    drawPlayerShots(ctx, Game.playerShots);
    drawPowerUps(ctx, Game.powerUps);
    drawPlayer(ctx, Game.player, Game.invincibilityTimer, Game);
  }

  drawHUD(ctx, canvas, Game);
}

/**
 * Main animation loop using requestAnimationFrame.
 *
 * @param {DOMHighResTimeStamp} timestamp - Performance timestamp provided by rAF.
 */
function loop(timestamp) {
  const delta = (timestamp - Game.lastTime) / 1000 || 0;
  Game.lastTime = timestamp;

  update(delta);
  draw();

  requestAnimationFrame(loop);
}

/**
 * Starts the game loop.
 */
function start() {
  Game.lastTime = performance.now();
  requestAnimationFrame(loop);
}

// Begin the game
spawnEnemyWave(Game);
start();

// Expose Game object globally for debugging
window.Game = Game;