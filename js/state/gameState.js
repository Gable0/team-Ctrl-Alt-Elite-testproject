import { getActiveSkin } from '../skins/skinsManager.js';
import { audioManager, playLevelMusic } from '../systems/audioManager.js';
import { persistentAudio } from '../core/persistentAudio.js';

export function createInitialGame() {
    const difficulty = localStorage.getItem('gameDifficulty') || 'medium';
    
    // Stop the intro audio when game starts
    persistentAudio.stop();
    
    // Play start game sound, then background music for level 1
    setTimeout(() => {
        audioManager.playStartGameSound();
        
        // Start background music after start sound plays
        setTimeout(() => {
            playLevelMusic(1); // Start with level 1 music
        }, 2000);
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
        tripleShotTimer: 0
    };
}

export function handleEnemyKilled(game, enemy, points = 100) {
  game.score += points;

  // Play kill enemy sound
  audioManager.playKillEnemySound();
}

export function handlePlayerHit(game, hitType = 'ball') {
  if (game.invincibilityTimer > 0) return false;

  game.lives--;
  game.invincibilityTimer = 1.0;

  // Play appropriate sound based on hit type
  if (hitType === 'enemy') {
    audioManager.playEnemyHitsPlayerSound();
  } else {
    audioManager.playBallHitsPlayerSound();
  }

  if (game.lives <= 0) {
    game.gameOver = true;

    // Save score immediately
    localStorage.setItem('finalScore', game.score);
    localStorage.setItem('finalLevel', game.level);
    
    // Set flag for score screen to play game over sequence
    localStorage.setItem('playGameOverSound', 'true');

    // Redirect to score screen immediately
    // The score screen will handle playing game-over-background then game-over sound
    setTimeout(() => {
      window.location.href = 'Demos/Score_UI/index.html';
    }, 500); // Small delay so player can see they died
  }

  return true;
}

export function updateInvincibility(game, delta) {
  if (game.invincibilityTimer > 0) {
    game.invincibilityTimer = Math.max(0, game.invincibilityTimer - delta);
  }
}

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

    // Change music based on new level
    // Level 3: switch from 1-2 music to 3-4 music
    // Level 5: switch from 3-4 music to 5 music
    if (game.level === 3 || game.level === 5) {
        playLevelMusic(game.level);
    }

  setTimeout(() => {
    if (typeof spawnWaveCallback === 'function') {
      spawnWaveCallback(game);
    }
  }, 2000);
}

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

export function updateLevelTransition(game, delta) {
  if (!game.showingLevelTransition) return false;

  game.levelTransitionTimer -= delta;
  if (game.levelTransitionTimer <= 0) {
    game.showingLevelTransition = false;
  }

  return game.showingLevelTransition;
}