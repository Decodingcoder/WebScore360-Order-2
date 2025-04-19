import * as fs from 'fs'
import * as path from 'path'
import * as Handlebars from 'handlebars'
import puppeteer from 'puppeteer'
import { AnalysisResult } from '../analysis/analyzer'
import { logger } from '../utils/logger'

/**
 * Render PDF from HTML template
 */
export async function renderPdfFromTemplate(
  websiteUrl: string,
  analysisResult: AnalysisResult
): Promise<Buffer> {
  try {
    logger.info(`Rendering PDF for ${websiteUrl} using HTML template`)

    // Log environment variables for debugging
    logger.info(
      `PUPPETEER_EXECUTABLE_PATH: ${
        process.env.PUPPETEER_EXECUTABLE_PATH || 'not set'
      }`
    )
    logger.info(`CHROME_PATH: ${process.env.CHROME_PATH || 'not set'}`)
    logger.info(
      `Attempting to find Chrome at: ${
        process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser'
      }`
    )

    // Load the HTML template
    const templatePath = path.resolve(__dirname, 'template.html')
    const templateSource = fs.readFileSync(templatePath, 'utf-8')

    // Compile the template
    const template = Handlebars.compile(templateSource)

    // Prepare template data
    const templateData = prepareTemplateData(websiteUrl, analysisResult)

    // Render HTML with data
    const html = template(templateData)

    // Launch puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      executablePath:
        process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
      ignoreDefaultArgs: ['--disable-extensions'],
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
      ],
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })

    await browser.close()

    return pdfBuffer
  } catch (error) {
    logger.error(`Error rendering PDF from template: ${error}`)
    throw new Error(
      `Failed to render PDF: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

/**
 * Prepare data for template rendering
 */
function prepareTemplateData(websiteUrl: string, result: AnalysisResult): any {
  // Format date
  const generatedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Get score classes and colors
  const getScoreClass = (score: number) => {
    if (score >= 80) return 'score-high'
    if (score >= 50) return 'score-medium'
    return 'score-low'
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#33cc33' // Green
    if (score >= 50) return '#e6b800' // Yellow
    return '#e63300' // Red
  }

  // Get category class name (for CSS)
  const getCategoryClass = (category: string) => {
    return category.toLowerCase().replace(' ', '')
  }

  // Generate interpretation text
  let interpretation = ''
  if (result.overallScore >= 80) {
    interpretation =
      "Your website is well-optimized overall. While you're performing strongly, there are still some opportunities for improvement in specific areas outlined in this report."
  } else if (result.overallScore >= 50) {
    interpretation =
      "Your website needs some improvements to reach its full potential. We've identified several key areas where focused changes could significantly enhance your overall score."
  } else {
    interpretation =
      'Your website requires significant improvements across multiple areas. This report highlights critical issues that need to be addressed to improve user experience and effectiveness.'
  }

  // Generate recommendations
  const recommendations = generateRecommendationsList(result)

  // Build the template data object
  return {
    websiteUrl,
    generatedDate,
    overallScore: result.overallScore,
    overallScoreClass: getScoreClass(result.overallScore),
    interpretation,

    // Category scores
    performanceScore: result.categoryScores.performance,
    performanceScoreClass: getScoreClass(result.categoryScores.performance),
    performanceColor: getScoreColor(result.categoryScores.performance),

    seoScore: result.categoryScores.seo,
    seoScoreClass: getScoreClass(result.categoryScores.seo),
    seoColor: getScoreColor(result.categoryScores.seo),

    conversionScore: result.categoryScores.conversion,
    conversionScoreClass: getScoreClass(result.categoryScores.conversion),
    conversionColor: getScoreColor(result.categoryScores.conversion),

    brandingScore: result.categoryScores.branding,
    brandingScoreClass: getScoreClass(result.categoryScores.branding),
    brandingColor: getScoreColor(result.categoryScores.branding),

    presenceScore: result.categoryScores.presence,
    presenceScoreClass: getScoreClass(result.categoryScores.presence),
    presenceColor: getScoreColor(result.categoryScores.presence),

    // Recommendations (if available)
    ...(recommendations.length > 0 && {
      recommendation1_title: recommendations[0].title,
      recommendation1_description: recommendations[0].description,
      recommendation1_category: recommendations[0].category,
      recommendation1_category_class: getCategoryClass(
        recommendations[0].category
      ),
    }),

    ...(recommendations.length > 1 && {
      recommendation2_title: recommendations[1].title,
      recommendation2_description: recommendations[1].description,
      recommendation2_category: recommendations[1].category,
      recommendation2_category_class: getCategoryClass(
        recommendations[1].category
      ),
    }),

    ...(recommendations.length > 2 && {
      recommendation3_title: recommendations[2].title,
      recommendation3_description: recommendations[2].description,
      recommendation3_category: recommendations[2].category,
      recommendation3_category_class: getCategoryClass(
        recommendations[2].category
      ),
    }),
  }
}

/**
 * Generate recommendations based on scores
 */
function generateRecommendationsList(result: AnalysisResult): Array<{
  title: string
  description: string
  category: string
}> {
  const recommendations = []
  const { performance, seo, conversion, branding, presence } =
    result.categoryScores

  // Add recommendations based on lowest scores first
  const categories = [
    { name: 'Performance', score: performance },
    { name: 'SEO', score: seo },
    { name: 'Conversion', score: conversion },
    { name: 'Branding', score: branding },
    { name: 'Online Presence', score: presence },
  ]

  // Sort by score ascending (lowest first)
  categories.sort((a, b) => a.score - b.score)

  // Add recommendations for the 3 lowest scoring categories
  for (let i = 0; i < Math.min(3, categories.length); i++) {
    const category = categories[i]

    if (category.name === 'Performance' && category.score < 70) {
      recommendations.push({
        title: 'Improve Page Load Speed',
        description:
          'Your website takes too long to load. Optimize images, enable compression, and leverage browser caching to improve loading times.',
        category: 'Performance',
      })
    }

    if (category.name === 'SEO' && category.score < 70) {
      recommendations.push({
        title: 'Enhance SEO Fundamentals',
        description:
          'Your website lacks proper SEO structure. Optimize meta tags, improve heading structure, and add descriptive alt text to images.',
        category: 'SEO',
      })
    }

    if (category.name === 'Conversion' && category.score < 70) {
      recommendations.push({
        title: 'Improve Call-to-Action Elements',
        description:
          'Your CTAs need improvement. Make them more visible, use action-oriented text, and optimize their placement on key pages.',
        category: 'Conversion',
      })
    }

    if (category.name === 'Branding' && category.score < 70) {
      recommendations.push({
        title: 'Strengthen Brand Consistency',
        description:
          'Your brand elements lack consistency. Standardize colors, typography, and imagery across your website.',
        category: 'Branding',
      })
    }

    if (category.name === 'Online Presence' && category.score < 70) {
      recommendations.push({
        title: 'Expand Social Media Integration',
        description:
          'Your social media presence needs improvement. Add social sharing buttons and display social proof more prominently.',
        category: 'Online Presence',
      })
    }
  }

  // Add general recommendations if we don't have enough
  if (recommendations.length < 3) {
    if (!recommendations.some((r) => r.category === 'Performance')) {
      recommendations.push({
        title: 'Further Optimize Mobile Experience',
        description:
          "While your site performs well, there's room to improve the mobile experience with better touch targets and responsive layouts.",
        category: 'Performance',
      })
    }

    if (
      !recommendations.some((r) => r.category === 'SEO') &&
      recommendations.length < 3
    ) {
      recommendations.push({
        title: 'Enhance Content Strategy',
        description:
          'Expand your content with more relevant keywords and structured data to improve search visibility.',
        category: 'SEO',
      })
    }
  }

  return recommendations.slice(0, 3) // Return up to 3 recommendations
}
