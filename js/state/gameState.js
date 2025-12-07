import { getActiveSkin } from '../skins/skinsManager.js';
import { audioManager } from '../systems/audioManager.js';
import { persistentAudio } from '../core/persistentAudio.js';

export function createInitialGame() {
    const difficulty = localStorage.getItem('gameDifficulty') || 'medium';
    
    // IMMEDIATELY stop intro music before anything else
    console.log('🎮 Game starting - stopping intro music');
    persistentAudio.stop();
    
    // Then play start-game sound after a tiny delay
    setTimeout(() => {
        audioManager.playStartGameSound();
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
        enemiesFullySetup: false // Track when enemies are ready
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
        localStorage.setItem('finalScore', game.score);
        localStorage.setItem('finalLevel', game.level);
        
        setTimeout(() => {
            window.location.href = 'Demos/Score_UI/index.html';
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
    game.enemiesFullySetup = false;

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

// Check if all enemies are fully set up (in formation)
export function checkEnemiesFullySetup(game) {
    if (game.enemiesFullySetup) return; // Already marked as setup
    
    if (game.enemies.length === 0) return; // No enemies yet
    
    // Check if all enemies are in formation (not waiting or entering)
    const allInFormation = game.enemies.every(enemy => 
        enemy.state === 'formation' || enemy.state === 'attacking' || enemy.state === 'dying'
    );
    
    if (allInFormation && !game.enemiesFullySetup) {
        game.enemiesFullySetup = true;
        
        // Start background game music after enemies are set up
        import('../systems/audioManager.js').then(module => {
            module.playBackgroundGameMusic();
        });
        
        console.log('✅ All enemies set up, starting background game music');
    }
}