FROM node:18-alpine

# Install system dependencies
RUN apk update && apk upgrade && \
  apk add --no-cache \
  redis \
  chromium \
  nss \
  freetype \
  freetype-dev \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  nodejs \
  yarn \
  dumb-init \
  # Required for puppeteer
  udev \
  ttf-opensans \
  font-noto-emoji

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
  CHROME_PATH=/usr/bin/chromium-browser \
  CHROME_BIN=/usr/bin/chromium-browser

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

# Test Chromium is working
RUN echo "Testing Chromium installation..." && \
  chromium-browser --version

# Expose API port
EXPOSE 3000

# Create a separate start script file
RUN printf '#!/bin/sh\necho "Starting Redis server..."\nredis-server --daemonize yes\necho "Starting WebScore360 worker..."\nnode /app/dist/index.js\n' > /app/start.sh && \
  chmod +x /app/start.sh && \
  cat /app/start.sh

# Command to run both Redis and the application
CMD ["/bin/sh", "/app/start.sh"] 