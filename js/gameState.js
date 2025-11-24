// js/gameState.js
let canvasRef = null;
let ctxRef = null;

export function initGameState(canvas, ctx) {
    canvasRef = canvas;
    ctxRef = ctx;
}

export function createGameState() {
    return {
        player: null,
        enemies: [],
        playerShots: [],
        enemyShots: [],
        lastTime: 0,
        attackTimer: { current: 3 },
        globalEnemyShotTimer: 0,
        canShoot: true,
        score: 0,
        lives: 3,
        level: 1,
        pendingWaveTimer: 0,
        showingLevelTransition: false,
        levelTransitionTimer: 0,
        baseFireRateDelay: 1.2,
        baseFireRateVariance: 0.8,
        gameOver: false
    };
}

export function onEnemyKilled(game) {
    game.score += 100;
}

export function onPlayerHit(game) {
    game.lives--;
    if (game.lives <= 0) {
        game.gameOver = true;
        localStorage.setItem('finalScore', game.score);
        localStorage.setItem('finalLevel', game.level);
        window.location.href = 'Demos/Score UI/index.html';
    }
}

export function startNextLevel(game, spawnWaveCallback) {
    game.level++;
    game.showingLevelTransition = true;
    game.levelTransitionTimer = 2.0;
    game.enemyShots = [];
    
    setTimeout(() => {
        if (typeof spawnWaveCallback === 'function') {
            spawnWaveCallback(game);
        }
    }, 2000);
}

export function checkLevelProgression(game, delta, spawnWaveCallback) {
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

export function drawHUD(game) {
    if (!ctxRef || !canvasRef) return;
    
    ctxRef.fillStyle = '#ffffff';
    ctxRef.font = '24px monospace';
    ctxRef.fillText(`Score: ${game.score}`, 20, 50);
    ctxRef.fillText(`Level: ${game.level}`, 20, 80);
    ctxRef.fillText(`Lives: ${game.lives}`, canvasRef.width - 160, 50);
}

export function drawLevelTransition(game) {
    if (!ctxRef || !canvasRef) return;
    
    ctxRef.fillStyle = 'rgba(0, 8, 20, 0.85)';
    ctxRef.fillRect(0, 0, canvasRef.width, canvasRef.height);
    
    ctxRef.save();
    ctxRef.textAlign = 'center';
    ctxRef.textBaseline = 'middle';
    
    const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
    ctxRef.shadowBlur = 30 * pulse;
    ctxRef.shadowColor = '#00ffff';
    
    ctxRef.fillStyle = '#00ffff';
    ctxRef.font = 'bold 72px monospace';
    ctxRef.fillText(`LEVEL ${game.level}`, canvasRef.width / 2, canvasRef.height / 2 - 40);
    
    ctxRef.shadowBlur = 15;
    ctxRef.font = '32px monospace';
    ctxRef.fillStyle = '#ffffff';
    ctxRef.fillText('GET READY!', canvasRef.width / 2, canvasRef.height / 2 + 40);
    
    ctxRef.restore();
}

export function updateLevelTransition(game, delta) {
    if (game.showingLevelTransition) {
        game.levelTransitionTimer -= delta;
        if (game.levelTransitionTimer <= 0) {
            game.showingLevelTransition = false;
        }
        return true; 
    }
    return false; 
}