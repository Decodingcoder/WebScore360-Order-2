import axios from 'axios'
import https from 'https'
import { logger } from '../utils/logger'
import { fetchWithScraperFallback } from '../utils/fetchWithScraperFallback'

export interface PerformanceResult {
  score: number
  pageSpeedScore: number
  httpsScore: number
  checks: {
    pageSpeed: { score: number; passed: boolean; value: number }
    https: { score: number; passed: boolean }
  }
}

/**
 * Analyze website performance
 * - Page Speed (Mobile): Using Google PageSpeed Insights API (70% weight)
 * - HTTPS Security: Check if URL resolves to https:// with valid certificate (30% weight)
 */
export async function analyzePerformance(
  url: string
): Promise<PerformanceResult> {
  logger.info(`Analyzing performance for ${url}`)

  // Analyze Page Speed
  const pageSpeedResult = await analyzePageSpeed(url)

  // Check HTTPS
  const httpsResult = await checkHttps(url)

  // Calculate category score
  const categoryScore = Math.round(
    pageSpeedResult.score * 0.7 + httpsResult.score * 0.3
  )

  return {
    score: categoryScore,
    pageSpeedScore: pageSpeedResult.score,
    httpsScore: httpsResult.score,
    checks: {
      pageSpeed: pageSpeedResult,
      https: httpsResult,
    },
  }
}


/**
 * Get Page Speed score from Google PageSpeed Insights API
 */
async function analyzePageSpeed(
  url: string
): Promise<{ score: number; passed: boolean; value: number }> {
  try {
    const apiKey = process.env.PAGESPEED_API_KEY

    if (!apiKey) {
      logger.warn('PAGESPEED_API_KEY not set, returning default score')
      return { score: 50, passed: false, value: 50 }
    }

    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      url
    )}&strategy=mobile&key=${apiKey}`

    const response = await fetchWithScraperFallback(apiUrl)
    console.log(`[ScraperAPI Debug] URL: ${url} | Status: ${response.status}`)

    if (
      !response.data?.lighthouseResult?.categories?.performance
    ) {
      logger.warn(`Invalid response from PageSpeed API for ${url}`)
      return { score: 50, passed: false, value: 50 }
    }

    const score = Math.round(
      response.data.lighthouseResult.categories.performance.score * 100
    )

    const passed = score >= 80

    return { score, passed, value: score }
  } catch (error) {
    logger.error(`Error analyzing PageSpeed for ${url}`, { error })
    return { score: 50, passed: false, value: 50 }
  }
}


/**
 * Check if a URL uses HTTPS with a valid certificate
 */
async function checkHttps(
  url: string
): Promise<{ score: number; passed: boolean }> {
  try {
    const isHttps = url.startsWith('https://')

    if (!isHttps) {
      return { score: 0, passed: false }
    }

    const result = await new Promise<boolean>((resolve) => {
      const req = https.request(
        url,
        { method: 'HEAD', timeout: 10000 },
        (res) => {
          resolve(true)
        }
      )

      req.on('error', (err) => {
        logger.error(`HTTPS certificate check failed for ${url}`, {
          error: err,
        })
        resolve(false)
      })

      req.end()
    })

    return {
      score: result ? 100 : 0,
      passed: result,
    }
  } catch (error) {
    logger.error(`Error checking HTTPS for ${url}`, { error })
    return { score: 0, passed: false }
  }
}
