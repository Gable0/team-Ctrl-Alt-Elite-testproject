// This file is the entry point of the application. It initializes the game and sets up the main game loop.

import { Game } from './game';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const game = new Game(ctx);

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update();
    game.draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();