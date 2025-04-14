# WebScore360

WebScore360 is a tool that analyzes a website homepage, generates a score and basic category insights, delivers a PDF report via email, and provides a simple dashboard accessible via Google Sign-in.

## Setup

### Prerequisites
- Docker
- Supabase CLI
- Node.js

### Local Development

1. **Start Supabase**:
   ```
   supabase start
   ```

2. **Access Supabase Studio**:
   Open [http://127.0.0.1:54323](http://127.0.0.1:54323) in your browser.

3. **Run frontend**:
   ```
   cd frontend
   npm install
   npm run dev
   ```

4. **Run worker**:
   ```
   cd worker
   npm install
   npm run dev
   ```

### Environment Variables

The project uses two sets of environment variables:

- Frontend: `frontend/.env.local`
- Worker: `worker/.env`

Make sure to update these files with the appropriate values for your environment.

### Database Schema

The Supabase database includes the following main tables:

1. **profiles**: Stores user profile information.
2. **audits**: Stores website analysis results.

These tables are created automatically when you run Supabase migrations.

### Authentication

The application uses Supabase Auth with Google Sign-In for authentication.

### Storage

PDF reports are stored in Supabase Storage in the 'reports' bucket. This bucket is created automatically when you run the migrations. The worker service handles the generation of PDFs and uploads them to Supabase Storage.

## Development

To make changes to the database schema:

1. Create a new migration:
   ```
   supabase migration new my_migration_name
   ```

2. Edit the migration file in `supabase/migrations`.

3. Apply the migration:
   ```
   supabase migration up
   ```

## Stack

- **Frontend**: Next.js
- **Backend**: Supabase (Authentication, Database), Render Background Worker (Node.js for Analysis)
- **Message Queue**: Redis
- **PDF Generation**: Node.js library
- **External APIs**: Google PageSpeed Insights API
- **Storage**: Supabase Storage (for PDF reports) 