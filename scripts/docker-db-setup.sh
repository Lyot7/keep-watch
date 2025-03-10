#!/bin/bash

# Docker Database Setup Script
echo "========= DOCKER DATABASE SETUP ========="
echo "Setting up the database schema in Docker environment..."

# Ensure we're using the correct DATABASE_URL for Docker
export DATABASE_URL="postgresql://postgres:postgres@postgres:5432/keepwatch?schema=public&sslmode=prefer"
echo "Using connection string: postgresql://postgres:postgres@postgres:5432/keepwatch?schema=public&sslmode=prefer"

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
MAX_RETRIES=30
RETRIES=0

until pg_isready -h postgres -p 5432 -U postgres || [ $RETRIES -eq $MAX_RETRIES ]; do
  echo "Waiting for postgres to be ready... ($RETRIES/$MAX_RETRIES)"
  RETRIES=$((RETRIES+1))
  sleep 1
done

# Check if we reached max retries
if [ $RETRIES -eq $MAX_RETRIES ]; then
  echo "Warning: PostgreSQL did not become ready in time. Exiting."
  exit 1
fi

echo "PostgreSQL is now ready. Proceeding with database initialization."

# Try to create database if it doesn't exist
echo "Ensuring database exists..."
psql -h postgres -U postgres -c "SELECT 1 FROM pg_database WHERE datname = 'keepwatch'" | grep -q 1 || \
psql -h postgres -U postgres -c "CREATE DATABASE keepwatch"

# Generate Prisma client first
echo "Generating Prisma client..."
npx prisma generate

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Check if we need to seed basic data
echo "Checking if channels exist..."
HAS_CHANNELS=$(psql -h postgres -U postgres -d keepwatch -t -c "SELECT COUNT(*) FROM \"YoutubeChannel\"" | xargs)
if [ "$HAS_CHANNELS" = "0" ]; then
  echo "No channels found. Seeding initial data..."
  # Use node with ESM flag to run the seed script
  node --experimental-specifier-resolution=node scripts/seed-channels.js
fi

# Initialize VideoState table if necessary
echo "Checking if video states exist..."
HAS_STATES=$(psql -h postgres -U postgres -d keepwatch -t -c "SELECT COUNT(*) FROM \"VideoState\"" | xargs)
if [ "$HAS_STATES" = "0" ]; then
  echo "Initializing VideoState table with default states..."
  psql -h postgres -U postgres -d keepwatch -c "INSERT INTO \"VideoState\" (id, name, description, color) VALUES
    ('new', 'New', 'Newly discovered videos', 'blue'),
    ('watched', 'Watched', 'Videos you have watched', 'green'),
    ('ignored', 'Ignored', 'Videos you don''t want to watch', 'gray'),
    ('bookmark', 'Bookmarked', 'Videos you want to watch later', 'yellow')"
fi

# Run a test query to verify everything works
echo "Running test query to verify database setup..."
psql -h postgres -U postgres -d keepwatch -c "SELECT COUNT(*) FROM \"YoutubeChannel\""

echo "Database setup complete!" 