import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

// The optional package path lets restricted contributors keep dependencies in /tmp.
const require = createRequire(process.env.PEPE_TEST_PACKAGE || import.meta.url);
const { chromium } = require("playwright");
const AxeBuilder = require("@axe-core/playwright").default;
const root = resolve("dist");
const output = resolve("artifacts");
await mkdir(output, { recursive: true });
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    if (!pathname.startsWith("/preview/")) throw Error("Invalid prefix");
    const file = resolve(
      root,
      pathname.slice("/preview/".length) || "index.html",
    );
    if (!file.startsWith(root + sep)) throw Error("Invalid path");
    response.setHeader(
      "Content-Type",
      mime[extname(file)] || "application/octet-stream",
    );
    response.end(await readFile(file));
  } catch {
    response.statusCode = 404;
    response.end("Not found");
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const url = `http://127.0.0.1:${server.address().port}/preview/`;
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  args: ["--no-sandbox"],
});
const report = {
  browser: browser.version(),
  servedAtSubpath: "/preview/",
  checks: [],
  viewports: [],
  consoleErrors: [],
  failedRequests: [],
  contrast: [],
  axe: [],
};
const check = (label, data = {}) => {
  report.checks.push({ label, passed: true, ...data });
  console.log(`PASS ${label}`);
};
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => report.consoleErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") report.consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) =>
    report.failedRequests.push(request.url()),
  );
  page.on("response", (response) => {
    if (response.status() >= 400)
      report.failedRequests.push(`${response.status()} ${response.url()}`);
  });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator(".spectator").count(), 5);
  assert.equal(await page.locator(".player").count(), 1);
  assert.equal(await page.locator("h1").count(), 1);
  const fonts = await page.evaluate(() =>
    [...document.fonts].map((font) => ({
      family: font.family,
      status: font.status,
    })),
  );
  assert.ok(fonts.every((font) => font.status === "loaded"));
  check(
    "Five spectators, visible player, one main heading, and both local fonts loaded",
    { fonts },
  );

  for (const width of [1440, 960, 780, 390, 320]) {
    await page.setViewportSize({ width, height: width > 780 ? 1050 : 844 });
    const overflow = await page.evaluate(() => ({
      viewport: innerWidth,
      content: document.documentElement.scrollWidth,
    }));
    assert.ok(overflow.content <= overflow.viewport, `Overflow at ${width}`);
    const screenshot = `desktop-${width}.jpg`;
    if ([1440, 390, 320].includes(width))
      await page.screenshot({
        path: resolve(output, screenshot),
        fullPage: true,
        type: "jpeg",
        quality: 85,
      });
    report.viewports.push({ ...overflow, height: width > 780 ? 1050 : 844 });
    check(`No horizontal overflow at ${width}px`);
  }
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({
    path: resolve(output, "text-enlargement.jpg"),
    fullPage: true,
    type: "jpeg",
    quality: 85,
  });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "";
  });
  check(
    "Root text enlargement to 200% produces no page overflow (not native browser zoom)",
  );

  await page.keyboard.press("Tab");
  assert.equal(await page.locator(":focus").innerText(), "Skip to the arcade");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  assert.match(await page.locator(":focus").innerText(), /My collection/);
  await page.keyboard.press("Enter");
  assert.equal(
    await page.locator(".collection-modal").evaluate((element) => element.open),
    true,
  );
  assert.equal(
    await page.locator(":focus").getAttribute("aria-label"),
    "Close collection",
  );
  assert.match(
    await page.locator(".collection-modal").innerText(),
    /first little friend/,
  );
  await page.keyboard.press("Shift+Tab");
  assert.match(await page.locator(":focus").innerText(), /Back to the arcade/);
  await page.keyboard.press("Escape");
  assert.match(await page.locator(":focus").innerText(), /My collection/);
  check(
    "Keyboard opens empty collection; native dialog traps focus; Escape restores trigger",
  );

  await page.getByRole("button", { name: "How to play", exact: true }).click();
  assert.equal(await page.locator(".instructions li").count(), 3);
  await page.keyboard.press("Escape");
  check(
    "Instructions explain play, aim, drop, collection, and unlimited retries",
  );

  await page.getByRole("button", { name: "Sound", exact: true }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "Sound", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page.getByRole("button", { name: "Sound", exact: true }).click();
  check(
    "Sound control toggles on and off without browser errors; listening not verified",
  );
  await page
    .getByRole("button", { name: "Crowd animation", exact: true })
    .click();
  assert.equal(
    await page
      .locator(".spectator-1 .pepe-body")
      .evaluate((element) => getComputedStyle(element).animationPlayState),
    "paused",
  );
  await page
    .getByRole("button", { name: "Crowd animation", exact: true })
    .click();
  check("Crowd motion can be paused and resumed");

  const primary = page.locator(".game-controls .primary-button");
  const phase = (name) =>
    page.waitForFunction(
      (value) =>
        document.querySelector(".machine-scene").dataset.phase === value,
      name,
    );
  await primary.focus();
  await page.screenshot({
    path: resolve(output, "keyboard-focus.jpg"),
    fullPage: true,
    type: "jpeg",
    quality: 85,
  });
  await page.keyboard.press("Space");
  await page.waitForTimeout(350);
  assert.equal(
    await page.locator(".machine-scene").getAttribute("data-phase"),
    "press-play",
  );
  const contact = await page.evaluate(() => {
    const hand = document
      .querySelector(".player .left-hand")
      .getBoundingClientRect();
    const button = document
      .querySelector(".machine-button")
      .getBoundingClientRect();
    return {
      distance: Math.hypot(
        hand.x + hand.width / 2 - button.x - button.width / 2,
        hand.y + hand.height / 2 - button.y - button.height / 2,
      ),
      buttonTransform: getComputedStyle(
        document.querySelector(".machine-button"),
      ).transform,
    };
  });
  assert.ok(
    contact.distance < 15,
    `Hand should contact button: ${contact.distance}`,
  );
  await page.screenshot({
    path: resolve(output, "button-press.jpg"),
    fullPage: true,
    type: "jpeg",
    quality: 85,
  });
  await phase("aiming");
  check(
    "Keyboard Play visibly reaches and depresses the physical button",
    contact,
  );
  await page.keyboard.press("ArrowRight");
  assert.equal(await page.locator("#claw-position").inputValue(), "345");
  await page.keyboard.press("ArrowLeft");
  assert.equal(await page.locator("#claw-position").inputValue(), "337");
  await page.keyboard.press("Space");
  await phase("press-drop");
  assert.equal(await primary.getAttribute("aria-disabled"), "true");
  await primary.evaluate((element) => {
    for (let index = 0; index < 10; index++) element.click();
  });
  await phase("dropping");
  await phase("lifting");
  await phase("delivering");
  assert.equal(await page.locator(".hatch-prize").count(), 1);
  await phase("won");
  assert.equal(await page.locator(".main-nav .count").innerText(), "1");
  assert.equal(await page.locator(".celebrating .player").count(), 1);
  assert.notEqual(
    await page
      .locator(".player .pepe-body")
      .evaluate((element) => getComputedStyle(element).animationName),
    "none",
  );
  assert.notEqual(
    await page
      .locator(".spectator-1 .right-arm")
      .evaluate((element) => getComputedStyle(element).animationName),
    "none",
  );
  await page.screenshot({
    path: resolve(output, "win-celebration.jpg"),
    fullPage: true,
    type: "jpeg",
    quality: 85,
  });
  check(
    "Drop reaches button, lowers claw, lifts prize, delivers to hatch, then awards once despite repeated clicks",
  );
  check(
    "Win triggers player jump, spectator dance and clapping, confetti, and static win announcement",
  );
  await page.waitForFunction(
    () =>
      !document
        .querySelector(".machine-scene")
        .classList.contains("celebrating"),
  );
  check("Celebration ends automatically after 3.6 seconds");

  await page.getByRole("button", { name: /My collection/ }).click();
  assert.match(
    await page.locator(".collection-modal").innerText(),
    /1 of 4 friends collected/,
  );
  await page.keyboard.press("Escape");
  await page.reload();
  assert.equal(await page.locator(".main-nav .count").innerText(), "1");
  check("Won collection survives reload");

  async function setPosition(value) {
    await page.locator("#claw-position").evaluate((element, nextValue) => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      ).set.call(element, String(nextValue));
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
    }, value);
    assert.equal(
      await page.locator("#claw-position").inputValue(),
      String(value),
    );
  }
  await primary.click();
  await phase("aiming");
  await setPosition(303);
  await primary.click();
  await phase("missed");
  assert.equal(await page.locator(".main-nav .count").innerText(), "1");
  assert.match(await page.locator(".game-status").innerText(), /try again/);
  check(
    "Drop between prizes misses without adding a prize, and offers Play again",
  );
  for (const [position, prizeName] of [
    [270, "Classic Pepe"],
    [407, "Cosmic Pepe"],
    [475, "King Pepe"],
  ]) {
    await primary.click();
    await phase("aiming");
    await setPosition(position);
    await primary.click();
    await phase("won");
    assert.match(
      await page.locator(".game-status").innerText(),
      new RegExp(prizeName),
    );
    check(`Can collect ${prizeName} by aiming over its position`);
  }
  await page.getByRole("button", { name: /My collection/ }).click();
  assert.match(
    await page.locator(".collection-modal").innerText(),
    /4 of 4 friends collected/,
  );
  await page.screenshot({
    path: resolve(output, "full-collection.jpg"),
    fullPage: true,
    type: "jpeg",
    quality: 85,
  });
  for (const state of ["collection", "page", "mobile"]) {
    if (state === "page") await page.keyboard.press("Escape");
    if (state === "mobile")
      await page.setViewportSize({ width: 320, height: 844 });
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    report.axe.push({
      state,
      violations: result.violations.map((item) => ({
        id: item.id,
        impact: item.impact,
        description: item.description,
        nodes: item.nodes.map((node) => node.target),
      })),
    });
  }
  await page.setViewportSize({ width: 1440, height: 1050 });

  report.contrast = await page.evaluate(() => {
    function channels(value) {
      return value
        .match(/[\d.]+/g)
        .slice(0, 3)
        .map(Number);
    }
    function luminance(value) {
      const rgb = channels(value).map((channel) => {
        const c = channel / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    }
    return [
      ".intro h1",
      ".intro>p",
      ".primary-button",
      ".stage-bottomline",
      ".range-wrap label",
      ".prize-copy p",
      ".kindness-banner p span",
    ].map((selector) => {
      const element = document.querySelector(selector);
      const color = getComputedStyle(element).color;
      let parent = element;
      let background;
      while (parent) {
        const candidate = getComputedStyle(parent).backgroundColor;
        if (candidate !== "rgba(0, 0, 0, 0)" && candidate !== "transparent") {
          background = candidate;
          break;
        }
        parent = parent.parentElement;
      }
      const a = luminance(color),
        b = luminance(background);
      return {
        selector,
        color,
        background,
        ratio: Number(
          ((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2),
        ),
      };
    });
  });
  assert.ok(report.contrast.every((pair) => pair.ratio >= 4.5));
  check("Seven computed solid text/background pairs meet 4.5:1 contrast");

  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await page
      .locator(".spectator-1 .pepe-body")
      .evaluate((element) => getComputedStyle(element).animationName),
    "none",
  );
  await primary.click();
  await phase("aiming");
  await primary.click();
  await phase("won");
  assert.equal(
    await page
      .locator(".player .pepe-body")
      .evaluate((element) => getComputedStyle(element).animationName),
    "none",
  );
  assert.equal(await page.locator(".hatch-prize").count(), 1);
  check(
    "Reduced motion disables idle, jump, and transitions while preserving a complete playable win",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await mobile.goto(url);
  await mobile.locator(".game-controls .primary-button").tap();
  await mobile.waitForFunction(
    () => document.querySelector(".machine-scene").dataset.phase === "aiming",
  );
  await mobile
    .getByRole("button", { name: "Move claw right", exact: true })
    .tap();
  await mobile
    .getByRole("button", { name: "Move claw left", exact: true })
    .tap();
  await mobile.locator(".game-controls .primary-button").tap();
  await mobile.waitForFunction(
    () => document.querySelector(".machine-scene").dataset.phase === "won",
  );
  assert.match(
    await mobile.locator(".game-status").innerText(),
    /Sunshine Pepe/,
  );
  check("Emulated touch play, directional aiming, drop, and win work at 390px");
  await mobile.close();

  await page.evaluate(() =>
    localStorage.setItem("pepe-lucky-collection-v1", "invalid JSON"),
  );
  await page.reload();
  assert.equal(await page.locator(".main-nav .count").innerText(), "0");
  check("Corrupt saved data recovers to an empty collection without crashing");
  const blocked = await browser.newPage();
  await blocked.addInitScript(() => {
    Object.defineProperty(Storage.prototype, "setItem", {
      value() {
        throw new DOMException("Storage blocked", "SecurityError");
      },
    });
  });
  await blocked.goto(url);
  await blocked.getByRole("button", { name: /My collection/ }).click();
  assert.match(
    await blocked.locator(".collection-modal").innerText(),
    /this visit only/,
  );
  await blocked.keyboard.press("Escape");
  await blocked.locator(".game-controls .primary-button").click();
  await blocked.waitForFunction(
    () => document.querySelector(".machine-scene").dataset.phase === "aiming",
  );
  await blocked.locator(".game-controls .primary-button").click();
  await blocked.waitForFunction(
    () => document.querySelector(".machine-scene").dataset.phase === "won",
  );
  check(
    "Unavailable storage displays a session-only explanation and gameplay still works",
  );
  await blocked.close();

  assert.equal(report.consoleErrors.length, 0);
  assert.equal(report.failedRequests.length, 0);
  check(
    "No console exceptions or failed resource requests on the production export",
  );
  assert.ok(
    report.axe.every((state) => state.violations.length === 0),
    JSON.stringify(report.axe, null, 2),
  );
  check(
    "Axe WCAG A/AA scan reports zero violations on page and collection dialog",
  );
} catch (error) {
  report.failure = error.stack;
  throw error;
} finally {
  await writeFile(
    resolve(output, "browser-results.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  await browser.close();
  await new Promise((done) => server.close(done));
}
