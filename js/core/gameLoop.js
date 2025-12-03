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
import { initPauseMenu } from '../ui/pauseMenu.js';
import { spawnPowerUp, updatePowerUps, drawPowerUps } from '../systems/powerUps.js';
import { initBackground, updateBackground, drawBackground } from './background.js';
import { initAudio } from '../systems/audioManager.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const barrierY = canvas.height * 0.75;

// Initialize all systems
initInput();
initEnemyModule(canvas, ctx);
initEnemyAttack(canvas);
initShooting(canvas);
initBackground(canvas);
initAudio(); // Initialize audio system

const Game = createInitialGame();
Game.player = createPlayer(canvas);

initPauseMenu(Game);

function update(delta) {
    if (Game.gameOver || Game.paused) return;

    updateInvincibility(Game, delta);

    if (updateLevelTransition(Game, delta)) {
        return;
    }

    updateBackground(delta, canvas);
    updateEnemies(Game, delta);
    updatePlayer(Game, delta, canvas, barrierY, createPlayerShot);
    updatePlayerShots(Game, delta);
    updateEnemyShots(Game, delta);
    updatePowerUps(Game, delta, canvas);

    if (Game.playerShootingUnlocked) {
        Game.attackTimer = scheduleEnemyAttacks(Game.enemies, Game.player, delta, Game.attackTimer);
    }
    for (const enemy of Game.enemies) {
        if (enemy.state === 'attacking') {
            updateAttackingEnemy(enemy, delta);
        }
    }

    checkPlayerShotCollisions(Game, (enemy) => {
        handleEnemyKilled(Game, enemy);
        spawnPowerUp(Game, enemy);
    });

    if (Game.invincibilityTimer <= 0) {
        checkEnemyShotCollisions(Game, () => handlePlayerHit(Game));
        checkPlayerEnemyCollision(Game, () => handlePlayerHit(Game));
    }

    handleLevelProgression(Game, delta, spawnEnemyWave);
}

function draw() {
    drawBackground(ctx, canvas);

    if (Game.showingLevelTransition) {
        drawPlayer(ctx, Game.player, Game.invincibilityTimer, Game);
        drawLevelTransition(ctx, canvas, Game);
    } else {
        drawEnemies(Game.enemies, Game);
        drawEnemyShots(ctx, Game.enemyShots);
        drawPlayerShots(ctx, Game.playerShots);
        drawPowerUps(ctx, Game.powerUps);
        drawPlayer(ctx, Game.player, Game.invincibilityTimer, Game);
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

