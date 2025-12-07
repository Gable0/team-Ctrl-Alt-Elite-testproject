// js/state/gameState.js

import { getActiveSkin } from "../skins/skinsManager.js";
import { audioManager } from "../systems/audioManager.js";
import { persistentAudio } from "../core/persistentAudio.js";

/**
 * Creates and returns a fresh game state object with default values.
 * This is called once when a new game session starts.
 *
 * @returns {Object} The initial game state.
 */
export function createInitialGame() {
  const difficulty = localStorage.getItem("gameDifficulty") || "medium";

  // Play start game sound and begin level music shortly after initialization
  setTimeout(() => {
    audioManager.playStartGameSound();
    // Start level 1 music with fade-in after the start sound
    setTimeout(() => {
      console.log("🎮 Starting Level 1 music with fade-in");
      audioManager.playLevelMusic(1, true); // true = fade in
    }, 1500); // Wait 1.5 seconds for start-game sound to finish
  }, 100);

  return {
    player: null,
    enemies: [],
    playerShots: [],
    enemyShots: [],
    powerUps: [],
    lastTime: 0,
    attackTimer: { current: 3 },
    globalEnemyShotTimer: 0,
    canShoot: false,
    playerShootingUnlocked: false,
    score: 0,
    lives: 3,
    level: 1,
    pendingWaveTimer: 0,
    showingLevelTransition: false,
    levelTransitionTimer: 0,
    baseFireRateDelay: 1.2,
    baseFireRateVariance: 0.8,
    gameOver: false,
    invincibilityTimer: 0,
    paused: false,
    activeSkin: getActiveSkin(),
    difficulty: difficulty,
    tripleShotTimer: 0,
  };
}

/**
 * Called when an enemy is destroyed. Increases score and plays sound effect.
 *
 * @param {Object} game - Global game state.
 * @param {Object} enemy - The enemy that was killed (unused here but kept for consistency).
 * @param {number} [points=100] - Points awarded for killing the enemy.
 */
export function handleEnemyKilled(game, enemy, points = 100) {
  game.score += points;

  // Play kill enemy sound
  audioManager.playKillEnemySound();
}

/**
 * Handles the player taking damage. Reduces lives and triggers invincibility.
 * Ends the game if lives reach zero.
 *
 * @param {Object} game - Global game state.
 * @param {string} [hitType="laser"] - Type of hit: "laser" or "enemy"
 * @returns {boolean} `true` if the player actually took damage, `false` if invincible.
 */
export function handlePlayerHit(game, hitType = "laser") {
  if (game.invincibilityTimer > 0) return false;

  game.lives--;
  game.invincibilityTimer = 1.0;

  // Play appropriate hit sound based on what hit the player
  if (hitType === "enemy") {
    audioManager.playEnemyHitsPlayerSound();
  } else {
    audioManager.playLaserHitsPlayerSound();
  }

  if (game.lives <= 0) {
    game.gameOver = true;

    console.log("💀 Game Over - Playing game over sequence");
    // Play game over sound (which will also start game over background music)
    audioManager.playGameOverSound();

    // Persist final score/level for the results screen
    localStorage.setItem("finalScore", game.score);
    localStorage.setItem("finalLevel", game.level);

    // Redirect to score screen after a short delay (lets sound finish)
    setTimeout(() => {
      window.location.href = "Demos/Score_UI/index.html";
    }, 2000);
  }

  return true;
}

/**
 * Decrements the player's invincibility timer each frame.
 *
 * @param {Object} game - Global game state.
 * @param {number} delta - Time elapsed since last frame (seconds).
 */
export function updateInvincibility(game, delta) {
  if (game.invincibilityTimer > 0) {
    game.invincibilityTimer = Math.max(0, game.invincibilityTimer - delta);
  }
}

/**
 * Begins the transition to the next level.
 *
 * @param {Object} game - Global game state.
 * @param {Function} spawnWaveCallback - Function to spawn the next enemy wave.
 */
export function startNextLevel(game, spawnWaveCallback) {
  game.level++;
  game.showingLevelTransition = true;
  game.levelTransitionTimer = 2.0;
  game.enemyShots = [];
  game.powerUps = [];
  game.tripleShotTimer = 0;
  game.playerShootingUnlocked = false;
  game.canShoot = false;
  game.globalEnemyShotTimer = game.baseFireRateDelay;

  // Play appropriate background music for the new level (no fade on level transitions)
  console.log(`🎮 Advancing to Level ${game.level}`);
  audioManager.playLevelMusic(game.level, false);

  setTimeout(() => {
    if (typeof spawnWaveCallback === "function") {
      spawnWaveCallback(game);
    }
  }, 2000);
}

/**
 * Checks for level completion and manages the delay before starting the next level.
 *
 * @param {Object} game - Global game state.
 * @param {number} delta - Time elapsed since last frame (seconds).
 * @param {Function} spawnWaveCallback - Function to spawn the next enemy wave.
 */
export function handleLevelProgression(game, delta, spawnWaveCallback) {
  if (game.enemies.length === 0 && !game.showingLevelTransition) {
    if (game.pendingWaveTimer > 0) {
      game.pendingWaveTimer -= delta;
      if (game.pendingWaveTimer <= 0) {
        startNextLevel(game, spawnWaveCallback);
      }
    } else {
      game.pendingWaveTimer = 1.5;
    }
  }
}

/**
 * Updates the level transition timer and clears the transition flag when finished.
 *
 * @param {Object} game - Global game state.
 * @param {number} delta - Time elapsed since last frame (seconds).
 * @returns {boolean} `true` while the level transition screen is active.
 */
export function updateLevelTransition(game, delta) {
  if (!game.showingLevelTransition) return false;

  game.levelTransitionTimer -= delta;
  if (game.levelTransitionTimer <= 0) {
    game.showingLevelTransition = false;
  }

  return game.showingLevelTransition;
}