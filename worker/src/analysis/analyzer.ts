import axios from 'axios'
import * as cheerio from 'cheerio'
import { analyzePerformance } from './performance'
import { analyzeSeo } from './seo'
import { analyzeConversion } from './conversion'
import { analyzeBranding } from './branding'
import { analyzePresence } from './presence'
import { logger } from '../utils/logger'

export interface AnalysisResult {
  websiteUrl: string
  overallScore: number
  categoryScores: {
    performance: number
    seo: number
    conversion: number
    branding: number
    presence: number
  }
  categoryResults: {
    performance: any
    seo: any
    conversion: any
    branding: any
    presence: any
  }
  rawData: any
}

/**
 * Analyze a website and calculate scores
 */
export async function analyzeWebsite(url: string): Promise<AnalysisResult> {
  logger.info(`Starting analysis for ${url}`)

  try {
    // Normalize URL
    const normalizedUrl = normalizeUrl(url)

    // Fetch the website HTML content
    const { html, finalUrl } = await fetchWebsite(normalizedUrl)

    // Parse HTML with Cheerio
    const $ = cheerio.load(html)

    // Analyze each category
    const performanceResults = await analyzePerformance(finalUrl)
    const seoResults = analyzeSeo($, finalUrl)
    const conversionResults = analyzeConversion($)
    const brandingResults = analyzeBranding($, finalUrl)
    const presenceResults = analyzePresence($)

    // Calculate overall score (equally weighted average)
    const overallScore = Math.round(
      (performanceResults.score +
        seoResults.score +
        conversionResults.score +
        brandingResults.score +
        presenceResults.score) /
        5
    )

    // Prepare the analysis result
    const result: AnalysisResult = {
      websiteUrl: finalUrl,
      overallScore,
      categoryScores: {
        performance: performanceResults.score,
        seo: seoResults.score,
        conversion: conversionResults.score,
        branding: brandingResults.score,
        presence: presenceResults.score,
      },
      categoryResults: {
        performance: performanceResults,
        seo: seoResults,
        conversion: conversionResults,
        branding: brandingResults,
        presence: presenceResults,
      },
      rawData: {
        html: html.substring(0, 10000), // Store truncated HTML to avoid excessive storage
        url: finalUrl,
        timestamp: new Date().toISOString(),
      },
    }

    logger.info(`Analysis completed for ${url}`, {
      score: overallScore,
      categoryScores: result.categoryScores,
    })

    return result
  } catch (error) {
    logger.error(`Analysis failed for ${url}`, { error })
    throw new Error(
      `Failed to analyze website: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

/**
 * Normalize a URL by adding https:// if missing
 */
function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}

/**
 * Fetch a website and return its HTML content
 */
async function fetchWebsite(
  url: string
): Promise<{ html: string; finalUrl: string }> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'WebScore360 Audit Bot/1.0',
        Accept: 'text/html,application/xhtml+xml,application/xml',
      },
      maxRedirects: 5,
      timeout: 30000, // 30 seconds timeout
    })

    return {
      html: response.data,
      finalUrl: response.request.res.responseUrl || url, // Get the final URL after redirects
    }
  } catch (error) {
    logger.error(`Failed to fetch website ${url}`, { error })
    throw new Error(
      `Failed to fetch website: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}
