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
  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    logger.error('Redis URL not found in environment variables')
    throw new Error('REDIS_URL environment variable is required')
  }

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
