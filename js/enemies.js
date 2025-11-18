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
    const [startPoint] = path;

    return {
        id,
        x: startPoint.x,
        y: startPoint.y,
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

function generateEntryPath(finalX, finalY, fromLeft, columnIndex) {
    if (!canvasRef) return [];
    const horizontalBias = canvasRef.width * 0.15 + (columnIndex % 3) * 20;
    const startX = fromLeft ? -80 : canvasRef.width + 80;
    const midX = fromLeft ? horizontalBias : canvasRef.width - horizontalBias;
    const midY = canvasRef.height * 0.3;
    const loopY = canvasRef.height * 0.55;
    const turnX = canvasRef.width / 2 + (fromLeft ? -90 : 90);

    return [
        { x: startX, y: canvasRef.height * 0.8 },
        { x: midX, y: midY },
        { x: turnX, y: loopY },
        { x: turnX, y: finalY - 40 },
        { x: finalX, y: finalY }
    ];
}

function advanceEnemyAlongPath(enemy, delta) {
    let remaining = enemy.enterSpeed * delta;

    while (remaining > 0 && enemy.pathIndex < enemy.path.length - 1) {
        const currentTarget = enemy.path[enemy.pathIndex + 1];
        const dx = currentTarget.x - enemy.x;
        const dy = currentTarget.y - enemy.y;
        const distance = Math.hypot(dx, dy);

        if (distance <= remaining) {
            enemy.x = currentTarget.x;
            enemy.y = currentTarget.y;
            enemy.pathIndex += 1;
            remaining -= distance;
        } else {
            const ratio = remaining / distance;
            enemy.x += dx * ratio;
            enemy.y += dy * ratio;
            remaining = 0;
        }
    }

    if (enemy.pathIndex >= enemy.path.length - 1) {
        enemy.state = 'formation';
        enemy.x = enemy.finalX;
        enemy.y = enemy.finalY;
    }
}

function moveEnemyInFormation(enemy, delta) {
    enemy.oscillationPhase += delta * 2;
    enemy.x = enemy.finalX + Math.sin(enemy.oscillationPhase + enemy.waveOffset) * 12;
    enemy.y = enemy.finalY + Math.sin(enemy.oscillationPhase * 0.5 + enemy.waveOffset) * 6;
}

function killEnemy(enemy) {
    if (enemy.state === 'dying') return;
    enemy.state = 'dying';
    enemy.dyingTimer = 0.3;
}

export function updateEnemies(game, delta) {
    if (!game.enemies.length) {
        if (game.pendingWaveTimer > 0) {
            game.pendingWaveTimer -= delta;
            if (game.pendingWaveTimer <= 0) {
                spawnEnemyWave(game);
            }
        }
        return;
    }

    const alive = [];
    for (const enemy of game.enemies) {
        if (enemy.state === 'waiting') {
            enemy.entryDelay -= delta;
            if (enemy.entryDelay <= 0) {
                enemy.state = 'entering';
            }
        } else if (enemy.state === 'entering') {
            advanceEnemyAlongPath(enemy, delta);
        } else if (enemy.state === 'formation') {
            moveEnemyInFormation(enemy, delta);
        } else if (enemy.state === 'dying') {
            enemy.dyingTimer -= delta;
        }

        if (enemy.state !== 'dying' || enemy.dyingTimer > 0) {
            alive.push(enemy);
        }
    }

    game.enemies = alive;

    if (!game.enemies.length) {
        game.pendingWaveTimer = 2;
    }
}

function getEnemyHitbox(enemy) {
    const width = enemy.size * 1.7;
    const height = enemy.size * 1.3;
    return {
        x: enemy.x - width / 2,
        y: enemy.y - height / 2,
        width,
        height
    };
}

function getLaserHitbox(shot) {
    if (!shot || !canvasRef) return null;
    if (shot.hitbox) {
        const { x, y, width, height } = shot.hitbox;
        return { x, y, width, height };
    }

    if (typeof shot.x === 'number' && typeof shot.y === 'number') {
        const width = shot.width ?? 6;
        const height = shot.height ?? canvasRef.height;
        const direction = shot.direction ?? -1;
        const topY = direction < 0 ? shot.y - height : shot.y;
        return {
            x: shot.x - width / 2,
            y: topY,
            width,
            height
        };
    }

    return null;
}

function boxesOverlap(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

export function checkEnemyCollisions(game) {
    if (!game.playerShots.length || !game.enemies.length) return;

    for (const shot of game.playerShots) {
        if (!shot || shot.active === false) continue;

        const shotBox = getLaserHitbox(shot);
        if (!shotBox) continue;

        for (const enemy of game.enemies) {
            if (enemy.state === 'dying') continue;
            const enemyBox = getEnemyHitbox(enemy);
            if (boxesOverlap(shotBox, enemyBox)) {
                killEnemy(enemy);
                if (typeof shot.onHit === 'function') {
                    shot.onHit(enemy);
                }
                if (!shot.pierces) {
                    shot.active = false;
                }
                break;
            }
        }
    }

    game.playerShots = game.playerShots.filter((shot) => shot && shot.active !== false);
}

export function drawEnemies(enemies) {
    if (!ctxRef) return;

    for (const enemy of enemies) {
        ctxRef.save();
        ctxRef.translate(enemy.x, enemy.y);

        if (enemy.state === 'dying') {
            const progress = Math.max(enemy.dyingTimer / 0.3, 0);
            ctxRef.globalAlpha = progress;
            ctxRef.fillStyle = '#fef08a';
            ctxRef.beginPath();
            ctxRef.arc(0, 0, enemy.size * (1.5 - progress), 0, Math.PI * 2);
            ctxRef.fill();
            ctxRef.restore();
            continue;
        }

        ctxRef.fillStyle = enemy.color;
        ctxRef.beginPath();
        ctxRef.moveTo(0, -enemy.size * 0.8);
        ctxRef.lineTo(enemy.size, enemy.size * 0.9);
        ctxRef.lineTo(-enemy.size, enemy.size * 0.9);
        ctxRef.closePath();
        ctxRef.fill();

        ctxRef.fillStyle = '#ffffff';
        ctxRef.fillRect(-enemy.size * 0.4, 0, enemy.size * 0.3, 3);
        ctxRef.fillRect(enemy.size * 0.1, 0, enemy.size * 0.3, 3);
        ctxRef.restore();
    }
}
