// js/core/input.js

/**
 * Set that tracks currently pressed key codes.
 * @type {Set<string>}
 */
const pressedKeys = new Set();

/**
 * Prevents multiple registrations of the same event listeners.
 * @type {boolean}
 */
let initialized = false;

/**
 * Initializes keyboard input handling.
 * Registers `keydown` and `keyup` listeners on the window once.
 * Safe to call multiple times – listeners are only attached on the first call.
 */
export function initInput() {
  if (initialized) return;

  window.addEventListener("keydown", (event) => {
    pressedKeys.add(event.code);
  });

  window.addEventListener("keyup", (event) => {
    pressedKeys.delete(event.code);
  });

  initialized = true;
}

/**
 * Checks whether a specific key is currently held down.
 *
 * @param {string} code - The key code to check (e.g., `"KeyW"`, `"ArrowLeft"`, `"Space"`).
 * @returns {boolean} `true` if the key is pressed, `false` otherwise.
 */
export function isKeyPressed(code) {
  return pressedKeys.has(code);
}
