import { CheerioAPI } from 'cheerio'
import { logger } from '../utils/logger'

interface PresenceResult {
  score: number
  checks: {
    socialMediaLinks: { passed: boolean; score: number; value: number }
    googlePresence: { passed: boolean; score: number; value: boolean }
    contentPresence: { passed: boolean; score: number; value: boolean }
  }
}

/**
 * Analyze online presence of a website
 * - Social Media Links: Check for links to social media platforms
 * - Google Business Profile: Look for Google Business links
 * - Content Presence: Check for blog or article sections
 */
export function analyzePresence($: CheerioAPI): PresenceResult {
  logger.info('Analyzing online presence')

  // Check social media presence
  const socialResult = checkSocialMedia($)

  // Check Google Business Profile
  const googleResult = checkGoogleBusiness($)

  // Check content presence
  const contentResult = checkContentPresence($)

  // Calculate overall presence score (equal weight)
  const presenceScore = Math.round(
    (socialResult.score + googleResult.score + contentResult.score) / 3
  )

  return {
    score: presenceScore,
    checks: {
      socialMediaLinks: socialResult,
      googlePresence: googleResult,
      contentPresence: contentResult,
    },
  }
}

/**
 * Check for social media links
 */
function checkSocialMedia($: CheerioAPI): {
  passed: boolean
  score: number
  value: number
} {
  // List of common social media platforms
  const socialPlatforms = [
    { name: 'facebook', patterns: ['facebook.com', 'fb.com', 'fb.me'] },
    { name: 'twitter', patterns: ['twitter.com', 'x.com', 't.co'] },
    { name: 'instagram', patterns: ['instagram.com', 'instagr.am'] },
    { name: 'linkedin', patterns: ['linkedin.com', 'lnkd.in'] },
    { name: 'youtube', patterns: ['youtube.com', 'youtu.be'] },
    { name: 'pinterest', patterns: ['pinterest.com', 'pin.it'] },
    { name: 'tiktok', patterns: ['tiktok.com'] },
    { name: 'snapchat', patterns: ['snapchat.com'] },
    { name: 'reddit', patterns: ['reddit.com'] },
    { name: 'medium', patterns: ['medium.com'] },
  ]

  // Track found platforms
  const foundPlatforms = new Set<string>()

  // Check all links on the page
  $('a').each((_, link) => {
    const href = $(link).attr('href')?.toLowerCase() || ''

    // Skip empty links
    if (!href) return

    // Check against each platform's patterns
    socialPlatforms.forEach((platform) => {
      if (platform.patterns.some((pattern) => href.includes(pattern))) {
        foundPlatforms.add(platform.name)
      }
    })

    // Also check link text and classes
    const linkText = $(link).text().toLowerCase()
    const linkClass = $(link).attr('class')?.toLowerCase() || ''

    socialPlatforms.forEach((platform) => {
      if (
        linkText.includes(platform.name) ||
        linkClass.includes(platform.name)
      ) {
        foundPlatforms.add(platform.name)
      }
    })
  })

  // Also check for social icons
  $('i[class*="fa-"], i[class*="icon-"], span[class*="icon-"]').each(
    (_, icon) => {
      const iconClass = $(icon).attr('class')?.toLowerCase() || ''

      socialPlatforms.forEach((platform) => {
        if (iconClass.includes(platform.name)) {
          foundPlatforms.add(platform.name)
        }
      })
    }
  )

  // Calculate score based on number of found platforms
  const foundCount = foundPlatforms.size

  // Score based on requirements: Pass if >= 2, Partial if 1, Fail if none
  let score
  if (foundCount >= 2) {
    score = 100 // Pass
  } else if (foundCount === 1) {
    score = 50 // Partial
  } else {
    score = 0 // Fail
  }

  const passed = foundCount >= 2

  return {
    passed,
    score,
    value: foundCount,
  }
}

/**
 * Check for Google Business Profile link
 */
function checkGoogleBusiness($: CheerioAPI): {
  passed: boolean
  score: number
  value: boolean
} {
  let hasGoogleBusinessLink = false

  // Check for Google Maps links
  $('a').each((_, link) => {
    const href = $(link).attr('href')?.toLowerCase() || ''

    // Check for maps.google.com links
    if (href.includes('maps.google.com') || href.includes('goo.gl/maps')) {
      hasGoogleBusinessLink = true
      return false // Break each loop
    }

    // Check for Google search links with "?q="
    if (href.includes('google.com/search?q=')) {
      hasGoogleBusinessLink = true
      return false // Break each loop
    }
  })

  // Also check for common Google Business text patterns
  const gbpTextPatterns = [
    'find us on google',
    'google business',
    'google maps',
    'directions',
    'our location',
  ]

  $('a').each((_, link) => {
    const linkText = $(link).text().toLowerCase()

    if (gbpTextPatterns.some((pattern) => linkText.includes(pattern))) {
      hasGoogleBusinessLink = true
      return false // Break each loop
    }
  })

  const passed = hasGoogleBusinessLink
  const score = passed ? 100 : 0

  return {
    passed,
    score,
    value: passed,
  }
}

/**
 * Check for blog or content sections
 */
function checkContentPresence($: CheerioAPI): {
  passed: boolean
  score: number
  value: boolean
} {
  // Check for blog section
  const blogSectionSelectors = [
    // Common blog section selectors
    'section.blog',
    'div.blog',
    '#blog',
    '.blog-posts',
    '.articles',
    '.news',
    // Common blog link selectors
    'a[href*="blog"]',
    'a[href*="articles"]',
    'a[href*="news"]',
    'a:contains("Blog")',
    'a:contains("Articles")',
    'a:contains("News")',
  ]

  // Check each selector
  for (const selector of blogSectionSelectors) {
    try {
      if ($(selector).length > 0) {
        return {
          passed: true,
          score: 100,
          value: true,
        }
      }
    } catch (e) {
      // Some complex selectors might not be supported by Cheerio
      // Just continue if there's an error
      continue
    }
  }

  // Look for heading elements containing blog/content related words
  const contentHeadings = $('h1, h2, h3, h4').filter((_, el) => {
    const text = $(el).text().toLowerCase()
    return (
      text.includes('blog') ||
      text.includes('article') ||
      text.includes('news') ||
      text.includes('post') ||
      text.includes('content') ||
      text.includes('resource')
    )
  })

  if (contentHeadings.length > 0) {
    return {
      passed: true,
      score: 100,
      value: true,
    }
  }

  // Look for recent dates, which often indicate fresh content
  const datePatterns = [
    /\d{1,2}\/\d{1,2}\/\d{2,4}/, // MM/DD/YYYY
    /\d{4}-\d{1,2}-\d{1,2}/, // YYYY-MM-DD
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2},?\s+\d{4}/i, // Month DD, YYYY
    /\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}/i, // DD Month YYYY
  ]

  let hasDateElements = false
  $('*').each((_, el) => {
    const text = $(el).text()
    for (const pattern of datePatterns) {
      if (pattern.test(text)) {
        hasDateElements = true
        return false // Break each loop
      }
    }
  })

  // If dates were found, it's likely a content-rich site
  if (hasDateElements) {
    return {
      passed: true,
      score: 100,
      value: true,
    }
  }

  return {
    passed: false,
    score: 0,
    value: false,
  }
}
