import { CheerioAPI } from 'cheerio'
import { logger } from '../utils/logger'
import axios from 'axios'

export interface SeoResult {
  score: number
  checks: {
    titleTag: { passed: boolean; score: number; value: string | null }
    metaDescription: { passed: boolean; score: number; value: string | null }
    h1Heading: { passed: boolean; score: number; value: number }
    imgAltText: { passed: boolean; score: number; value: number }
    sitemap: { passed: boolean; score: number; value: boolean }
  }
}

/**
 * Analyze SEO elements of a website
 * - Title Tag: Existence check
 * - Meta Description: Existence check
 * - H1 Heading: Exactly one H1 tag check
 * - Image Alt Text: >= 80% of images have alt text
 * - Sitemap: /sitemap.xml exists
 */
export async function analyzeSeo(
  $: CheerioAPI,
  url: string
): Promise<SeoResult> {
  logger.info(`Analyzing SEO for ${url}`)

  // Check title tag
  const titleResult = checkTitleTag($)

  // Check meta description
  const metaDescriptionResult = checkMetaDescription($)

  // Check H1 heading
  const h1Result = checkH1Heading($)

  // Check image alt text
  const imgAltResult = checkImageAltText($)

  // Check sitemap
  const sitemapResult = await checkSitemap(url)

  // Calculate overall SEO score (average of 5 checks)
  const seoScore = Math.round(
    (titleResult.score +
      metaDescriptionResult.score +
      h1Result.score +
      imgAltResult.score +
      sitemapResult.score) /
      5
  )

  return {
    score: seoScore,
    checks: {
      titleTag: titleResult,
      metaDescription: metaDescriptionResult,
      h1Heading: h1Result,
      imgAltText: imgAltResult,
      sitemap: sitemapResult,
    },
  }
}

/**
 * Check if title tag exists and is not empty
 */
function checkTitleTag($: CheerioAPI): {
  passed: boolean
  score: number
  value: string | null
} {
  const title = $('title').text().trim()

  const passed = title !== ''
  const score = passed ? 100 : 0

  return {
    passed,
    score,
    value: title || null,
  }
}

/**
 * Check if meta description exists and is not empty
 */
function checkMetaDescription($: CheerioAPI): {
  passed: boolean
  score: number
  value: string | null
} {
  const metaDescription = $('meta[name="description"]').attr('content')?.trim()

  const passed = !!metaDescription
  const score = passed ? 100 : 0

  return {
    passed,
    score,
    value: metaDescription || null,
  }
}

/**
 * Check if exactly one H1 tag exists
 */
function checkH1Heading($: CheerioAPI): {
  passed: boolean
  score: number
  value: number
} {
  const h1Count = $('h1').length

  const passed = h1Count === 1
  const score = passed ? 100 : 0

  return {
    passed,
    score,
    value: h1Count,
  }
}

/**
 * Check if >= 80% of images have alt text
 */
function checkImageAltText($: CheerioAPI): {
  passed: boolean
  score: number
  value: number
} {
  const images = $('img')
  const totalImages = images.length

  if (totalImages === 0) {
    return {
      passed: true,
      score: 100,
      value: 100,
    }
  }

  let imagesWithAlt = 0

  images.each((_, img) => {
    const alt = $(img).attr('alt')
    if (alt && alt.trim() !== '') {
      imagesWithAlt++
    }
  })

  const percentage = Math.round((imagesWithAlt / totalImages) * 100)
  const passed = percentage >= 80
  const score = passed ? 100 : 0

  return {
    passed,
    score,
    value: percentage,
  }
}

/**
 * Check if sitemap.xml returns a 200 OK status (HEAD request)
 */
async function checkSitemap(
  baseUrl: string
): Promise<{ passed: boolean; score: number; value: boolean }> {
  try {
    const sitemapUrl = new URL('/sitemap.xml', baseUrl).toString()
    const response = await axios.head(sitemapUrl, {
      timeout: 5000, // 5 second timeout
      validateStatus: function (status) {
        // Accept any status code, we check specifically for 200
        return status >= 200 && status < 600
      },
    })

    const passed = response.status === 200
    const score = passed ? 100 : 0
    logger.info(`Sitemap check for ${sitemapUrl}: Status ${response.status}`)
    return { passed, score, value: passed }
  } catch (error: any) {
    // Log different levels based on expected errors vs unexpected
    if (axios.isAxiosError(error) && error.response) {
      // Common case: 404 Not Found etc.
      logger.warn(
        `Sitemap check failed for ${baseUrl}/sitemap.xml: Status ${error.response.status}`
      )
    } else {
      // Network error, timeout, etc.
      logger.error(`Error checking sitemap for ${baseUrl}/sitemap.xml`, {
        error,
      })
    }
    return { passed: false, score: 0, value: false }
  }
}
