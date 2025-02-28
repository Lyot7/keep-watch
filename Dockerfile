FROM node:20-alpine AS builder

WORKDIR /app

# Install necessary tools for PostgreSQL client, OpenSSL, and healthcheck
RUN apk add --no-cache postgresql-client curl openssl openssl-dev

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./
RUN npm ci

# Generate Prisma client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application files
COPY . .

# Skip database-dependent build steps in production
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=true
ENV SKIP_BUILD_STATIC_GENERATION=true
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Install necessary tools for PostgreSQL client
RUN apk add --no-cache postgresql-client curl openssl openssl-dev

# Copy only necessary files from the builder stage
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/package.json ./package.json

# Create a startup script
RUN echo '#!/bin/sh' > /usr/local/bin/docker-entrypoint.sh && \
    echo 'echo "🔍 Waiting for PostgreSQL to be ready..."' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'until pg_isready -h postgres -p 5432 -U postgres; do' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '  echo "PostgreSQL not ready yet..."' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '  sleep 1' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'done' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'echo "✅ PostgreSQL is ready!"' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'echo "🔄 Setting up database..."' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'npx prisma migrate deploy || { echo "⚠️ Database setup failed but continuing..."; }' >> /usr/local/bin/docker-entrypoint.sh && \
    echo '' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'echo "🚀 Starting application..."' >> /usr/local/bin/docker-entrypoint.sh && \
    echo 'exec "$@"' >> /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

# Install required libraries for Prisma
ENV PRISMA_ENGINES_MIRROR=https://prisma-builds.s3.eu-central-1.amazonaws.com
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "server.js"] 