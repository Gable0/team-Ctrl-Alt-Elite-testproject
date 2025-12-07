// tests/e2e/load.test.js
import { test, expect } from "@playwright/test";

test("game loads correctly", async ({ page }) => {
  // Go straight to your real game file
  await page.goto("/game.html");

  // 1. Canvas appears
  const canvas = page.locator("#game");
  await expect(canvas).toBeVisible({ timeout: 10000 });

  // 2. Settings button appears
  await expect(page.locator(".settings-btn")).toBeVisible();

  // 3. Pause menu works (press ESC)
  await page.keyboard.press("Escape");
  await expect(page.locator("#pauseMenu")).toBeVisible();
  await page.keyboard.press("Escape"); // close it
  await expect(page.locator("#pauseMenu")).toBeHidden();

  // 4. Game runs for 3 seconds without crashing
  await page.waitForTimeout(3000);
  console.log("Game loaded and stable!");
});
