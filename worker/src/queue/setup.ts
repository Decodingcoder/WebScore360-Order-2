import Bull from 'bull'
import dotenv from 'dotenv'
import { processWebsiteAnalysis } from './processor'
import { logger } from '../utils/logger'

// Load environment variables
dotenv.config()

// Queue name
const ANALYSIS_QUEUE = 'website-analysis'

/**
 * Sets up the Redis queue for job processing
 */
export async function setupQueue(): Promise<Bull.Queue> {
  // Use REDIS_URL from environment, or fall back to local Redis if running in the same container
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

  logger.info(`Connecting to Redis at ${redisUrl.split('@').pop()}`)

  // Create Bull queue
  const queue = new Bull(ANALYSIS_QUEUE, redisUrl, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  })

  // Process jobs
  queue.process(processWebsiteAnalysis)

  // Event listeners
  queue.on('error', (error) => {
    logger.error('Queue error', { error })
  })

  queue.on('failed', (job, error) => {
    logger.error(`Job ${job.id} failed`, { error })
  })

  queue.on('completed', (job) => {
    logger.info(`Job ${job.id} completed successfully`)
  })

  return queue
}
