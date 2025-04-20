-- Drop the trigger first
DROP TRIGGER IF EXISTS on_audit_created ON audits;

-- Then drop the function
DROP FUNCTION IF EXISTS handle_new_audit();

-- Add new columns to the audits table for robust polling
ALTER TABLE audits ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS processing_worker_id TEXT;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMP WITH TIME ZONE;
ALTER TABLE audits ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

-- Update status check constraint to include more statuses
ALTER TABLE audits DROP CONSTRAINT IF EXISTS audits_status_check;
ALTER TABLE audits ADD CONSTRAINT audits_status_check 
  CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'stalled'));

-- Add an index to improve query performance
CREATE INDEX IF NOT EXISTS idx_audits_status_created_at ON audits(status, created_at);

-- Add a comment explaining the changes
COMMENT ON TABLE audits IS 'Audits are processed via polling with robust handling of race conditions'; 