import { test, assert } from "vitest";
import { boxesOverlap } from "../../../js/systems/collision/detection.js";

test("boxes overlap when intersecting", () => {
  const a = { x: 100, y: 100, width: 100, height: 100 };
  const b = { x: 150, y: 150, width: 100, height: 100 };
  assert.isTrue(boxesOverlap(a, b));
});

test("boxes do not overlap when separate", () => {
  const a = { x: 100, y: 100, width: 50, height: 50 };
  const b = { x: 200, y: 200, width: 50, height: 50 };
  assert.isFalse(boxesOverlap(a, b));
});

test("boxes dont overlap when touching edges ", () => {
  // Box A: right edge at x = 200
  const a = { x: 100, y: 100, width: 100, height: 100 };
  // Box B: left edge at x = 200 → TOUCHING
  const b = { x: 200, y: 100, width: 100, height: 100 };

  assert.isFalse(boxesOverlap(a, b)); // ← NOW CORRECT
});

test("boxes overlap when one is completely inside another", () => {
  const a = { x: 100, y: 100, width: 200, height: 200 };
  const b = { x: 150, y: 150, width: 50, height: 50 };
  assert.isTrue(boxesOverlap(a, b));
});

test("boxes do not overlap when just outside (1 pixel gap)", () => {
  const a = { x: 100, y: 100, width: 50, height: 50 };
  const b = { x: 151, y: 151, width: 50, height: 50 }; // 1 pixel gap
  assert.isFalse(boxesOverlap(a, b));
});
