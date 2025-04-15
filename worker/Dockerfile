FROM node:18-alpine

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

# Command to run the application
CMD ["node", "dist/index.js"] 