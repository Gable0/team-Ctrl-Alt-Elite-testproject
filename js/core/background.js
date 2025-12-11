// js/core/background.js

/**
 * Array holding all star objects for the parallax starfield background.
 * @type {Array<{x: number, y: number, size: number, speed: number, opacity: number}>}
 */
let stars = [];

/**
 * Initializes the background starfield.
 * Generates 100 stars with random position, size, speed and opacity.
 *
 * @param {HTMLCanvasElement} canvas - The game canvas used to determine star bounds.
 */
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

/**
 * Updates the position of every star each frame, creating a downward scrolling effect.
 * Stars that move off-screen are reset to the top with a new random X position.
 *
 * @param {number} delta - Time elapsed since the last frame (in seconds).
 * @param {HTMLCanvasElement} canvas - The game canvas used for height checking.
 */
export function updateBackground(delta, canvas) {
  for (const star of stars) {
    star.y += star.speed * delta;

    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  }
}

/**
 * Renders the background: a solid dark space color plus the animated starfield.
 *
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the game canvas.
 * @param {HTMLCanvasElement} canvas - The game canvas (used for clearing the area).
 */
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
