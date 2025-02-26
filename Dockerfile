FROM node:20-alpine

WORKDIR /app

# Install necessary tools for PostgreSQL client
RUN apk add --no-cache postgresql-client

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create a startup script that ensures the database is set up before starting the app
RUN echo '#!/bin/sh\n\
echo "🔍 Waiting for PostgreSQL to be ready..."\n\
until pg_isready -h postgres -p 5432 -U postgres; do\n\
  echo "PostgreSQL not ready yet..."\n\
  sleep 1\n\
done\n\
echo "✅ PostgreSQL is ready!"\n\
\n\
echo "🔄 Setting up database..."\n\
npm run db:setup || { echo "⚠️ Database setup failed but continuing..."; }\n\
\n\
echo "🚀 Starting application..."\n\
exec "$@"\n\
' > /app/docker-entrypoint.sh && chmod +x /app/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npm", "run", "dev"] 