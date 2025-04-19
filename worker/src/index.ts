import dotenv from 'dotenv'
import { setupQueue } from './queue/setup'
import { logger } from './utils/logger'
import express from 'express'
import bodyParser from 'body-parser'

// Load environment variables
dotenv.config()

// API key for authentication
const API_KEY = process.env.WORKER_API_KEY || 'default-api-key'

/**
 * Main function to start the worker
 */
async function main() {
  try {
    logger.info('Starting WebScore360 worker service...')

    // Setup the Redis queue and start processing jobs
    const queue = await setupQueue()

    logger.info('Worker service is running and processing jobs')

    // Setup Express API server
    const app = express()
    app.use(bodyParser.json())

    // Simple API key authentication middleware
    const authenticate = (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const apiKey = req.headers['x-api-key']
      if (!apiKey || apiKey !== API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
      next()
    }

    // API endpoint to add jobs to the queue
    app.post('/api/jobs', authenticate, async (req, res) => {
      try {
        const { auditId, websiteUrl, userEmail, userId } = req.body

        // Validate required fields
        if (!auditId || !websiteUrl || !userEmail) {
          return res.status(400).json({ error: 'Missing required fields' })
        }

        // Add job to queue
        await queue.add({
          websiteUrl,
          userEmail,
          userId,
          auditId,
        })

        logger.info(`Job added to queue for audit ${auditId}`)
        res.status(200).json({ success: true })
      } catch (error) {
        logger.error('Error adding job to queue', { error })
        res.status(500).json({ error: 'Failed to add job to queue' })
      }
    })

    // Start API server
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
      logger.info(`API server listening on port ${PORT}`)
    })

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
