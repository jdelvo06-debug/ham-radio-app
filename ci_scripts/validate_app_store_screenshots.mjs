import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const appRequire = createRequire(path.join(repoRoot, 'my-study-app', 'package.json'));
const sharp = appRequire('sharp');

const expectedSets = [
  {
    device: 'iphone-6.5',
    width: 1284,
    height: 2778,
  },
  {
    device: 'ipad-13',
    width: 2048,
    height: 2732,
  },
];

const expectedNames = [
  '01-main-menu.png',
  '02-learn-topics.png',
  '03-study-explanation.png',
  '04-analytics.png',
  '05-review-premium.png',
];

const assetRoot = path.join(repoRoot, 'app-store-assets', 'ios');
const failures = [];

for (const set of expectedSets) {
  for (const name of expectedNames) {
    const filePath = path.join(assetRoot, set.device, name);

    try {
      const metadata = await sharp(filePath).metadata();

      if (metadata.format !== 'png') {
        failures.push(`${filePath}: expected png, got ${metadata.format}`);
      }

      if (metadata.width !== set.width || metadata.height !== set.height) {
        failures.push(
          `${filePath}: expected ${set.width}x${set.height}, got ${metadata.width}x${metadata.height}`,
        );
      }

      if (metadata.width === metadata.height) {
        failures.push(`${filePath}: App Store screenshots must not be square icon-style images`);
      }
    } catch (error) {
      failures.push(`${filePath}: ${error.message}`);
    }
  }
}

try {
  const paywallMetadata = await sharp(path.join(repoRoot, 'my-study-app', 'paywall-screenshot-1024x1024.png')).metadata();
  if (paywallMetadata.width === 1024 && paywallMetadata.height === 1024) {
    console.log('Checked existing paywall image: 1024x1024 square asset is not part of the App Store screenshot set.');
  }
} catch {
  console.log('Existing paywall square image not found; skipping square-asset comparison.');
}

if (failures.length > 0) {
  console.error(`App Store screenshot validation failed with ${failures.length} issue(s):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('App Store screenshot validation passed: 10 PNGs with Apple-compatible dimensions.');
