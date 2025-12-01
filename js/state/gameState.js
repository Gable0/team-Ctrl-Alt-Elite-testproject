import { getActiveSkin } from '../skins/skinsManager.js'; // FIXED: Relative path from js/state/

export function createInitialGame() {
    const difficulty = localStorage.getItem('gameDifficulty') || 'medium';
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
}

export function handlePlayerHit(game) {
    if (game.invincibilityTimer > 0) return false;

    game.lives--;
    game.invincibilityTimer = 1.0;

    if (game.lives <= 0) {
        game.gameOver = true;
        localStorage.setItem('finalScore', game.score);
        localStorage.setItem('finalLevel', game.level);
        window.location.href = 'Demos/Score_UI/index.html';
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