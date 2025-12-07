// js/systems/shootingSystem.js
// Handles creation, movement, firing logic, and rendering of all projectiles.

import { audioManager } from './audioManager.js';

/** @type {HTMLCanvasElement|null} */
let canvasRef = null;

/**
 * Stores the canvas reference for bounds checking.
 *
 * @param {HTMLCanvasElement} canvas
 */
export function initShooting(canvas) {
  canvasRef = canvas;
}

/**
 * Creates a player-fired shot with optional angle for triple-shot spread.
 *
 * @param {number} x - Spawn X position.
 * @param {number} y - Spawn Y position.
 * @param {number} [angle=0] - Angle in radians (0 = straight up).
 * @returns {Object} Shot object with update() method.
 */
export function createPlayerShot(x, y, angle = 0) {
  audioManager.playShootSound();

  const speed = 800;
  return {
    x: x,
    y: y - 20,
    vx: Math.sin(angle) * speed,
    vy: -Math.cos(angle) * speed,
    speed: speed,
    active: true,

    /** Updates shot position and deactivates when off-screen */
    update(delta) {
      this.x += this.vx * delta;
      this.y += this.vy * delta;
      if (this.y < -50 || this.x < -50 || this.x > canvasRef.width + 50) {
        this.active = false;
      }
    },
  };
}

/**
 * Updates all active player shots.
 *
 * @param {Object} game - Game state containing playerShots array.
 * @param {number} delta - Delta time in seconds.
 */
export function updatePlayerShots(game, delta) {
  for (const shot of game.playerShots) {
    if (shot.active !== false) shot.update(delta);
  }
}

/**
 * Fires a single enemy shot aimed roughly toward the player.
 *
 * @param {Object} enemy - Enemy firing the shot.
 * @param {Object} game - Game state (used for player position and shot array).
 */
export function fireEnemyShot(enemy, game) {
  if (game.enemyShots.length >= 8) return;

  const p = game.player;
  const dx = p.x - enemy.x + (Math.random() * 80 - 40);
  const dy = p.y - enemy.y + (Math.random() * 60 - 30);
  const dist = Math.hypot(dx, dy) || 1;

  const baseSpeed = 180;
  const speedMultiplier = 1 + (game.level - 1) * 0.5;
  const speed = baseSpeed * speedMultiplier;

  game.enemyShots.push({
    x: enemy.x,
    y: enemy.y + enemy.size,
    vx: (dx / dist) * speed,
    vy: (dy / dist) * speed,
    size: 6,
  });
}

/**
 * Handles enemy firing logic (both formation and dive attacks) and updates shot positions.
 *
 * @param {Object} game - Game state.
 * @param {number} delta - Delta time in seconds.
 */
export function updateEnemyShots(game, delta) {
  if (!canvasRef) return;

  // No enemy shooting until player is allowed to shoot
  if (!game.playerShootingUnlocked) {
    game.globalEnemyShotTimer = Math.max(game.globalEnemyShotTimer, 0);
    return;
  }

  // Scale fire rate with level
  const fireRateMultiplier = Math.pow(0.9, game.level - 1);
  const currentDelay = game.baseFireRateDelay * fireRateMultiplier;
  const currentVariance = game.baseFireRateVariance * fireRateMultiplier;

  // Formation enemies fire on a global timer
  game.globalEnemyShotTimer -= delta;
  if (game.globalEnemyShotTimer <= 0) {
    const shooters = game.enemies.filter(e => e.state === 'formation');
    if (shooters.length > 0 && Math.random() < 0.8) {
      const shooter = shooters[Math.floor(Math.random() * shooters.length)];
      fireEnemyShot(shooter, game);
    }
    game.globalEnemyShotTimer = Math.random() * currentVariance + currentDelay;
  }

  // Dive-attacking enemies fire more aggressively
  for (const enemy of game.enemies) {
    let diveFireChance = 0.04;
    if (game.difficulty === 'easy') diveFireChance = 0.01;
    else if (game.difficulty === 'hard') diveFireChance = 0.08;

    if (enemy.state === 'attacking' && Math.random() < diveFireChance) {
      fireEnemyShot(enemy, game);
    }
  }

  // Update positions and remove off-screen shots
  game.enemyShots = game.enemyShots.filter(shot => {
    shot.x += shot.vx * delta;
    shot.y += shot.vy * delta;
    return shot.y <= canvasRef.height + 50;
  });
}

/**
 * Renders all active player shots.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context.
 * @param {Array<Object>} shots - Array of player shot objects.
 */
export function drawPlayerShots(ctx, shots) {
  ctx.fillStyle = '#00ff41';
  ctx.shadowBlur = 18;
  ctx.shadowColor = '#00ff41';
  for (const shot of shots) {
    if (shot.active !== false) {
      ctx.fillRect(shot.x - 2.5, shot.y - 13, 5, 26);
    }
  }
  ctx.shadowBlur = 0;
}

/**
 * Renders all enemy shots.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context.
 * @param {Array<Object>} shots - Array of enemy shot objects.
 */
export function drawEnemyShots(ctx, shots) {
  ctx.fillStyle = '#ff0844';
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#ff0844';
  for (const shot of shots) {
    ctx.beginPath();
    ctx.arc(shot.x, shot.y, shot.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}
