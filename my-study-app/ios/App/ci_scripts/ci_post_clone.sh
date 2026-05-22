#!/bin/sh
set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

echo "Xcode Cloud post-clone: app directory is $APP_DIR"
cd "$APP_DIR"

echo "Xcode Cloud post-clone: installing web dependencies"
npm ci

echo "Xcode Cloud post-clone: building static web assets"
npm run build

echo "Xcode Cloud post-clone: syncing Capacitor iOS project"
npx cap sync ios

echo "Xcode Cloud post-clone complete"
