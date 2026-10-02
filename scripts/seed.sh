#!/bin/bash
set -e

echo "🌱 Seeding Smart Village Grievance Database..."
cd "$(dirname "$0")/../backend"
npm run seed
echo "✅ Database seeded successfully!"
