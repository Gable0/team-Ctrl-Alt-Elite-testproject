// js/core/background.js

let stars = [];

export function initBackground(canvas) {
  stars = [];
  // Create multiple layers of stars with different speeds
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 30 + 10,
      opacity: Math.random() * 0.5 + 0.5,
    });
  }
}

export function updateBackground(delta, canvas) {
  for (const star of stars) {
    star.y += star.speed * delta;

    // Wrap around when star goes off screen
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  }
}

export function drawBackground(ctx, canvas) {
  // Draw space background
  ctx.fillStyle = '#000814';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw stars
  for (const star of stars) {
    ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
