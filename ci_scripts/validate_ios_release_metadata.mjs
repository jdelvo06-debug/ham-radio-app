import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const projectFile = path.join(repoRoot, 'my-study-app', 'ios', 'App', 'App.xcodeproj', 'project.pbxproj');
const typesFile = path.join(repoRoot, 'my-study-app', 'app', 'types.ts');
const pageFile = path.join(repoRoot, 'my-study-app', 'app', 'page.tsx');

const expectedMarketingVersion = '1.1.1';
const expectedBuildNumber = '5';
const failures = [];

const projectText = await fs.readFile(projectFile, 'utf8');
const marketingMatches = [...projectText.matchAll(/MARKETING_VERSION = ([^;]+);/g)].map((match) => match[1]);
const buildMatches = [...projectText.matchAll(/CURRENT_PROJECT_VERSION = ([^;]+);/g)].map((match) => match[1]);

if (marketingMatches.length !== 2 || marketingMatches.some((value) => value !== expectedMarketingVersion)) {
  failures.push(`Expected two MARKETING_VERSION entries set to ${expectedMarketingVersion}; got ${marketingMatches.join(', ') || 'none'}`);
}

if (buildMatches.length !== 2 || buildMatches.some((value) => value !== expectedBuildNumber)) {
  failures.push(`Expected two CURRENT_PROJECT_VERSION entries set to ${expectedBuildNumber}; got ${buildMatches.join(', ') || 'none'}`);
}

const typesText = await fs.readFile(typesFile, 'utf8');
if (!typesText.includes(`export const APP_VERSION = '${expectedMarketingVersion}';`)) {
  failures.push(`Expected APP_VERSION to be ${expectedMarketingVersion}`);
}

const pageText = await fs.readFile(pageFile, 'utf8');
if (!pageText.includes('version: APP_VERSION,')) {
  failures.push('Expected exportProgress to use APP_VERSION instead of a hard-coded release string');
}

if (failures.length > 0) {
  console.error(`iOS release metadata validation failed with ${failures.length} issue(s):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`iOS release metadata validation passed: ${expectedMarketingVersion} (${expectedBuildNumber}).`);
