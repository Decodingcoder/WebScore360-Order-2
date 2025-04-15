import dotenv from 'dotenv'
import { setupQueue } from './queue/setup'
import { logger } from './utils/logger'

// Load environment variables
dotenv.config()

/**
 * Main function to start the worker
 */
async function main() {
  try {
    logger.info('Starting WebScore360 worker service...')

    // Setup the Redis queue and start processing jobs
    const queue = await setupQueue()

    logger.info('Worker service is running and processing jobs')

    // Handle shutdown signals
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully')
      await queue.close()
      process.exit(0)
    })

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully')
      await queue.close()
      process.exit(0)
    })
  } catch (error) {
    logger.error('Failed to start worker service', { error })
    process.exit(1)
  }
}

main().catch((err) => {
  logger.error('Unhandled error in main function', { error: err })
  process.exit(1)
})
