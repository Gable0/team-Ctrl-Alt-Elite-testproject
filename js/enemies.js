const formationConfig = {
    rows: 4,
    columns: 10,
    spacingX: 60,
    spacingY: 45,
    top: 120
};

const enemyTypes = [
    { color: '#facc15', size: 14, enterSpeed: 210 },
    { color: '#fb923c', size: 15, enterSpeed: 205 },
    { color: '#f472b6', size: 16, enterSpeed: 200 },
    { color: '#c084fc', size: 18, enterSpeed: 195 }
];

let canvasRef = null;
let ctxRef = null;

export function initEnemyModule(canvas, ctx) {
    canvasRef = canvas;
    ctxRef = ctx;
}

export function spawnEnemyWave(game) {
    if (!canvasRef) return;

    const { rows, columns, spacingX, spacingY, top } = formationConfig;
    const totalWidth = spacingX * (columns - 1);
    const leftEdge = (canvasRef.width - totalWidth) / 2;

    let index = 0;
    game.enemies = [];
    game.pendingWaveTimer = 0;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const finalX = leftEdge + col * spacingX;
            const finalY = top + row * spacingY;
            const type = enemyTypes[Math.min(row, enemyTypes.length - 1)];
            const fromLeft = (row + col) % 2 === 0;
            const entryDelay = row * 0.25 + col * 0.12;

            game.enemies.push(createEnemy({
                id: index++,
                finalX,
                finalY,
                type,
                fromLeft,
                entryDelay,
                col
            }));
        }
    }
}

function createEnemy({ id, finalX, finalY, type, fromLeft, entryDelay, col }) {
    const path = generateEntryPath(finalX, finalY, fromLeft, col);
    const [start] = path;

    return {
        id,
        x: start.x,
        y: start.y,
        finalX,
        finalY,
        color: type.color,
        size: type.size,
        enterSpeed: type.enterSpeed,
        state: 'waiting',
        entryDelay,
        path,
        pathIndex: 0,
        oscillationPhase: Math.random() * Math.PI * 2,
        waveOffset: col * 0.4,
        dyingTimer: 0
    };
}

function generateEntryPath(finalX, finalY, fromLeft, colIdx) {
    if (!canvasRef) return [];
    const bias = canvasRef.width * 0.15 + (colIdx % 3) * 20;
    const startX = fromLeft ? -100 : canvasRef.width + 100;
    const midX = fromLeft ? bias : canvasRef.width - bias;

    return [
        { x: startX, y: canvasRef.height * 0.8 },
        { x: midX, y: canvasRef.height * 0.3 },
        { x: canvasRef.width / 2 + (fromLeft ? -120 : 120), y: canvasRef.height * 0.55 },
        { x: finalX, y: finalY }
    ];
}

function advanceEnemyAlongPath(enemy, delta) {
    let dist = enemy.enterSpeed * delta;
    while (dist > 0 && enemy.pathIndex < enemy.path.length - 1) {
        const target = enemy.path[enemy.pathIndex + 1];
        const dx = target.x - enemy.x;
        const dy = target.y - enemy.y;
        const len = Math.hypot(dx, dy);

        if (len <= dist) {
            enemy.x = target.x;
            enemy.y = target.y;
            enemy.pathIndex++;
            dist -= len;
        } else {
            enemy.x += (dx / len) * dist;
            enemy.y += (dy / len) * dist;
            dist = 0;
        }
    }

    if (enemy.pathIndex >= enemy.path.length - 1) {
        enemy.state = 'formation';
        enemy.x = enemy.finalX;
        enemy.y = enemy.finalY;
    }
}

function moveEnemyInFormation(enemy, delta) {
    enemy.oscillationPhase += delta * 2.2;
    enemy.x = enemy.finalX + Math.sin(enemy.oscillationPhase + enemy.waveOffset) * 14;
    enemy.y = enemy.finalY + Math.sin(enemy.oscillationPhase * 0.6) * 7;
}

export function updateEnemies(game, delta) {
    if (!game.enemies.length) {
        if (game.pendingWaveTimer > 0) {
            game.pendingWaveTimer -= delta;
            if (game.pendingWaveTimer <= 0) spawnEnemyWave(game);
        }
        return;
    }

    const alive = [];
    for (const e of game.enemies) {
        if (e.state === 'waiting') {
            e.entryDelay -= delta;
            if (e.entryDelay <= 0) e.state = 'entering';
        } else if (e.state === 'entering') {
            advanceEnemyAlongPath(e, delta);
        } else if (e.state === 'formation') {
            moveEnemyInFormation(e, delta);
        } else if (e.state === 'dying') {
            e.dyingTimer -= delta;
        }

        if (e.state !== 'dying' || e.dyingTimer > 0) alive.push(e);
    }

    game.enemies = alive;

    if (!game.enemies.length) {
        game.pendingWaveTimer = 2;
    }
}

export function drawEnemies(enemies) {
    if (!ctxRef) return;

    for (const e of enemies) {
        ctxRef.save();
        ctxRef.translate(e.x, e.y);

        if (e.state === 'dying') {
            const alpha = e.dyingTimer / 0.3;
            ctxRef.globalAlpha = alpha;
            ctxRef.fillStyle = '#fef08a';
            ctxRef.shadowBlur = 30;
            ctxRef.shadowColor = '#fef08a';
            ctxRef.beginPath();
            ctxRef.arc(0, 0, e.size * (1 + (1 - alpha) * 2), 0, Math.PI * 2);
            ctxRef.fill();
            ctxRef.shadowBlur = 0;
        } else {
            ctxRef.fillStyle = e.color;
            ctxRef.shadowBlur = 10;
            ctxRef.shadowColor = e.color;
            ctxRef.beginPath();
            ctxRef.moveTo(0, -e.size * 0.8);
            ctxRef.lineTo(e.size, e.size * 0.9);
            ctxRef.lineTo(-e.size, e.size * 0.9);
            ctxRef.closePath();
            ctxRef.fill();

            ctxRef.fillStyle = '#ffffff';
            ctxRef.fillRect(-e.size * 0.4, -2, e.size * 0.3, 4);
            ctxRef.fillRect(e.size * 0.1, -2, e.size * 0.3, 4);
            ctxRef.shadowBlur = 0;
        }
        ctxRef.restore();
    }
}