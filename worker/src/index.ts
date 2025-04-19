/// <reference types="express" />
import dotenv from 'dotenv'
import { logger } from './utils/logger'
import { processWebsiteAnalysis } from './queue/processor'
import { supabase } from './config/supabase'
import { v4 as uuidv4 } from 'uuid'

// Load environment variables
dotenv.config()

// Worker configuration
const POLLING_INTERVAL = 5000 // 5 seconds
const HEARTBEAT_INTERVAL = 30000 // 30 seconds
const MAX_RETRY_COUNT = 3 // Maximum number of retries for failed jobs
const STALLED_THRESHOLD_MINUTES = 5 // Jobs with no heartbeat for this many minutes are considered stalled

// Worker identification
const WORKER_ID = uuidv4()
let currentJobId: string | null = null
let isProcessing = false
let heartbeatInterval: NodeJS.Timeout | null = null

/**
 * Main function to start the worker
 */
async function main() {
  try {
    logger.info(
      `Starting WebScore360 worker service (ID: ${WORKER_ID}) in polling mode...`
    )

    // Start polling for new jobs
    startPolling()

    // Handle shutdown signals
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully')
      handleGracefulShutdown()
    })

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully')
      handleGracefulShutdown()
    })
  } catch (error) {
    logger.error('Failed to start worker service', { error })
    process.exit(1)
  }
}

/**
 * Handle graceful shutdown
 */
async function handleGracefulShutdown() {
  logger.info('Performing graceful shutdown...')

  // Stop the heartbeat timer
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
  }

  // If we're processing a job, mark it as pending again
  if (currentJobId) {
    try {
      await supabase
        .from('audits')
        .update({
          status: 'pending',
          processing_worker_id: null,
          processing_started_at: null,
          last_heartbeat: null,
        })
        .eq('id', currentJobId)

      logger.info(`Reset job ${currentJobId} to pending for future processing`)
    } catch (error) {
      logger.error(`Failed to reset job status during shutdown`, { error })
    }
  }

  process.exit(0)
}

/**
 * Start polling for new jobs
 */
function startPolling() {
  logger.info(
    `Starting to poll for new jobs every ${POLLING_INTERVAL / 1000} seconds`
  )

  // Initial poll
  pollForJobs()

  // Set up recurring polling
  setInterval(pollForJobs, POLLING_INTERVAL)

  // Also look for stalled jobs periodically
  setInterval(recoverStalledJobs, POLLING_INTERVAL * 2)
}

/**
 * Poll database for new jobs using FOR UPDATE SKIP LOCKED
 */
async function pollForJobs() {
  // Skip if already processing a job
  if (isProcessing) {
    return
  }

  try {
    isProcessing = true

    // Use a transaction to safely lock the row
    const { data, error } = await supabase.rpc('claim_pending_audit', {
      worker_id: WORKER_ID,
    })

    if (error) {
      logger.error('Error claiming pending audit', { error })
      isProcessing = false
      return
    }

    // Process the job if found
    if (data && data.id) {
      const audit = data
      currentJobId = audit.id

      logger.info(`Claimed audit ${audit.id} for ${audit.website_url}`)

      // Start heartbeat for this job
      startHeartbeat(audit.id)

      // Process the job
      try {
        await processWebsiteAnalysis({
          data: {
            auditId: audit.id,
            websiteUrl: audit.website_url,
            userEmail: audit.requested_email,
            userId: audit.user_id,
          },
          id: audit.id,
        } as any)

        logger.info(`Completed processing audit: ${audit.id}`)
      } catch (error) {
        logger.error(`Error processing audit ${audit.id}`, { error })

        // Update status to failed if max retries reached
        await supabase
          .from('audits')
          .update({
            status:
              audit.retry_count >= MAX_RETRY_COUNT - 1 ? 'failed' : 'pending',
            retry_count: audit.retry_count + 1,
            processing_worker_id: null,
            processing_started_at: null,
            last_heartbeat: null,
          })
          .eq('id', audit.id)
      } finally {
        // Stop the heartbeat
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval)
          heartbeatInterval = null
        }

        currentJobId = null
      }
    } else {
      logger.debug('No pending audits found')
    }
  } catch (error) {
    logger.error('Error in job polling', { error })
  } finally {
    isProcessing = false
  }
}

/**
 * Start heartbeat for a job
 */
function startHeartbeat(auditId: string) {
  // Clear any existing heartbeat interval
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
  }

  // Function to update heartbeat
  const updateHeartbeat = async () => {
    try {
      const { error } = await supabase
        .from('audits')
        .update({
          last_heartbeat: new Date().toISOString(),
        })
        .eq('id', auditId)
        .eq('processing_worker_id', WORKER_ID)

      if (error) {
        logger.error(`Failed to update heartbeat for audit ${auditId}`, {
          error,
        })
      }
    } catch (error) {
      logger.error(`Error updating heartbeat`, { error })
    }
  }

  // Set up the interval
  heartbeatInterval = setInterval(updateHeartbeat, HEARTBEAT_INTERVAL)

  // Initial heartbeat
  updateHeartbeat()
}

/**
 * Recover stalled jobs
 */
async function recoverStalledJobs() {
  try {
    const stalledThreshold = new Date()
    stalledThreshold.setMinutes(
      stalledThreshold.getMinutes() - STALLED_THRESHOLD_MINUTES
    )

    // Get jobs that have stalled (processing but no heartbeat)
    const { data: stalledJobs, error } = await supabase
      .from('audits')
      .select('*')
      .eq('status', 'processing')
      .lt('last_heartbeat', stalledThreshold.toISOString())
      .lt('retry_count', MAX_RETRY_COUNT)

    if (error) {
      logger.error('Error finding stalled jobs', { error })
      return
    }

    // Update each stalled job individually to increment the retry count
    if (stalledJobs && stalledJobs.length > 0) {
      logger.info(`Found ${stalledJobs.length} stalled jobs to recover`)

      for (const job of stalledJobs) {
        const { error: updateError } = await supabase
          .from('audits')
          .update({
            status: 'pending',
            processing_worker_id: null,
            processing_started_at: null,
            last_heartbeat: null,
            retry_count: supabase.rpc('increment_retry_count', {
              current_count: job.retry_count,
            }),
          })
          .eq('id', job.id)

        if (updateError) {
          logger.error(`Error recovering stalled job ${job.id}`, {
            error: updateError,
          })
        } else {
          logger.info(
            `Recovered stalled job ${job.id}, retry count now ${
              job.retry_count + 1
            }`
          )
        }
      }
    }

    // Mark jobs as failed if they've reached the retry limit
    const { error: failedError } = await supabase
      .from('audits')
      .update({
        status: 'failed',
      })
      .eq('status', 'processing')
      .lt('last_heartbeat', stalledThreshold.toISOString())
      .gte('retry_count', MAX_RETRY_COUNT)

    if (failedError) {
      logger.error('Error marking jobs as failed', { error: failedError })
    }
  } catch (error) {
    logger.error('Error in stalled job recovery', { error })
  }
}

main().catch((err) => {
  logger.error('Unhandled error in main function', { error: err })
  process.exit(1)
})
