import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const staticDir = path.join(projectRoot, 'out');
const origin = 'http://127.0.0.1:4173';

assert.ok(
  existsSync(path.join(staticDir, 'index.html')),
  'Static build not found. Run `npm run build` before `npm run smoke:static`.',
);

const serveEntry = path.join(projectRoot, 'node_modules', 'serve', 'build', 'main.js');
const server = spawn(process.execPath, [serveEntry, staticDir, '--listen', '4173'], {
  cwd: projectRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
});

let serverOutput = '';
server.stdout.on('data', (chunk) => {
  serverOutput += chunk.toString();
});
server.stderr.on('data', (chunk) => {
  serverOutput += chunk.toString();
});

async function waitForServer() {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {
      // The server may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Static server did not start.\n${serverOutput}`);
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const responseStatuses = new Map();
  const failedRequests = [];
  const pageErrors = [];

  page.on('response', (response) => {
    responseStatuses.set(response.url(), response.status());
  });
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.url()}: ${request.failure()?.errorText ?? 'unknown error'}`);
  });
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  await page.addInitScript(() => {
    localStorage.setItem('ham_technician_onboarding_complete', 'true');
  });

  const documentResponse = await page.goto(origin, { waitUntil: 'networkidle' });
  assert.equal(documentResponse?.status(), 200, 'The static app document did not load');

  const assets = await page.evaluate(() => ({
    stylesheets: Array.from(document.querySelectorAll('link[rel="stylesheet"][href]'), (node) => node.href),
    scripts: Array.from(document.querySelectorAll('script[src]'), (node) => node.src),
  }));
  assert.ok(assets.stylesheets.length > 0, 'No CSS asset was linked');
  assert.ok(assets.scripts.length > 0, 'No JavaScript asset was linked');
  for (const assetUrl of [...assets.stylesheets, ...assets.scripts]) {
    const browserStatus = responseStatuses.get(assetUrl);
    const assetResponse = browserStatus === undefined
      ? await context.request.get(assetUrl)
      : null;
    assert.equal(
      browserStatus ?? assetResponse?.status(),
      200,
      `Asset did not load successfully: ${assetUrl}`,
    );
  }

  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
  assert.ok(manifestHref, 'Manifest link is missing');
  const manifestResponse = await context.request.get(new URL(manifestHref, origin).href);
  assert.ok(manifestResponse.ok(), `Manifest request failed with ${manifestResponse.status()}`);
  const manifest = await manifestResponse.json();
  assert.equal(manifest.name, 'Ham Radio Study Buddy', 'Manifest content is unexpected');

  const serviceWorker = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return null;
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((resolve) => setTimeout(() => resolve(null), 15_000)),
    ]);
    return registration ? registration.active?.scriptURL ?? registration.installing?.scriptURL ?? null : null;
  });
  assert.ok(serviceWorker?.endsWith('/sw.js'), 'Service worker did not register and become ready');

  await page.getByRole('button', { name: /Study Mode/ }).click();
  const progress = page.getByRole('progressbar', { name: 'Quiz progress' });
  await progress.waitFor();
  assert.equal(await progress.getAttribute('aria-valuenow'), '1', 'App did not hydrate into question 1');

  await page.locator('div.space-y-3 > button').first().click();
  await page.getByRole('button', { name: /Next Question/ }).click();
  await page.waitForFunction(() => document.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow') === '2');
  assert.equal(await progress.getAttribute('aria-valuenow'), '2', 'Question did not advance to question 2');

  assert.deepEqual(failedRequests, [], `Requests failed:\n${failedRequests.join('\n')}`);
  assert.deepEqual(pageErrors, [], `Page errors occurred:\n${pageErrors.join('\n')}`);

  console.log(`Static smoke passed: ${assets.stylesheets.length} CSS, ${assets.scripts.length} JS, manifest, service worker, hydration, question 1 -> 2.`);
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
