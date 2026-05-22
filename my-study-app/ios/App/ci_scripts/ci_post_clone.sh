#!/bin/sh
set -eu

export HOMEBREW_NO_AUTO_UPDATE=1
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

echo "Xcode Cloud post-clone: app directory is $APP_DIR"
echo "Xcode Cloud post-clone: initial PATH is $PATH"

if ! command -v npm >/dev/null 2>&1; then
  echo "Xcode Cloud post-clone: npm not found; installing Node.js with Homebrew"
  brew install node
fi

NODE_BIN="$(command -v node)"
NPM_BIN="$(command -v npm)"
NPX_BIN="$(command -v npx)"

echo "Xcode Cloud post-clone: node at $NODE_BIN"
echo "Xcode Cloud post-clone: npm at $NPM_BIN"
echo "Xcode Cloud post-clone: npx at $NPX_BIN"
node --version
npm --version

cd "$APP_DIR"

echo "Xcode Cloud post-clone: installing web dependencies"
npm ci

echo "Xcode Cloud post-clone: building static web assets"
npm run build

echo "Xcode Cloud post-clone: syncing Capacitor iOS project"
npx cap sync ios

echo "Xcode Cloud post-clone complete"
