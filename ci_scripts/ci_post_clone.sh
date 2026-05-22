#!/bin/sh
set -eu

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$REPO_ROOT/my-study-app"

echo "Xcode Cloud post-clone: installing web dependencies"
cd "$APP_DIR"
npm ci

echo "Xcode Cloud post-clone: building static web assets"
npm run build

echo "Xcode Cloud post-clone: syncing Capacitor iOS project"
npx cap sync ios

echo "Xcode Cloud post-clone complete"
