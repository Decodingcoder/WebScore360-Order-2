import axios from 'axios'
import { logger } from './logger'

export async function fetchWithScraperFallback(url: string) {
  try {
    const response = await axios.get(url, { timeout: 60000 })
    return response
  } catch (err: any) {
    logger.warn(`Direct fetch failed for ${url}, trying ScraperAPI fallback...`, {
      error: err.message,
    })

    const scraperApiKey = process.env.SCRAPERAPI_KEY
    if (!scraperApiKey) {
      logger.error('SCRAPERAPI_KEY not set. Cannot retry via ScraperAPI.')
      throw err
    }

    const proxiedUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}`
    return axios.get(proxiedUrl, { timeout: 60000 })
  }
}
