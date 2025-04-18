#!/bin/bash
set -e

echo "Building and deploying WebScore360 worker..."

# Build the Docker images
echo "Building Docker images..."
docker-compose build

# Start the services
echo "Starting services..."
docker-compose up -d

echo "Deployment complete! Worker is running with Redis."
echo "To check logs, run: docker-compose logs -f"
echo "To stop the services, run: docker-compose down" 