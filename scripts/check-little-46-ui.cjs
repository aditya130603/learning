/* Browser smoke test: screenshots and real click-through, no Android emulator. */
"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const http = require("node:http");
const { chromium } = require("playwright");
const base = path.resolve(__dirname, "..", "dist");
const output = process.env.UI_OUTPUT || path.resolve("/tmp/little-learners-ui");
fs.mkdirSync(output, { recursive: true });
const mime = { ".html":"text/html", ".css":"text/css", ".js":"text/javascript", ".webp":"image/webp",
  ".svg":"image/svg+xml", ".webmanifest":"application/manifest+json", ".png":"image/png" };
const server = http.createServer((req, res) => {
  const file = path.resolve(base, "." + decodeURI(req.url.split("?")[0]));
  if (!file.startsWith(base + path.sep) && file !== base) { res.writeHead(403); res.end(); return; }
  const target = fs.existsSync(file) && fs.statSync(file).isDirectory() ? path.join(file, "index.html") : file;
  if (!fs.existsSync(target)) { res.writeHead(404); res.end("Not found"); return; }
  res.setHeader("Content-Type", mime[path.extname(target)] || "application/octet-stream");
  fs.createReadStream(target).pipe(res);
});
(async () => {
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const opts = { headless:true, args:["--no-sandbox"] };
  if (process.env.UI_BROWSER) opts.executablePath = process.env.UI_BROWSER;
  const browser = await chromium.launch(opts);
  const errors = [];
  const page = await browser.newPage({ viewport:{ width:375,height:667 }, reducedMotion:"reduce", deviceScaleFactor:1 });
  page.setDefaultTimeout(15000);
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });
  console.log("UI: loading home");
  await page.goto("http://127.0.0.1:" + port + "/", { waitUntil:"load" });
  await page.locator("h1").first().waitFor();
  assert.match(await page.locator("h1").first().innerText(), /explorer/i);
  await page.screenshot({ path:path.join(output,"01-home-375.png"), fullPage:true });
  await page.locator('[data-action="garden"]').first().click();
  assert.match(await page.locator(".garden-intro h1").innerText(), /alphabet|letter/i);
  console.log("UI checkpoint: garden map");
  await page.screenshot({ path:path.join(output,"02-letter-garden.png"), fullPage:false, timeout:10000 });
  console.log("UI: opening A lesson");
  await page.locator('[data-action="letter"][data-letter="A"]').click();
  assert.match(await page.locator(".play-content h1").innerText(), /ant/i);
  await page.screenshot({ path:path.join(output,"03-word-intro.png"), fullPage:true });
  await page.locator('[data-action="look-next"]').click();
  await page.locator('[data-action="find-choice"][data-choice="A-0"]').click();
  await page.screenshot({ path:path.join(output,"04-tap-spelling.png"), fullPage:true });
  for (const letter of "ANT") {
    const tiles = page.locator('[data-action="tile"]:not([disabled])');
    await tiles.filter({ hasText:new RegExp("^" + letter + "$") }).first().click();
  }
  assert.match(await page.locator(".play-content h1").innerText(), /wonderful/i);
  await page.screenshot({ path:path.join(output,"05-word-success.png"), fullPage:true });
  await page.reload();
  await page.locator('[data-action="resume"]').click();
  assert.match(await page.locator(".play-content h1").innerText(), /apple/i, "Saved progress must resume at word 2");
  await page.locator('[data-action="back"]').click();
  await page.locator('[data-action="back"]').first().click();
  console.log("UI: opening story");
  await page.locator('[data-action="story"]').first().click();
  await page.locator('[data-action="story-choice"][data-choice="nest"]').click();
  assert.match(await page.locator(".story-speech").innerText(), /cozy/i);
  await page.screenshot({ path:path.join(output,"06-story.png"), fullPage:true });
  await page.locator('[data-action="back"]').click();
  await page.locator('[data-action="parent"]').click();
  await page.locator("#parent-answer").fill("12");
  await page.locator('[data-action="parent-unlock"]').click();
  assert.match(await page.locator(".parent-summary").innerText(), /1 of 130 words/);
  await page.screenshot({ path:path.join(output,"07-parent-controls.png"), fullPage:true });
  await page.locator('[data-action="home"]').click();
  await page.setViewportSize({ width:320, height:568 });
  await page.screenshot({ path:path.join(output,"08-home-small-320.png"), fullPage:true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  assert.equal(overflow, false, "No horizontal scroll at 320px");
  // The new storybook map and sticker shelf must be real accessible controls/content.
  await page.locator('[data-action="garden"]').first().click();
  assert.equal(await page.locator(".garden-flower").count(),26);
  await page.locator(".garden-world-art").evaluate(img => { if (!img.complete) return new Promise(resolve => {img.onload=resolve;img.onerror=resolve}); });
  assert.equal(await page.locator('.garden-flower:not([disabled])').count(),1);
  console.log("UI checkpoint: 320px garden map");
  await page.screenshot({path:path.join(output,"09-garden-storybook-320.png"),fullPage:false,timeout:10000});
  await page.locator('[data-action="back"]').first().click();
  await page.locator('[data-action="rewards"]').first().click();
  assert.equal(await page.locator(".shelf-slot").count(),26);
  assert.match(await page.locator(".rewards-celebration").innerText(),/0 of 26 letter stickers/i);
  await page.screenshot({path:path.join(output,"10-sticker-storybook-320.png"),fullPage:true});
  await page.locator('[data-action="back"]').first().click();
  assert.equal(await page.locator(".hero-fox .buddy").count(),1);
  const illustrationOk = await page.evaluate(() => {
    const img=document.querySelector(".hero-fox img");
    return img && img.complete && img.naturalWidth > 0;
  });
  assert.equal(illustrationOk,true,"The Pip illustration should load in offline package");
  console.log("UI checkpoint: all interaction checks complete");
  assert.deepEqual(errors, [], "The site should have no browser exceptions");
  console.log("UI smoke checks passed; screenshots saved to", output);
  await browser.close();
})().then(() => server.close(), error => { console.error("UI CHECK FAILED:",error && error.stack || error); server.close(); process.exit(1); });
