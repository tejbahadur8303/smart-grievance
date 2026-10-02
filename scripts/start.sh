#!/bin/bash
set -e

echo "🚀 Starting Smart Grievance Redressal Backend & Dashboards..."
DIR="$(cd "$(dirname "$0")/.." && pwd)"


echo "Starting Backend API on http://localhost:5002..."
(cd "$DIR/backend" && npm run dev) &

BACKEND_PID=$!

echo "Starting District Admin Portal on http://localhost:3000..."
(cd "$DIR/apps/admin_web" && npm run dev) &
ADMIN_PID=$!

echo "Starting Panchayat Officer Portal on http://localhost:3001..."
(cd "$DIR/apps/panchayat_web" && npm run dev) &
PANCHAYAT_PID=$!

trap "kill $BACKEND_PID $ADMIN_PID $PANCHAYAT_PID" EXIT
wait
