// js/ui/pauseButton.js
// Injects a pause button in the top-right corner for the game page.
// When clicked, it triggers the pause menu with volume controls.

import { togglePause } from './pauseMenu.js';

/**
 * Injects a pause button into the game page.
 * The button will trigger the pause menu when clicked.
 *
 * @param {Object} game - The main game state object
 */
export function injectPauseButton(game) {
  // Create pause button with pause icon (two vertical bars)
  const pauseBtn = document.createElement('button');
  pauseBtn.className = 'pause-btn';
  pauseBtn.setAttribute('aria-label', 'Pause Game');
  pauseBtn.innerHTML = '⏸';

  // Append to page
  document.body.appendChild(pauseBtn);

  // Click handler to toggle pause
  pauseBtn.addEventListener('click', () => {
    togglePause(game);
  });
}
