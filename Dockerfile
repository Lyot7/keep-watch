FROM node:18-alpine

# Install dependencies needed for the app
RUN apk add --no-cache bash curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Set environment variables
ENV NODE_ENV=development

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Start command will be specified in docker-compose.yml
CMD ["npm", "run", "start"] 