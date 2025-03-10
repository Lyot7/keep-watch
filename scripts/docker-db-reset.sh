#!/bin/sh

# Stop all containers
docker-compose down

# Remove the postgres volume to start fresh
docker volume rm keepwatch_keepwatch-postgres-data

# Start the database and wait for it to be ready
docker-compose up -d postgres

# Wait for postgres to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Run migrations and seed the database
docker-compose run --rm dbsetup sh -c "npx prisma migrate reset --force && node scripts/seed-channels.js"

# Start the application
docker-compose up -d app

echo "Database reset complete! The application is now running." 