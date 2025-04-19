# WebScore360 Polling Architecture

This document describes the robust polling architecture implemented for the WebScore360 website analysis service.

## Overview

The WebScore360 analysis system now uses a database-driven polling architecture instead of HTTP webhooks. This architecture provides:

- Improved reliability with automatic recovery from failures
- Better handling of concurrent workers and race conditions
- No need for publicly accessible worker endpoints
- Automatic retry mechanism for failed jobs

## How It Works

1. **Job Creation**:
   - When a user clicks "Analyze" on the dashboard, a new audit record is inserted into the database with `status = 'pending'`
   - No webhook or edge function is needed - the worker polls the database for pending jobs

2. **Job Processing**:
   - Worker polls the database every 5 seconds using `FOR UPDATE SKIP LOCKED` to safely claim a job
   - Worker updates status to `'processing'` and sets worker ID, timestamp, and heartbeat
   - Job is processed and audit results are saved to the database
   - After completion, status is set to `'completed'` or `'failed'`

3. **Heartbeat Mechanism**:
   - While processing, the worker updates the `last_heartbeat` timestamp every 30 seconds
   - This allows detection of stalled or crashed worker processes

4. **Recovery**:
   - Jobs with no heartbeat for 5+ minutes are considered stalled
   - Stalled jobs are automatically reset to `'pending'` with an incremented retry count
   - After 3 failed attempts, jobs are marked as `'failed'`

5. **Graceful Shutdown**:
   - On worker shutdown, any in-progress job is reset to `'pending'`
   - This ensures no jobs are lost when workers restart or scale

## Database Schema Changes

New columns added to the `audits` table:
- `processing_started_at`: Timestamp when job processing began
- `processing_worker_id`: Unique ID of the worker processing this job
- `last_heartbeat`: Timestamp for the most recent worker heartbeat
- `retry_count`: Number of times this job has been retried

## Benefits

- **Resilience**: Automatically recovers from worker crashes or stalled jobs
- **Scalability**: Multiple workers can safely process jobs concurrently 
- **Simplicity**: No need for complex webhook infrastructure
- **Reliability**: Jobs are never lost, even during deployments
- **Observability**: Tracking of job status, retry counts, and processing time

## Trade-offs

- **Latency**: 5-second polling interval introduces slight delay
- **Database Load**: Regular polling increases database query load
- **Complexity**: More complex worker implementation with heartbeats and recovery

## Future Improvements

- Exponential backoff for jobs that repeatedly fail
- Job prioritization based on custom rules
- More detailed error tracking and reporting
- Performance metrics and monitoring dashboard 