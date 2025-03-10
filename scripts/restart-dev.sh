#!/bin/bash

# Restart Development Environment Script
echo "========= RESTARTING DEVELOPMENT ENVIRONMENT ========="

# Stop any running containers
echo "Stopping any running Docker containers..."
docker-compose -f docker-compose.dev.yml down

# Clean temporary files
echo "Cleaning temporary files..."
rm -rf .next/cache 2>/dev/null || true

# Start the environment with the new configuration
echo "Starting development environment with database setup..."
docker-compose -f docker-compose.dev.yml up --build

echo "Development environment restart complete!" 