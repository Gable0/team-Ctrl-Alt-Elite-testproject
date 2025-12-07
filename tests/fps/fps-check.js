import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/game.html");

  // Wait for your canvas
  await page.waitForSelector("#game", { timeout: 15000 });

  console.log("Game loaded – measuring FPS for 5 seconds...");

  const fpsSamples = await page.evaluate(() => {
    const samples = [];
    let lastTime = performance.now();

    return new Promise((resolve) => {
      let frames = 0;
      const measure = (now) => {
        frames++;
        const delta = now - lastTime;
        if (delta >= 1000) {
          samples.push(Math.round((frames * 1000) / delta));
          frames = 0;
          lastTime = now;
        }
        if (samples.length < 5) {
          requestAnimationFrame(measure);
        } else {
          resolve(samples);
        }
      };
      requestAnimationFrame(measure);
    });
  });

  const minFps = Math.min(...fpsSamples);
  const avgFps = Math.round(
    fpsSamples.reduce((a, b) => a + b) / fpsSamples.length,
  );

  console.log(`FPS samples: ${fpsSamples.join(", ")}`);
  console.log(`Lowest: ${minFps} FPS | Average: ${avgFps} FPS`);

  if (minFps < 60) {
    console.error("FAIL: FPS dropped below 60");
    process.exit(1);
  } else {
    console.log("PASS: FPS stayed at 60+");
    process.exit(0);
  }

  await browser.close();
})();
