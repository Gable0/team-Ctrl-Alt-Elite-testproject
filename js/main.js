const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const barrierY = canvas.height * 0.75;

const Game = {
    player: createPlayer(),
    enemies: [],
    playerShots: [],
    enemyShots: [],
    lastTime: 0
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

function updateEnemies(delta) {}
function updatePlayerShots(delta) {}
function updateEnemyShots(delta) {}
function checkCollisions() {}

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

function drawEnemies(){}
function drawPlayerShots() {}
function drawEnemyShots() {}
function drawHUD() {}

function update(delta) {
    updatePlayer(delta);
    updateEnemies(delta);
    updatePlayerShots(delta);
    updateEnemyShots(delta);
    checkCollisions(delta);
}

function draw() {
    ctx.fillStyle = '#010101';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawEnemies();
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

start();
