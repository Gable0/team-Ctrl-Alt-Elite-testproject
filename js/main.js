import {
    initEnemyModule,
    spawnEnemyWave,
    updateEnemies,
    drawEnemies
} from './enemies.js';

import {
    checkPlayerShotCollisions,
    checkEnemyShotCollisions,
    checkPlayerEnemyCollision
} from './collision.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const barrierY = canvas.height * 0.75;

initEnemyModule(canvas, ctx);

const Game = {
    player: null,
    enemies: [],
    playerShots: [],
    enemyShots: [],
    lastTime: 0,
    globalEnemyShotTimer: 0,
    canShoot: true,
    score: 0,
    lives: 3
};

const keys = new Set();
window.addEventListener('keydown', e => keys.add(e.code));
window.addEventListener('keyup', e => keys.delete(e.code));

function createPlayer() {
    return {
        x: canvas.width / 2,
        y: canvas.height * 0.75,
        size: 20,
        speed: 220
    };
}
Game.player = createPlayer();

function createPlayerShot(x, y) {
    return {
        x: x,
        y: y - 20,
        speed: 800,
        active: true,
        update(delta) {
            this.y -= this.speed * delta;
            if (this.y < -50) this.active = false;
        }
    };
}

function updatePlayer(delta) {
    const p = Game.player;
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

function updatePlayerShots(delta) {
    for (const s of Game.playerShots) {
        if (s.active !== false) s.update(delta);
    }
}

function fireEnemyShot(enemy) {
    if (Game.enemyShots.length >= 8) return; // Allow more bullets on screen
    const p = Game.player;
    const dx = p.x - enemy.x + (Math.random() * 80 - 40);
    const dy = p.y - enemy.y + (Math.random() * 60 - 30);
    const dist = Math.hypot(dx, dy) || 1;
    const speed = 180;
    Game.enemyShots.push({
        x: enemy.x,
        y: enemy.y + enemy.size,
        vx: (dx / dist) * speed,
        vy: (dy / dist) * speed,
        size: 6
    });
}

function updateEnemyShots(delta) {
    // *** SHOOT 3X MORE OFTEN ***
    Game.globalEnemyShotTimer -= delta;
    if (Game.globalEnemyShotTimer <= 0) {
        const shooters = Game.enemies.filter(e => e.state === 'formation');
        if (shooters.length > 0 && Math.random() < 0.8) { // Increased from 0.3 to 0.8
            const shooter = shooters[Math.floor(Math.random() * shooters.length)];
            fireEnemyShot(shooter);
        }
        Game.globalEnemyShotTimer = Math.random() * 0.8 + 0.4; // Decreased from 2.5+1.2 to 0.8+0.4
    }

    // Diving enemies shoot more too
    for (const e of Game.enemies) {
        if (e.state === 'diving' && Math.random() < 0.08) { // Increased diving shot chance
            fireEnemyShot(e);
        }
    }

    Game.enemyShots = Game.enemyShots.filter(s => {
        s.x += s.vx * delta;
        s.y += s.vy * delta;
        return s.y < canvas.height + 50;
    });
}

function drawPlayer() {
    const p = Game.player;
    ctx.save();
    ctx.translate(p.x, p.y);
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

function drawPlayerShots() {
    ctx.fillStyle = '#00ff99';
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#00ff99';
    for (const s of Game.playerShots) {
        if (s.active !== false) {
            ctx.fillRect(s.x - 2.5, s.y - 13, 5, 26);
        }
    }
    ctx.shadowBlur = 0;
}

function drawEnemyShots() {
    ctx.fillStyle = '#ff5555';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff5555';
    for (const s of Game.enemyShots) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.shadowBlur = 0;
}

function onEnemyKilled() {
    Game.score += 100;
}

function onPlayerHit() {
    Game.lives--;
    if (Game.lives <= 0) {
        alert(`GAME OVER!\nFinal Score: ${Game.score}`);
        location.reload();
    }
}

function update(delta) {
    updatePlayer(delta);
    updateEnemies(Game, delta);
    updatePlayerShots(delta);
    updateEnemyShots(delta);

    checkPlayerShotCollisions(Game, onEnemyKilled);
    checkEnemyShotCollisions(Game, onPlayerHit);
    checkPlayerEnemyCollision(Game, onPlayerHit);
}

function drawHUD() {
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px monospace';
    ctx.fillText(`Score: ${Game.score}`, 20, 50);
    ctx.fillText(`Lives: ${Game.lives}`, canvas.width - 160, 50);
}

function draw() {
    ctx.fillStyle = '#000814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawEnemies(Game.enemies);
    drawEnemyShots();
    drawPlayerShots();
    drawPlayer();
    drawHUD();
}

function loop(timestamp) {
    const delta = (timestamp - Game.lastTime) / 1000;
    Game.lastTime = timestamp;
    update(delta);
    draw();
    requestAnimationFrame(loop);
}

spawnEnemyWave(Game);
requestAnimationFrame(loop);