# Keep Watch - Docker Setup

This document explains how to use the Docker-based setup for the Keep Watch application.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

1. Create a `.env` file in the root of the project with the following variables:

```
# Database
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=keepwatch

# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CACHE_TTL_HOURS=24
```

2. Start the application:

```bash
npm run docker:dev
```

## Available Commands

### Application Management

- **Start the application**: `npm run docker:dev`
- **Rebuild the application**: `npm run docker:dev:rebuild`
- **Stop all services**: `npm run docker:down`
- **Stop and remove volumes**: `npm run docker:clean`
- **Clean up Docker system**: `npm run docker:prune`

### Database Operations

- **Start only the PostgreSQL database**: `npm run db:start`
- **Stop the PostgreSQL database**: `npm run db:stop`
- **Setup the database (run migrations)**: `npm run db:setup`
- **Reset the database**: `npm run db:reset`

### Utility Functions

- **Reset YouTube cache**: `npm run youtube:reset-cache`
- **Run the demo**: `npm run demo`

## Services

The Docker Compose setup includes the following services:

### 1. app

The main application service that runs the Next.js application.

### 2. postgres

PostgreSQL database service for storing application data.

### 3. setup

A service that runs database migrations and then exits. Used for setting up the database.

### 4. demo

A service that runs the demo script to showcase the YouTube service functionality.

### 5. reset-cache

A service that resets the YouTube video cache to force a fresh load from the YouTube API.

## Development Workflow

1. Start the application: `npm run docker:dev`
2. Access the application at http://localhost:3000
3. Make changes to your code
4. The application will automatically reload with your changes

## Troubleshooting

### Database Connection Issues

If you're having trouble connecting to the database:

1. Make sure the PostgreSQL container is running: `docker ps`
2. Check PostgreSQL logs: `docker-compose logs postgres`
3. Verify your connection string in the environment variables

### Rebuilding the Application

If you need to force a rebuild of the application:

```bash
npm run docker:dev:rebuild
```

### Cleaning Up

To completely clean up your Docker environment:

```bash
npm run docker:clean
npm run docker:prune
```
