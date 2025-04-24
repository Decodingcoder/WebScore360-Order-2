import { CheerioAPI } from 'cheerio'
import { logger } from '../utils/logger'

export interface BrandingResult {
  score: number
  checks: {
    logoPresence: { passed: boolean; score: number; value: boolean }
    professionalDomain: { passed: boolean; score: number; value: boolean }
  }
}

/**
 * Analyze branding basics of a website
 * - Logo Presence: Check for logo in header or top areas
 * - Professional Domain: Check if using custom domain vs free hosting
 */
export function analyzeBranding($: CheerioAPI, url: string): BrandingResult {
  logger.info(`Analyzing branding for ${url}`)

  // Check logo presence
  const logoResult = checkLogoPresence($)

  // Check professional domain
  const domainResult = checkProfessionalDomain(url)

  // Calculate overall branding score (average of 2 checks)
  const brandingScore = Math.round((logoResult.score + domainResult.score) / 2)

  return {
    score: brandingScore,
    checks: {
      logoPresence: logoResult,
      professionalDomain: domainResult,
    },
  }
}

/**
 * Check for logo presence in the header or top sections
 */
function checkLogoPresence($: CheerioAPI): {
  passed: boolean
  score: number
  value: boolean
} {
  // Look for common logo selectors
  const logoSelectors = [
    'header img',
    '.logo img',
    '#logo img',
    '[class*="logo"] img',
    '[id*="logo"] img',
    '.brand img',
    '.header img',
    '.navbar img',
    '.nav img',
    '.site-logo img',
  ]

  // Check each selector
  for (const selector of logoSelectors) {
    if ($(selector).length > 0) {
      return {
        passed: true,
        score: 100,
        value: true,
      }
    }
  }

  // Also check for SVG logos
  const svgSelectors = [
    'header svg',
    '.logo svg',
    '#logo svg',
    '[class*="logo"] svg',
    '[id*="logo"] svg',
  ]

  for (const selector of svgSelectors) {
    if ($(selector).length > 0) {
      return {
        passed: true,
        score: 100,
        value: true,
      }
    }
  }

  // Look for image with 'logo' in alt text or src
  const logoImages = $('img').filter((_, img) => {
    const alt = $(img).attr('alt')?.toLowerCase() || ''
    const src = $(img).attr('src')?.toLowerCase() || ''
    return alt.includes('logo') || src.includes('logo')
  })

  if (logoImages.length > 0) {
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

/**
 * Check if the website is using a professional domain (not a free hosting)
 */
function checkProfessionalDomain(url: string): {
  passed: boolean
  score: number
  value: boolean
} {
  // Extract domain from URL
  let domain
  try {
    const urlObj = new URL(url)
    domain = urlObj.hostname
  } catch {
    domain = url.replace(/^https?:\/\//, '').split('/')[0]
  }

  // List of free hosting domains
  const freeHostingDomains = [
    'blogspot.com',
    'wordpress.com',
    'wix.com',
    'weebly.com',
    'squarespace.com', // This is paid but often used for temporary sites
    'sites.google.com',
    'github.io',
    'netlify.app',
    'vercel.app',
    'herokuapp.com',
    'myshopify.com',
    'webnode.com',
    'jimdo.com',
  ]

  // Check if domain ends with any free hosting domain
  const isFreeDomain = freeHostingDomains.some(
    (freeDomain) => domain.endsWith(`.${freeDomain}`) || domain === freeDomain
  )

  const passed = !isFreeDomain
  const score = passed ? 100 : 0

  return {
    passed,
    score,
    value: passed,
  }
}
