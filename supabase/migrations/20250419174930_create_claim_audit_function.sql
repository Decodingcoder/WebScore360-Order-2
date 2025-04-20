-- Create a function to safely claim a pending audit using FOR UPDATE SKIP LOCKED
CREATE OR REPLACE FUNCTION claim_pending_audit(worker_id TEXT)
RETURNS SETOF audits
LANGUAGE plpgsql
AS $$
DECLARE
  claimed_audit audits;
BEGIN
  -- Find the oldest pending audit and lock it
  SELECT *
  INTO claimed_audit
  FROM audits
  WHERE status = 'pending'
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  -- If we found an audit, update it
  IF FOUND THEN
    UPDATE audits
    SET 
      status = 'processing',
      processing_worker_id = worker_id,
      processing_started_at = NOW(),
      last_heartbeat = NOW()
    WHERE id = claimed_audit.id;
    
    -- Return the updated audit
    RETURN NEXT claimed_audit;
  END IF;
  
  RETURN;
END;
$$;