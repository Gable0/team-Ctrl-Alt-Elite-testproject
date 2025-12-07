export function drawHUD(ctx, canvas, game) {
  let scoreColor = '#00d9ff';
  if (game.difficulty === 'easy') {
    scoreColor = '#00ff41'; // green for easy
  } else if (game.difficulty === 'medium') {
    scoreColor = '#ffdd00'; // yellow for medium
  } else if (game.difficulty === 'hard') {
    scoreColor = '#ff0844'; // red for hard
  }
  ctx.fillStyle = scoreColor;
  ctx.font = '24px monospace';
  ctx.fillText(`Score: ${game.score}`, 20, 50);
  ctx.fillText(`Level: ${game.level}`, 20, 80);
  ctx.fillText(`Lives: ${game.lives}`, canvas.width - 160, 50);
}

export function drawLevelTransition(ctx, canvas, game) {
  ctx.fillStyle = 'rgba(0, 8, 20, 0.85)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
  ctx.shadowBlur = 30 * pulse;
  ctx.shadowColor = '#00d9ff';

  ctx.fillStyle = '#00d9ff';
  ctx.font = 'bold 72px monospace';
  ctx.fillText(`LEVEL ${game.level}`, canvas.width / 2, canvas.height / 2 - 40);

  ctx.shadowBlur = 15;
  ctx.font = '32px monospace';
  ctx.fillStyle = '#00ff41';
  ctx.fillText('GET READY!', canvas.width / 2, canvas.height / 2 + 40);

  ctx.restore();
}
