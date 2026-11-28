import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.LAPTOP_ASSET_URL || "http://localhost:3107";
const OUT = path.resolve(import.meta.dirname, "../public/landing/laptop");
const SCROLL_POSTER = 0.32;
const GL_ARGS = [
  "--use-gl=angle",
  "--use-angle=swiftshader",
  "--enable-unsafe-swiftshader",
  "--ignore-gpu-blocklist",
];

async function openLanding(browser, options) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    ...options,
  });
  await context.addCookies([
    { name: "pathkr-theme", value: "light", url: BASE },
    { name: "pathkr-locale", value: "en", url: BASE },
  ]);
  await context.addInitScript(() =>
    sessionStorage.setItem("pathkr-intro-seen", "1"),
  );
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  return page;
}

async function captureFirstFrame(browser) {
  const page = await openLanding(browser, { reducedMotion: "reduce" });
  await page.evaluate(() =>
    document.querySelector("#features").scrollIntoView(),
  );
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const clone = document
      .querySelector("[data-laptop-screen]")
      .cloneNode(true);
    clone.removeAttribute("data-laptop-screen");
    clone.setAttribute("data-asset-frame", "");
    clone.style.cssText =
      "position:fixed;left:0;top:0;width:1000px;height:608px;translate:none;transform:none;opacity:1;z-index:99999;border-radius:0";
    document.body.appendChild(clone);
  });
  await page.addStyleTag({
    content: `body *{visibility:hidden!important}[data-asset-frame],[data-asset-frame] *{visibility:visible!important}`,
  });
  await page.waitForTimeout(500);
  await page.locator("[data-asset-frame]").screenshot({
    path: path.join(OUT, "screen-first-frame.png"),
  });
  await page.close();
}

async function captureLaptop(browser) {
  const page = await openLanding(browser, { reducedMotion: "no-preference" });
  const { top, dist } = await page.evaluate(() => ({
    top:
      document.querySelector("#features").parentElement.getBoundingClientRect()
        .top + scrollY,
    dist: innerHeight * 12,
  }));
  await page.evaluate((y) => scrollTo(0, y), top + SCROLL_POSTER * dist);
  await page.waitForFunction(() =>
    document.querySelector("[data-laptop-canvas] canvas"),
  );
  await page.waitForTimeout(2500);
  await page.addStyleTag({
    content: `html,body{background:transparent!important}body *{visibility:hidden!important}canvas{visibility:visible!important}`,
  });
  const clip = await page.evaluate(() => {
    const rect = document
      .querySelector("[data-laptop-anchor]")
      .getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
  const png = await page.screenshot({ clip, omitBackground: true });
  await sharp(png)
    .webp({ quality: 90, alphaQuality: 95 })
    .toFile(path.join(OUT, "poster.webp"));
  await page.close();
  return png;
}

async function measureScreen(png) {
  const { data, info } = await sharp(png)
    .raw()
    .toBuffer({ resolveWithObject: true });
  let [minX, minY, maxX, maxY] = [info.width, info.height, 0, 0];
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const i = (y * info.width + x) * info.channels;
      const near = (a, b) => Math.abs(a - b) < 14;
      if (
        near(data[i], 255) &&
        near(data[i + 1], 217) &&
        near(data[i + 2], 207) &&
        data[i + 3] > 250
      ) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  return {
    x: minX / info.width,
    y: minY / info.height,
    width: (maxX - minX) / info.width,
    height: (maxY - minY) / info.height,
  };
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({
  args: GL_ARGS,
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
await captureFirstFrame(browser);
const png = await captureLaptop(browser);
console.log("POSTER_SCREEN", JSON.stringify(await measureScreen(png)));
await browser.close();
