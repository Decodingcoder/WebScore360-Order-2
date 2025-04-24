import axios from 'axios'
import * as cheerio from 'cheerio'
import { analyzePerformance } from './performance'
import { analyzeSeo } from './seo'
import { analyzeConversion } from './conversion'
import { analyzeBranding } from './branding'
import { analyzePresence } from './presence'
import { logger } from '../utils/logger'

// Assuming interfaces are defined correctly in each module
// We might need to import specific types if not globally available
import { PerformanceResult } from './performance'
import { SeoResult } from './seo'
import { ConversionResult } from './conversion'
import { BrandingResult } from './branding'
import { PresenceResult } from './presence'

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
    performance: PerformanceResult
    seo: SeoResult
    conversion: ConversionResult
    branding: BrandingResult
    presence: PresenceResult
  }
  rawData: {
    checks: Record<string, { passed: boolean; score: number; value?: any }>
    html_snippet: string
    final_url: string
    timestamp: string
  }
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
    const seoResults = await analyzeSeo($, finalUrl)
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
        // Combine checks from all categories into a flat structure
        checks: {
          // Performance Checks
          performance_page_speed_mobile: performanceResults.checks.pageSpeed,
          performance_https_security: performanceResults.checks.https,
          // SEO Checks
          seo_title_tag: seoResults.checks.titleTag,
          seo_meta_description: seoResults.checks.metaDescription,
          seo_h1_heading: seoResults.checks.h1Heading,
          seo_image_alt_text: seoResults.checks.imgAltText,
          seo_sitemap: seoResults.checks.sitemap,
          // Conversion Checks
          conversion_cta_buttons: conversionResults.checks.ctaButtons,
          conversion_form_presence: conversionResults.checks.formPresence,
          conversion_contact_method: conversionResults.checks.contactMethod,
          // Branding Checks
          branding_logo_presence: brandingResults.checks.logoPresence,
          branding_professional_domain:
            brandingResults.checks.professionalDomain,
          // Presence Checks
          presence_social_media_links: presenceResults.checks.socialMediaLinks,
          presence_google_presence: presenceResults.checks.googlePresence,
        },
        html_snippet: html.substring(0, 10000), // Store truncated HTML
        final_url: finalUrl,
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
