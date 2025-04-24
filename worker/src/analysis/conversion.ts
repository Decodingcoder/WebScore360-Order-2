import { CheerioAPI } from 'cheerio'
import { logger } from '../utils/logger'

export interface ConversionResult {
  score: number
  checks: {
    ctaButtons: { passed: boolean; score: number; value: number }
    formPresence: { passed: boolean; score: number; value: boolean }
    contactMethod: { passed: boolean; score: number; value: boolean }
  }
}

/**
 * Analyze conversion readiness of a website
 * - CTA Presence: Look for buttons or links with call-to-action text
 * - Form Presence: Check if forms exist on the page
 * - Contact Method: Check for contact form, email, or phone number
 */
export function analyzeConversion($: CheerioAPI): ConversionResult {
  logger.info('Analyzing conversion elements')

  // Check CTA buttons
  const ctaResult = checkCtaButtons($)

  // Check form presence
  const formResult = checkFormPresence($)

  // Check contact methods
  const contactResult = checkContactMethod($)

  // Calculate overall conversion score (average of 3 checks)
  const conversionScore = Math.round(
    (ctaResult.score + formResult.score + contactResult.score) / 3
  )

  return {
    score: conversionScore,
    checks: {
      ctaButtons: ctaResult,
      formPresence: formResult,
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
