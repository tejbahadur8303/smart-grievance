#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "🧪 [1/3] Running Backend test suite..."
cd "$ROOT_DIR/backend"
npm test

echo "🧪 [2/3] Analyzing and testing Citizen Mobile App..."
cd "$ROOT_DIR/apps/citizen_flutter"
flutter analyze
flutter test

echo "🧪 [3/3] Analyzing and testing Worker Mobile App..."
cd "$ROOT_DIR/apps/worker_flutter"
flutter analyze
flutter test

echo "🎉 All tests and static checks passed successfully across the entire monorepo!"

