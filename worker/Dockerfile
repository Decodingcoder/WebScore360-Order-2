FROM node:18-alpine

# Install Redis
RUN apk add --no-cache redis

# Set up working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Expose API port
EXPOSE 3000

# Create a separate start script file instead of using echo
RUN printf '#!/bin/sh\necho "Starting Redis server..."\nredis-server --daemonize yes\necho "Starting WebScore360 worker..."\nnode /app/dist/index.js\n' > /app/start.sh && \
  chmod +x /app/start.sh && \
  cat /app/start.sh

# Command to run both Redis and the application
CMD ["/bin/sh", "/app/start.sh"] 