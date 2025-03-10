# Stop all containers
docker-compose down

# Remove the postgres volume to start fresh
docker volume rm keepwatch_keepwatch-postgres-data

# Start all services
docker-compose up -d

Write-Host "Database reset complete! The application is now running." 