// js/ui/pauseMenu.js
// Handles creation and toggling of the in-game pause menu.

let isPaused = false;
let pauseMenuElement = null;

/**
 * Initializes the pause menu UI and sets up global ESC-key handling.
 * Creates the menu DOM element once and attaches button listeners.
 *
 * @param {Object} game - The main game state object (must have `gameOver` and `paused` properties).
 */
export function initPauseMenu(game) {
  // Create the pause menu only once
  if (!pauseMenuElement) {
    pauseMenuElement = document.createElement("div");
    pauseMenuElement.id = "pauseMenu";
    pauseMenuElement.className = "pause-menu hidden";
    pauseMenuElement.innerHTML = `
      <link rel="preload" href="https://fonts.googleapis.com/css2?family=Jersey+10&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
      <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jersey+10&display=swap"></noscript>
      <div class="pause-menu-content">
        <h2 style="font-family: 'Jersey 10', monospace;">PAUSED</h2>
        <button id="resumeButton" class="pause-menu-button" style="font-family: 'Jersey 10', monospace;">Resume</button>
        <button id="restartButton" class="pause-menu-button" style="font-family: 'Jersey 10', monospace;">Restart</button>
        <button id="exitButton" class="pause-menu-button" style="font-family: 'Jersey 10', monospace;">Exit to Menu</button>
      </div>
    `;
    document.body.appendChild(pauseMenuElement);

    // Button actions
    document.getElementById("resumeButton").addEventListener("click", () => {
      togglePause(game);
    });

    document.getElementById("restartButton").addEventListener("click", () => {
      window.location.href = "game.html";
    });

    document.getElementById("exitButton").addEventListener("click", () => {
      if (confirm("Are you sure you want to exit? Progress will be lost.")) {
        window.location.href = "homepage.html";
      }
    });
  }

  // Global ESC key listener (only works when the game isn't over)
  window.addEventListener("keydown", (e) => {
    if (e.code === "Escape" && !game.gameOver) {
      e.preventDefault();
      togglePause(game);
    }
  });
}

/**
 * Toggles the pause state and shows/hides the pause menu overlay.
 *
 * @param {Object} game - The main game state (its `paused` property will be updated).
 */
export function togglePause(game) {
  isPaused = !isPaused;
  game.paused = isPaused;

  if (isPaused) {
    pauseMenuElement.classList.remove("hidden");
    pauseMenuElement.classList.add("active");
  } else {
    pauseMenuElement.classList.remove("active");
    pauseMenuElement.classList.add("hidden");
  }
}

/**
 * Returns the current pause state.
 *
 * @returns {boolean} `true` if the game is paused, `false` otherwise.
 */
export function isGamePaused() {
  return isPaused;
}
