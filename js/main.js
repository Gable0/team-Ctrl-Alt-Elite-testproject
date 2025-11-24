// js/main.js - Step 1: Extract only shooting module
import { initEnemyModule, spawnEnemyWave, updateEnemies, drawEnemies, killEnemy } from './enemies.js';
import { checkPlayerShotCollisions, checkEnemyShotCollisions, checkPlayerEnemyCollision } from './collision.js';
import { initEnemyAttack, scheduleEnemyAttacks, updateAttackingEnemy } from './enemy-collision/enemyAttack.js';
import { 
    initShooting, 
    updatePlayerShots, 
    updateEnemyShots, 
    drawPlayerShots, 
    drawEnemyShots,
    createPlayerShot 
} from './shooting.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const barrierY = canvas.height * 0.75;

initEnemyModule(canvas, ctx);
initEnemyAttack(canvas);
initShooting(canvas);

const Game = {
    player: createPlayer(),
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
    gameOver: false,
    invincibilityTimer: 0  // NEW: Invincibility after getting hit
};

const keys = new Set();
window.addEventListener('keydown', (e) => keys.add(e.code));
window.addEventListener('keyup', (e) => keys.delete(e.code));

function createPlayer() {
    return {
        x: canvas.width / 2,
        y: canvas.height * 0.75,
        size: 20,
        speed: 220
    };
}

function updatePlayer(delta) {
    const p = Game.player;
    if (!p) return;

    if (keys.has('ArrowLeft') || keys.has('KeyA')) p.x -= p.speed * delta;
    if (keys.has('ArrowRight') || keys.has('KeyD')) p.x += p.speed * delta;
    if (keys.has('ArrowUp') || keys.has('KeyW')) p.y -= p.speed * delta;
    if (keys.has('ArrowDown') || keys.has('KeyS')) p.y += p.speed * delta;

    p.x = Math.max(p.size, Math.min(canvas.width - p.size, p.x));
    p.y = Math.max(barrierY + p.size, Math.min(canvas.height - p.size, p.y));

    if (keys.has('Space') && Game.canShoot) {
        Game.playerShots.push(createPlayerShot(p.x, p.y - p.size));
        Game.canShoot = false;
        setTimeout(() => Game.canShoot = true, 170);
    }
}

function drawPlayer() {
    const p = Game.player;
    if (!p) return;
    ctx.save();
    ctx.translate(p.x, p.y);
    
    // Flash when invincible
    if (Game.invincibilityTimer > 0) {
        const flash = Math.floor(Game.invincibilityTimer * 10) % 2;
        if (flash === 0) {
            ctx.globalAlpha = 0.3;
        }
    }
    
    ctx.fillStyle = '#5eead4';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#5eead4';
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.lineTo(p.size * 0.7, p.size * 0.8);
    ctx.lineTo(0, p.size * 0.4);
    ctx.lineTo(-p.size * 0.7, p.size * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
}

function onEnemyKilled() {
    Game.score += 100;
}

function onPlayerHit() {
    // Ignore hits if player is invincible
    if (Game.invincibilityTimer > 0) return;
    
    Game.lives--;
    Game.invincibilityTimer = 1.0; // 2 seconds of invincibility
    
    if (Game.lives <= 0) {
        Game.gameOver = true;
        localStorage.setItem('finalScore', Game.score);
        localStorage.setItem('finalLevel', Game.level);
        window.location.href = 'Demos/Score_UI/index.html';
    }
}

function startNextLevel() {
    Game.level++;
    Game.showingLevelTransition = true;
    Game.levelTransitionTimer = 2.0;
    Game.enemyShots = [];
    
    setTimeout(() => {
        spawnEnemyWave(Game);
    }, 2000);
}

function drawHUD() {
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px monospace';
    ctx.fillText(`Score: ${Game.score}`, 20, 50);
    ctx.fillText(`Level: ${Game.level}`, 20, 80);
    ctx.fillText(`Lives: ${Game.lives}`, canvas.width - 160, 50);
}

function drawLevelTransition() {
    ctx.fillStyle = 'rgba(0, 8, 20, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
    ctx.shadowBlur = 30 * pulse;
    ctx.shadowColor = '#00ffff';
    
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 72px monospace';
    ctx.fillText(`LEVEL ${Game.level}`, canvas.width / 2, canvas.height / 2 - 40);
    
    ctx.shadowBlur = 15;
    ctx.font = '32px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('GET READY!', canvas.width / 2, canvas.height / 2 + 40);
    
    ctx.restore();
}

function update(delta) {
    if (Game.gameOver) return;
    
    // Update invincibility timer
    if (Game.invincibilityTimer > 0) {
        Game.invincibilityTimer -= delta;
    }
    
    if (Game.showingLevelTransition) {
        Game.levelTransitionTimer -= delta;
        if (Game.levelTransitionTimer <= 0) {
            Game.showingLevelTransition = false;
        }
        return;
    }
    
    updatePlayer(delta);
    updateEnemies(Game, delta);
    updatePlayerShots(Game, delta); // FROM MODULE
    updateEnemyShots(Game, delta); // FROM MODULE
    
    Game.attackTimer = scheduleEnemyAttacks(Game.enemies, Game.player, delta, Game.attackTimer);
    for (const enemy of Game.enemies) {
        if (enemy.state === 'attacking') {
            updateAttackingEnemy(enemy, delta);
        }
    }
    
    checkPlayerShotCollisions(Game, (enemy) => {
        killEnemy(enemy);
        onEnemyKilled();
    });
    
    // Only check collisions if not invincible
    if (Game.invincibilityTimer <= 0) {
        checkEnemyShotCollisions(Game, () => {
            onPlayerHit();
        });
        
        checkPlayerEnemyCollision(Game, (enemy) => {
            killEnemy(enemy);
            onPlayerHit();
        });
    }
    
    if (Game.enemies.length === 0 && !Game.showingLevelTransition) {
        if (Game.pendingWaveTimer > 0) {
            Game.pendingWaveTimer -= delta;
            if (Game.pendingWaveTimer <= 0) {
                startNextLevel();
            }
        } else {
            Game.pendingWaveTimer = 1.5;
        }
    }
}

function draw() {
    ctx.fillStyle = '#000814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (Game.showingLevelTransition) {
        drawPlayer();
        drawLevelTransition();
    } else {
        drawEnemies(Game.enemies);
        drawEnemyShots(ctx, Game.enemyShots); // FROM MODULE
        drawPlayerShots(ctx, Game.playerShots); // FROM MODULE
        drawPlayer();
    }
    
    drawHUD();
}

function loop(timestamp) {
    const delta = (timestamp - Game.lastTime) / 1000 || 0;
    Game.lastTime = timestamp;
    update(delta);
    draw();
    requestAnimationFrame(loop);
}

function start() {
    Game.lastTime = performance.now();
    requestAnimationFrame(loop);
}

spawnEnemyWave(Game);
start();