FROM node:18-alpine

# Add build arguments
ARG NODE_ENV=development
ARG ENV_FILE=.env.local

WORKDIR /app

# Install necessary tools for PostgreSQL client and other dependencies
RUN apk add --no-cache postgresql-client curl openssl openssl-dev

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package.json package-lock.json ./

RUN npm ci

# Copy Tailwind and PostCSS config files before generating Prisma client
COPY tailwind.config.ts postcss.config.mjs ./

# Generate Prisma client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Create and set permissions for entrypoint script
RUN echo '#!/bin/sh' > /usr/local/bin/docker-entrypoint.sh && \
    echo 'set -e' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '# Wait for PostgreSQL to be ready' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'MAX_RETRIES=30' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'RETRIES=0' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'until pg_isready -h postgres -p 5432 -U postgres || [ $RETRIES -eq $MAX_RETRIES ]; do' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '  echo "Waiting for postgres to be ready... ($RETRIES/$MAX_RETRIES)"' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '  RETRIES=$((RETRIES+1))' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '  sleep 1' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'done' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '# Check if we reached max retries' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'if [ $RETRIES -eq $MAX_RETRIES ]; then' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '  echo "Warning: PostgreSQL did not become ready in time, but will continue with DB setup anyway"' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'fi' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '# Try to run prisma migration/deploy' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'npx prisma migrate deploy || echo "Warning: Prisma migration failed, but continuing startup"' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '# Set environment variables for Next.js' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'export NODE_ENV=$NODE_ENV' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'export NEXT_TELEMETRY_DISABLED=1' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'export TAILWIND_MODE=watch' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'export NEXT_RUNTIME=nodejs' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '# Ensure the .next directory exists and is empty before starting' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'mkdir -p .next' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'rm -rf .next/cache .next/server .next/static' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '# Setup CSS processing' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'echo "Initializing Tailwind CSS..."' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'npx tailwindcss init -p' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '# Start Next.js server based on environment' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'if [ "$NODE_ENV" = "development" ]; then' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '  exec npm run dev' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'else' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '  exec npm start' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'fi' >> /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

# Set the environment variables for Next.js
ENV HOST=0.0.0.0 
ENV PORT=3000
ENV NODE_ENV=$NODE_ENV
ENV TAILWIND_MODE=watch
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_RUNTIME=nodejs

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"] 