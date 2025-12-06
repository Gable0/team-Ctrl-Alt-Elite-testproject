import { getActiveSkin } from '../skins/skinsManager.js';
import { audioManager } from '../systems/audioManager.js';

export function createInitialGame() {
    const difficulty = localStorage.getItem('gameDifficulty') || 'medium';
    
    // Play start game sound when game initializes
    setTimeout(() => {
        audioManager.playStartGameSound();
    }, 100);
    
    return {
        player: null,
        enemies: [],
        playerShots: [],
        enemyShots: [],
        powerUps: [],
        coins: [],
        // persisted coin total across sessions
        coinCount: Number(localStorage.getItem('coinCount') || 0),
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

export function handlePlayerHit(game) {
    if (game.invincibilityTimer > 0) return false;

    game.lives--;
    game.invincibilityTimer = 1.0;

    if (game.lives <= 0) {
        game.gameOver = true;

        // Play game over sound
        audioManager.playGameOverSound();

        // Save score and redirect after a delay to let sound play
        try {
            localStorage.setItem('finalScore', String(game.score));
            localStorage.setItem('finalLevel', String(game.level));
            // recentScore will be read by leaderboard page so player can save the run
            localStorage.setItem('recentScore', JSON.stringify({ score: game.score, difficulty: game.difficulty }));
        } catch (e) {
            // ignore storage errors
        }

        setTimeout(() => {
            // Redirect to the leaderboard page (will prompt to save recent run)
            window.location.href = 'leaderboard.html';
        }, 2000); // 2 second delay for game over sound
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