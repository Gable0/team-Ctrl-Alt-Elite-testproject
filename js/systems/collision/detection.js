// js/utils/detection.js

/**
 * Determines whether two axis-aligned rectangles overlap.
 * Uses the standard AABB (Axis-Aligned Bounding Box) overlap test.
 *
 * @param {Object} a - First rectangle.
 * @param {number} a.x - Left edge of the rectangle.
 * @param {number} a.y - Top edge of the rectangle.
 * @param {number} a.width - Width of the rectangle.
 * @param {number} a.height - Height of the rectangle.
 *
 * @param {Object} b - Second rectangle.
 * @param {number} b.x - Left edge of the rectangle.
 * @param {number} b.y - Top edge of the rectangle.
 * @param {number} b.width - Width of the rectangle.
 * @param {number} b.height - Height of the rectangle.
 *
 * @returns {boolean} `true` if the rectangles overlap (or touch), `false` otherwise.
 */
export function boxesOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
