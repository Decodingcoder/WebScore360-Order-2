FROM node:18-alpine

# Install Redis
RUN apk add --no-cache redis

# Set up working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.json* ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Create startup script
RUN echo '#!/bin/sh\nredis-server --daemonize yes\nnode dist/index.js' > /app/start.sh && \
  chmod +x /app/start.sh

# Command to run both Redis and the application
CMD ["/app/start.sh"] 