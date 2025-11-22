import { initEnemyModule, spawnEnemyWave, updateEnemies, drawEnemies, killEnemy } from './enemies.js';
import { checkPlayerShotCollisions } from './collisions.js';
import { checkPlayerEnemyCollision } from './enemy-collision/playerCollision.js';
import { initEnemyAttack, scheduleEnemyAttacks, updateAttackingEnemy } from './enemy-collision/enemyAttack.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const barrierY = canvas.height * 0.75;

initEnemyModule(canvas, ctx);
initEnemyAttack(canvas);

const Game = {
    player: createPlayer(),
    enemies: [],
    playerShots: [],
    enemyShots: [],
    lastTime: 0,
    pendingWaveTimer: 0,
    attackTimer: { current: 3 }
};

const keys = new Set();
window.addEventListener('keydown', (event) => keys.add(event.code));
window.addEventListener('keyup', (event) => keys.delete(event.code));

function createPlayer() {
    return {
        x: canvas.width / 2,
        y: canvas.height * 0.75,
        size: 20,
        speed: 220
    };
}

function updatePlayer(delta) {
    const player = Game.player;
    if (!player) return;

    if (keys.has('ArrowLeft') || keys.has('KeyA')) player.x -= player.speed * delta;
    if (keys.has('ArrowRight') || keys.has('KeyD')) player.x += player.speed * delta;
    if (keys.has('ArrowUp') || keys.has('KeyW')) player.y -= player.speed * delta;
    if (keys.has('ArrowDown') || keys.has('KeyS')) player.y += player.speed * delta;

    const margin = player.size;
    player.x = Math.max(margin, Math.min(canvas.width - margin, player.x));
    player.y = Math.max(barrierY + margin, Math.min(canvas.height - margin, player.y));
}

function updatePlayerShots(delta) {
    Game.playerShots = Game.playerShots.filter((shot) => {
        if (!shot || shot.active === false) return false;
        if (typeof shot.update === 'function') {
            shot.update(delta);
        }
        return true;
    });
}

function updateEnemyShots(delta) {}

function drawPlayer() {
    const player = Game.player;
    if (!player) return;
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.fillStyle = '#5eead4';
    ctx.beginPath();
    ctx.moveTo(0, -player.size);
    ctx.lineTo(player.size * 0.6, player.size);
    ctx.lineTo(-player.size * 0.6, player.size);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawPlayerShots() {}
function drawEnemyShots() {}
function drawHUD() {}

function update(delta) {
    updatePlayer(delta);
    updateEnemies(Game, delta);
    updatePlayerShots(delta);
    updateEnemyShots(delta);
    
    // Schedule and update enemy attacks
    Game.attackTimer = scheduleEnemyAttacks(Game.enemies, Game.player, delta, Game.attackTimer);
    
    // Update attacking enemies
    for (const enemy of Game.enemies) {
        if (enemy.state === 'attacking') {
            updateAttackingEnemy(enemy, delta);
        }
    }
    
    // Check player shot collisions with enemies
    checkPlayerShotCollisions(Game, canvas.height, (enemy) => {
        killEnemy(enemy);
        console.log('Enemy destroyed by shot!');
    });
    
    // Check player-enemy collision (including attacking enemies)
    checkPlayerEnemyCollision(Game, (enemy) => {
        killEnemy(enemy);
        console.log('Player hit by enemy!');
        // Add your damage/death logic here
        // For example:
        // Game.player.lives -= 1;
        // if (Game.player.lives <= 0) { gameOver(); }
    });
}

function draw() {
    ctx.fillStyle = '#010101';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawEnemies(Game.enemies);
    drawEnemyShots();
    drawPlayerShots();
    drawPlayer();
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