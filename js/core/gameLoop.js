import { initEnemyModule, spawnEnemyWave, updateEnemies, drawEnemies } from '../entities/enemyManager.js';
import { createPlayer, updatePlayer, drawPlayer } from '../entities/player.js';
import { initInput } from './input.js';
import { 
    initShooting,
    updatePlayerShots,
    updateEnemyShots,
    drawPlayerShots,
    drawEnemyShots,
    createPlayerShot
} from '../systems/shootingSystem.js';
import { checkPlayerShotCollisions, checkEnemyShotCollisions } from '../systems/collision/shotCollisions.js';
import { checkPlayerEnemyCollision } from '../systems/collision/entityCollisions.js';
import { initEnemyAttack, scheduleEnemyAttacks, updateAttackingEnemy } from '../systems/enemyAttack.js';
import {
    createInitialGame,
    handleEnemyKilled,
    handlePlayerHit,
    handleLevelProgression,
    updateInvincibility,
    updateLevelTransition
} from '../state/gameState.js';
import { drawHUD, drawLevelTransition } from '../ui/hud.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const barrierY = canvas.height * 0.75;

initInput();
initEnemyModule(canvas, ctx);
initEnemyAttack(canvas);
initShooting(canvas);

const Game = createInitialGame();
Game.player = createPlayer(canvas);

function update(delta) {
    if (Game.gameOver) return;

    updateInvincibility(Game, delta);

    if (updateLevelTransition(Game, delta)) {
        return;
    }

    updatePlayer(Game, delta, canvas, barrierY, createPlayerShot);
    updateEnemies(Game, delta);
    updatePlayerShots(Game, delta);
    updateEnemyShots(Game, delta);

    Game.attackTimer = scheduleEnemyAttacks(Game.enemies, Game.player, delta, Game.attackTimer);
    for (const enemy of Game.enemies) {
        if (enemy.state === 'attacking') {
            updateAttackingEnemy(enemy, delta);
        }
    }

    checkPlayerShotCollisions(Game, () => handleEnemyKilled(Game));

    if (Game.invincibilityTimer <= 0) {
        checkEnemyShotCollisions(Game, () => handlePlayerHit(Game));
        checkPlayerEnemyCollision(Game, () => handlePlayerHit(Game));
    }

    handleLevelProgression(Game, delta, spawnEnemyWave);
}

function draw() {
    ctx.fillStyle = '#000814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (Game.showingLevelTransition) {
        drawPlayer(ctx, Game.player, Game.invincibilityTimer);
        drawLevelTransition(ctx, canvas, Game);
    } else {
        drawEnemies(Game.enemies);
        drawEnemyShots(ctx, Game.enemyShots);
        drawPlayerShots(ctx, Game.playerShots);
        drawPlayer(ctx, Game.player, Game.invincibilityTimer);
    }

    drawHUD(ctx, canvas, Game);
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
