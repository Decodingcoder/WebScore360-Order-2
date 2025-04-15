# WebScore360 Worker

This is the background worker service for WebScore360, responsible for:

1. Processing website analysis requests from a Redis queue
2. Performing detailed website analysis
3. Generating PDF reports
4. Sending results via email
5. Updating the database with analysis results

## Prerequisites

- Node.js (v16+)
- Redis server
- Supabase project
- Google PageSpeed Insights API key
- SMTP server for email delivery

## Environment Variables

The worker uses the following environment variables (see `.env` file):

```
# Supabase connection
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Redis connection (for message queue)
REDIS_URL=

# Google PageSpeed Insights API
PAGESPEED_API_KEY=

# Email settings
EMAIL_FROM=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

# Storage for PDF reports - using Supabase Storage
STORAGE_TYPE=supabase
STORAGE_BUCKET=reports
```

## Installation

1. Install dependencies:

```bash
pnpm install
```

2. Build the project:

```bash
pnpm build
```

## Running the Worker

For development:

```bash
pnpm dev
```

For production:

```bash
pnpm start
```

## Architecture

The worker follows a modular architecture:

- `src/index.ts` - Main entry point
- `src/queue/` - Redis queue setup and job processing
- `src/analysis/` - Website analysis modules for each scoring category
- `src/pdf/` - PDF report generation
- `src/services/` - Email and other external services
- `src/utils/` - Utility functions
- `src/config/` - Configuration for external services

## Analysis Categories

The worker analyzes websites in 5 main categories:

1. Performance - PageSpeed score and HTTPS security
2. SEO - Title, meta descriptions, headings, etc.
3. Conversion - CTAs, forms, contact methods
4. Branding - Logo presence and domain professionalism
5. Online Presence - Social media links and Google Business profile

## Deployment

The worker is designed to be deployed as a background worker on Render, but can be adapted for other platforms like AWS, Heroku, or Docker containers. 