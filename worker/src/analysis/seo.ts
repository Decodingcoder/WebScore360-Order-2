import { CheerioAPI } from 'cheerio'
import { logger } from '../utils/logger'

interface SeoResult {
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
export function analyzeSeo($: CheerioAPI, url: string): SeoResult {
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
  const sitemapResult = { passed: false, score: 0, value: false } // This would require a separate HTTP request

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
