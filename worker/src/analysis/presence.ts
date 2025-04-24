import { CheerioAPI } from 'cheerio'
import { logger } from '../utils/logger'

export interface PresenceResult {
  score: number
  checks: {
    socialMediaLinks: { passed: boolean; score: number; value: number }
    googlePresence: { passed: boolean; score: number; value: boolean }
  }
}

/**
 * Analyze online presence of a website
 * - Social Media Links: Check for links to social media platforms
 * - Google Business Profile: Look for Google Business links
 */
export function analyzePresence($: CheerioAPI): PresenceResult {
  logger.info('Analyzing online presence')

  // Check social media presence
  const socialResult = checkSocialMedia($)

  // Check Google Business Profile
  const googleResult = checkGoogleBusiness($)

  // Calculate overall presence score (average of 2 checks)
  const presenceScore = Math.round(
    (socialResult.score + googleResult.score) / 2
  )

  return {
    score: presenceScore,
    checks: {
      socialMediaLinks: socialResult,
      googlePresence: googleResult,
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
