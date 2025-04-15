import { CheerioAPI } from 'cheerio'
import { logger } from '../utils/logger'

interface ConversionResult {
  score: number
  checks: {
    ctaButtons: { passed: boolean; score: number; value: number }
    formPresence: { passed: boolean; score: number; value: boolean }
    trustElements: { passed: boolean; score: number; value: number }
    contactMethod: { passed: boolean; score: number; value: boolean }
  }
}

/**
 * Analyze conversion readiness of a website
 * - CTA Presence: Look for buttons or links with call-to-action text
 * - Form Presence: Check if forms exist on the page
 * - Trust Elements: Look for testimonials, badges, security icons
 * - Contact Method: Check for contact form, email, or phone number
 */
export function analyzeConversion($: CheerioAPI): ConversionResult {
  logger.info('Analyzing conversion elements')

  // Check CTA buttons
  const ctaResult = checkCtaButtons($)

  // Check form presence
  const formResult = checkFormPresence($)

  // Check trust elements
  const trustResult = checkTrustElements($)

  // Check contact methods
  const contactResult = checkContactMethod($)

  // Calculate overall conversion score (equal weight)
  const conversionScore = Math.round(
    (ctaResult.score +
      formResult.score +
      trustResult.score +
      contactResult.score) /
      4
  )

  return {
    score: conversionScore,
    checks: {
      ctaButtons: ctaResult,
      formPresence: formResult,
      trustElements: trustResult,
      contactMethod: contactResult,
    },
  }
}

/**
 * Check for call-to-action buttons or links
 */
function checkCtaButtons($: CheerioAPI): {
  passed: boolean
  score: number
  value: number
} {
  // Common CTA text patterns
  const ctaPatterns = [
    'sign up',
    'get started',
    'try',
    'buy',
    'subscribe',
    'join',
    'register',
    'download',
    'learn more',
    'contact',
    'shop',
    'book now',
    'read more',
    'free trial',
  ]

  let ctaCount = 0

  // Check buttons with CTA text
  $('button').each((_, el) => {
    const buttonText = $(el).text().toLowerCase().trim()
    if (ctaPatterns.some((pattern) => buttonText.includes(pattern))) {
      ctaCount++
    }
  })

  // Check links with CTA text
  $('a').each((_, el) => {
    const linkText = $(el).text().toLowerCase().trim()
    if (ctaPatterns.some((pattern) => linkText.includes(pattern))) {
      ctaCount++
    }
  })

  // Also check for elements with common CTA classes
  const ctaClasses = ['cta', 'call-to-action', 'btn-primary', 'button-primary']
  ctaClasses.forEach((className) => {
    ctaCount += $(`.${className}`).length
  })

  // Pass if at least one CTA is found
  const passed = ctaCount > 0
  const score = passed ? 100 : 0

  return {
    passed,
    score,
    value: ctaCount,
  }
}

/**
 * Check if forms are present on the page
 */
function checkFormPresence($: CheerioAPI): {
  passed: boolean
  score: number
  value: boolean
} {
  // Check for <form> elements
  const hasForms = $('form').length > 0

  // Also check for common form elements as backup
  const hasFormFields =
    $('input[type="text"]').length > 0 ||
    $('input[type="email"]').length > 0 ||
    $('textarea').length > 0 ||
    $('input[type="submit"]').length > 0 ||
    $('button[type="submit"]').length > 0

  const passed = hasForms || hasFormFields
  const score = passed ? 100 : 0

  return {
    passed,
    score,
    value: passed,
  }
}

/**
 * Check for trust elements like testimonials, badges, security icons
 */
function checkTrustElements($: CheerioAPI): {
  passed: boolean
  score: number
  value: number
} {
  let trustCount = 0

  // Check for testimonials
  const testimonialPatterns = [
    'testimonial',
    'review',
    'feedback',
    'customer',
    'client',
    'what people say',
  ]

  // Look for elements with testimonial class/id
  $(
    '[class*="testimonial"], [id*="testimonial"], [class*="review"], [id*="review"]'
  ).each(() => {
    trustCount++
  })

  // Look for testimonial text patterns
  testimonialPatterns.forEach((pattern) => {
    $('h1, h2, h3, h4, h5, h6, div, section').each((_, el) => {
      if ($(el).text().toLowerCase().includes(pattern)) {
        trustCount++
      }
    })
  })

  // Check for trust badges and security icons
  const trustBadgePatterns = [
    'secure',
    'security',
    'ssl',
    'trust',
    'verified',
    'guarantee',
    'satisfaction',
    'norton',
    'mcafee',
    'bbb',
    'trustpilot',
  ]

  // Look for trust badge images
  $('img').each((_, el) => {
    const alt = $(el).attr('alt')?.toLowerCase() || ''
    const src = $(el).attr('src')?.toLowerCase() || ''

    if (
      trustBadgePatterns.some(
        (pattern) => alt.includes(pattern) || src.includes(pattern)
      )
    ) {
      trustCount++
    }
  })

  // Pass if at least one trust element is found
  const passed = trustCount > 0
  const score = passed ? 100 : 0

  return {
    passed,
    score,
    value: trustCount,
  }
}

/**
 * Check for contact methods (form, email, phone)
 */
function checkContactMethod($: CheerioAPI): {
  passed: boolean
  score: number
  value: boolean
} {
  // Check for contact forms
  const hasContactForm =
    $('form').filter((_, el) => {
      const formText = $(el).text().toLowerCase()
      return (
        formText.includes('contact') ||
        formText.includes('message') ||
        formText.includes('get in touch')
      )
    }).length > 0

  // Check for mailto: links
  const hasEmailLink = $('a[href^="mailto:"]').length > 0

  // Check for tel: links
  const hasPhoneLink = $('a[href^="tel:"]').length > 0

  // Check for contact page link
  const hasContactPageLink =
    $('a').filter((_, el) => {
      const href = $(el).attr('href')?.toLowerCase() || ''
      const text = $(el).text().toLowerCase()
      return (
        href.includes('contact') ||
        text.includes('contact us') ||
        text.includes('get in touch')
      )
    }).length > 0

  const passed =
    hasContactForm || hasEmailLink || hasPhoneLink || hasContactPageLink
  const score = passed ? 100 : 0

  return {
    passed,
    score,
    value: passed,
  }
}
