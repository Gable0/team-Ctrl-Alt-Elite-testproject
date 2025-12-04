const formationConfig = {
    rows: 4,
    columns: 10,
    spacingX: 60,
    spacingY: 45,
    top: 120
};

const enemyTypes = [
    { color: '#ff0844', size: 14, enterSpeed: 210 },
    { color: '#ff3366', size: 15, enterSpeed: 205 },
    { color: '#ff5588', size: 16, enterSpeed: 200 },
    { color: '#ff88aa', size: 18, enterSpeed: 195 }
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
    game.playerShootingUnlocked = false;
    game.canShoot = false;
    game.globalEnemyShotTimer = game.baseFireRateDelay;

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
        dyingTimer: 0,
        isAttacking: false,
        attackPath: null,
        attackPathIndex: 0,
        attackSpeed: 0
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

export function killEnemy(enemy) {
    if (enemy.state === 'dying') return;
    enemy.state = 'dying';
    enemy.dyingTimer = 0.3;
    enemy.isAttacking = false;
}

export function updateEnemies(game, delta) {
    if (!game.enemies.length) {
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
        // Note: 'attacking' state is handled by systems/enemyAttack module

        if (enemy.state !== 'dying' || enemy.dyingTimer > 0) {
            alive.push(enemy);
        }
    }

    game.enemies = alive;

    if (!game.playerShootingUnlocked && game.enemies.length > 0) {
        const allEnemiesReady = game.enemies.every(enemy =>
            enemy.state !== 'waiting' && enemy.state !== 'entering'
        );

        if (allEnemiesReady) {
            game.playerShootingUnlocked = true;
            game.canShoot = true;
        }
    }

}

export function drawEnemies(enemies, game) {
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

        // Visual indicator for attacking enemies
        if (enemy.state === 'attacking') {
            ctxRef.fillStyle = '#ff0000';
            ctxRef.globalAlpha = 0.3;
            ctxRef.beginPath();
            ctxRef.arc(0, 0, enemy.size * 1.5, 0, Math.PI * 2);
            ctxRef.fill();
            ctxRef.globalAlpha = 1.0;
        }

        ctxRef.fillStyle = enemy.color;
        if (game.activeSkin === 'squarePack') { // CHANGED: Check activeSkin
            // Square skin
            ctxRef.fillRect(-enemy.size / 2, -enemy.size / 2, enemy.size, enemy.size);
        } else if (game.activeSkin === 'starPack') {
            // Star skin (simple 5-point star)
            const r1 = enemy.size * 0.8;
            const r2 = enemy.size * 0.32;
            ctxRef.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = Math.PI / 2.5 * i * 2;
                ctxRef.lineTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
                ctxRef.lineTo(Math.cos(angle + Math.PI / 5) * r2, Math.sin(angle + Math.PI / 5) * r2);
            }
            ctxRef.closePath();
            ctxRef.fill();
        } else {
            // Original triangle
            ctxRef.beginPath();
            ctxRef.moveTo(0, -enemy.size * 0.8);
            ctxRef.lineTo(enemy.size, enemy.size * 0.9);
            ctxRef.lineTo(-enemy.size, enemy.size * 0.9);
            ctxRef.closePath();
            ctxRef.fill();
        }

        ctxRef.fillStyle = '#ffffff';
        ctxRef.fillRect(-enemy.size * 0.4, 0, enemy.size * 0.3, 3);
        ctxRef.fillRect(enemy.size * 0.1, 0, enemy.size * 0.3, 3);
        ctxRef.restore();
    }
}