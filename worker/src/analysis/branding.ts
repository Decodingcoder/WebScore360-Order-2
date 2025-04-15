import { CheerioAPI } from 'cheerio'
import { logger } from '../utils/logger'

interface BrandingResult {
  score: number
  checks: {
    logoPresence: { passed: boolean; score: number; value: boolean }
    brandConsistency: { passed: boolean; score: number; value: number }
    professionalDomain: { passed: boolean; score: number; value: boolean }
    visualHierarchy: { passed: boolean; score: number; value: number }
  }
}

/**
 * Analyze branding basics of a website
 * - Logo Presence: Check for logo in header or top areas
 * - Brand Consistency: Analyze color schemes and typography consistency
 * - Professional Domain: Check if using custom domain vs free hosting
 * - Visual Hierarchy: Check for consistent headings and structure
 */
export function analyzeBranding($: CheerioAPI, url: string): BrandingResult {
  logger.info(`Analyzing branding for ${url}`)

  // Check logo presence
  const logoResult = checkLogoPresence($)

  // Check brand consistency
  const consistencyResult = checkBrandConsistency($)

  // Check professional domain
  const domainResult = checkProfessionalDomain(url)

  // Check visual hierarchy
  const hierarchyResult = checkVisualHierarchy($)

  // Calculate overall branding score (equal weight)
  const brandingScore = Math.round(
    (logoResult.score +
      consistencyResult.score +
      domainResult.score +
      hierarchyResult.score) /
      4
  )

  return {
    score: brandingScore,
    checks: {
      logoPresence: logoResult,
      brandConsistency: consistencyResult,
      professionalDomain: domainResult,
      visualHierarchy: hierarchyResult,
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
 * Check for brand consistency through colors and fonts
 */
function checkBrandConsistency($: CheerioAPI): {
  passed: boolean
  score: number
  value: number
} {
  // Extract all colors from inline styles
  const styleColors = new Set<string>()
  $('[style*="color"]').each((_, el) => {
    const style = $(el).attr('style') || ''
    const colorMatch = style.match(/(color:)\s*([^;]+)/gi)
    if (colorMatch) {
      colorMatch.forEach((match) => {
        const color = match.split(':')[1].trim()
        styleColors.add(color.toLowerCase())
      })
    }
  })

  // Check for CSS with class rules
  const hasStylesheets = $('link[rel="stylesheet"]').length > 0

  // Count font families
  const fontFamilies = new Set<string>()
  $('[style*="font-family"]').each((_, el) => {
    const style = $(el).attr('style') || ''
    const fontMatch = style.match(/(font-family:)\s*([^;]+)/gi)
    if (fontMatch) {
      fontMatch.forEach((match) => {
        const font = match.split(':')[1].trim()
        fontFamilies.add(font.toLowerCase())
      })
    }
  })

  // Count distinct heading styles
  const headingStyles = new Set<string>()
  $('h1, h2, h3').each((_, el) => {
    const style = $(el).attr('style') || ''
    headingStyles.add(style.toLowerCase())
  })

  // Calculate a consistency score based on these factors
  // Fewer colors/fonts = more consistent
  const colorScore =
    styleColors.size < 10 ? 100 : styleColors.size < 20 ? 50 : 0
  const fontScore = fontFamilies.size < 3 ? 100 : fontFamilies.size < 6 ? 50 : 0
  const headingScore =
    headingStyles.size < 5 ? 100 : headingStyles.size < 10 ? 50 : 0
  const stylesheetScore = hasStylesheets ? 100 : 0

  // Combine scores
  const consistencyValue =
    (colorScore + fontScore + headingScore + stylesheetScore) / 4
  const passed = consistencyValue >= 50
  const score = passed ? 100 : 0

  return {
    passed,
    score,
    value: Math.round(consistencyValue),
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

/**
 * Check for visual hierarchy and consistent structure
 */
function checkVisualHierarchy($: CheerioAPI): {
  passed: boolean
  score: number
  value: number
} {
  // Check if there's at least one H1
  const hasH1 = $('h1').length > 0

  // Check if headings follow hierarchy (H1 → H2 → H3)
  const h1Count = $('h1').length
  const h2Count = $('h2').length
  const h3Count = $('h3').length

  const properHierarchy = h1Count <= h2Count && h2Count >= h3Count

  // Check for sections or divs with clear purpose
  const hasSections =
    $('section, article, .section, [class*="section"]').length > 0

  // Check for navigation menu
  const hasNavigation =
    $('nav, .nav, .navbar, .menu, #menu, header ul, .header ul').length > 0

  // Calculate score based on factors
  let hierarchyScore = 0
  if (hasH1) hierarchyScore += 25
  if (properHierarchy) hierarchyScore += 25
  if (hasSections) hierarchyScore += 25
  if (hasNavigation) hierarchyScore += 25

  const passed = hierarchyScore >= 75
  const score = passed ? 100 : 0

  return {
    passed,
    score,
    value: hierarchyScore,
  }
}
