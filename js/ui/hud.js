// js/ui/hud.js
// Heads-up display and level transition screen rendering.
export function drawHUD(ctx, canvas, game) {
  // Color-code the HUD based on current difficulty
  let scoreColor = "#00d9ff";
  if (game.difficulty === "easy") {
    scoreColor = "#00ff41"; // green
  } else if (game.difficulty === "medium") {
    scoreColor = "#ffdd00"; // yellow
  } else if (game.difficulty === "hard") {
    scoreColor = "#ff0844"; // red
  }

  ctx.fillStyle = scoreColor;
  ctx.font = '24px "Jersey 10", monospace'; // ← Jersey 10 applied

  // Score & Level (top-left)
  ctx.fillText(`Score: ${game.score}`, 20, 50);
  ctx.fillText(`Level: ${game.level}`, 20, 80);

  // Lives (top-right)
  ctx.fillText(`Lives: ${game.lives}`, canvas.width - 160, 50);
}

export function drawLevelTransition(ctx, canvas, game) {
  // Dark overlay covering the whole screen
  ctx.fillStyle = "rgba(0, 8, 20, 0.85)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Pulsing glow effect
  const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
  ctx.shadowBlur = 30 * pulse;
  ctx.shadowColor = "#00d9ff";

  // "LEVEL X" text
  ctx.fillStyle = "#00d9ff";
  ctx.font = 'bold 72px "Jersey 10", monospace';
  ctx.fillText(`LEVEL ${game.level}`, canvas.width / 2, canvas.height / 2 - 40);

  // "GET READY!" text
  ctx.shadowBlur = 15;
  ctx.font = '32px "Jersey 10", monospace';
  ctx.fillStyle = "#00ff41";
  ctx.fillText("GET READY!", canvas.width / 2, canvas.height / 2 + 40);

  ctx.restore();
}
