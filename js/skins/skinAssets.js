/**
 * @file Manages loading and caching of enemy skin images (PNG/JPG).
 * Images are preloaded once at game start and reused for performance.
 */

const enemySkinImages = new Map();

/**
 * Preloads an enemy skin image from disk.
 * Must be called before the game loop starts (supports async/await).
 *
 * @param {string} skinName - Unique identifier matching skinsManager (e.g. "prof", "squarePack")
 * @param {string} path - Relative path to image (e.g. "assets/images/prof.jpg")
 * @returns {Promise<HTMLImageElement>} Resolves when image is fully loaded
 * @throws {Error} If image fails to load
 *
 * @example
 * await loadEnemySkinImage('prof', 'assets/images/prof.jpg');
 */
export async function loadEnemySkinImage(skinName, path) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      enemySkinImages.set(skinName, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load enemy skin: ${path}`));
    img.src = path;
  });
}

/**
 * Retrieves a preloaded enemy skin image.
 * Returns null if skin not loaded or doesn't exist.
 *
 * @param {string} skinName - The skin identifier
 * @returns {HTMLImageElement|null} Cached image or null
 */
export function getEnemySkinImage(skinName) {
  return enemySkinImages.get(skinName) || null;
}
