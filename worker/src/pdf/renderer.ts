import * as fs from 'fs'
import * as path from 'path'
import * as Handlebars from 'handlebars'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { AnalysisResult } from '../analysis/analyzer'
import { logger } from '../utils/logger'

/**
 * Render PDF from data directly
 */
export async function renderPdfFromTemplate(
  websiteUrl: string,
  analysisResult: AnalysisResult
): Promise<Buffer> {
  try {
    logger.info(`Generating PDF report for ${websiteUrl} using pdf-lib`)

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()

    // Add a font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Add a page
    const page = pdfDoc.addPage([595.28, 841.89]) // A4 size
    const { width, height } = page.getSize()

    // Set initial position
    let y = height - 50
    const margin = 50

    // Add title
    page.drawText('WebScore360 Report', {
      x: margin,
      y,
      size: 24,
      font: helveticaBold,
      color: rgb(0.2, 0.4, 0.6),
    })

    y -= 40

    // Add website URL
    page.drawText(`Website: ${websiteUrl}`, {
      x: margin,
      y,
      size: 12,
      font: helveticaFont,
    })

    y -= 30

    // Add generation date
    const generatedDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    page.drawText(`Report generated on: ${generatedDate}`, {
      x: margin,
      y,
      size: 12,
      font: helveticaFont,
    })

    y -= 50

    // Add overall score
    page.drawText(`Overall Score: ${analysisResult.overallScore}`, {
      x: margin,
      y,
      size: 16,
      font: helveticaBold,
      color: getScoreRgb(analysisResult.overallScore),
    })

    y -= 40

    // Add category scores
    page.drawText('Category Scores:', {
      x: margin,
      y,
      size: 14,
      font: helveticaBold,
    })

    y -= 30

    // Draw each category score
    const categories = [
      { name: 'Performance', score: analysisResult.categoryScores.performance },
      { name: 'SEO', score: analysisResult.categoryScores.seo },
      { name: 'Conversion', score: analysisResult.categoryScores.conversion },
      { name: 'Branding', score: analysisResult.categoryScores.branding },
      {
        name: 'Online Presence',
        score: analysisResult.categoryScores.presence,
      },
    ]

    for (const category of categories) {
      page.drawText(`${category.name}: ${category.score}`, {
        x: margin + 20,
        y,
        size: 12,
        font: helveticaFont,
        color: getScoreRgb(category.score),
      })
      y -= 20
    }

    y -= 30

    // Add interpretation
    let interpretation = ''
    if (analysisResult.overallScore >= 80) {
      interpretation =
        "Your website is well-optimized overall. While you're performing strongly, there are still some opportunities for improvement in specific areas outlined in this report."
    } else if (analysisResult.overallScore >= 50) {
      interpretation =
        "Your website needs some improvements to reach its full potential. We've identified several key areas where focused changes could significantly enhance your overall score."
    } else {
      interpretation =
        'Your website requires significant improvements across multiple areas. This report highlights critical issues that need to be addressed to improve user experience and effectiveness.'
    }

    // Split interpretation text into lines to fit the page width
    const maxWidth = width - margin * 2
    const lines = splitTextToLines(interpretation, helveticaFont, 12, maxWidth)

    page.drawText('Summary:', {
      x: margin,
      y,
      size: 14,
      font: helveticaBold,
    })

    y -= 25

    // Draw each line of the interpretation
    for (const line of lines) {
      page.drawText(line, {
        x: margin,
        y,
        size: 12,
        font: helveticaFont,
      })
      y -= 18
    }

    y -= 30

    // Add recommendations
    const recommendations = generateRecommendationsList(analysisResult)

    page.drawText('Key Recommendations:', {
      x: margin,
      y,
      size: 14,
      font: helveticaBold,
    })

    y -= 25

    // Draw each recommendation
    for (let i = 0; i < recommendations.length; i++) {
      const rec = recommendations[i]

      page.drawText(`${i + 1}. ${rec.title} (${rec.category})`, {
        x: margin,
        y,
        size: 12,
        font: helveticaBold,
      })

      y -= 20

      // Split recommendation description into lines
      const descLines = splitTextToLines(
        rec.description,
        helveticaFont,
        12,
        maxWidth - 20
      )

      for (const line of descLines) {
        page.drawText(line, {
          x: margin + 20,
          y,
          size: 12,
          font: helveticaFont,
        })
        y -= 18
      }

      y -= 15
    }

    // Add footer
    page.drawText('© WebScore360', {
      x: margin,
      y: 30,
      size: 10,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    })

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save()

    return Buffer.from(pdfBytes)
  } catch (error) {
    logger.error(`Error generating PDF: ${error}`)
    throw new Error(
      `Failed to render PDF: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

/**
 * Helper function to get RGB color based on score
 */
function getScoreRgb(score: number) {
  if (score >= 80) return rgb(0.2, 0.8, 0.2) // Green
  if (score >= 50) return rgb(0.9, 0.7, 0) // Yellow
  return rgb(0.9, 0.2, 0) // Red
}

/**
 * Helper function to split text into lines that fit within maxWidth
 */
function splitTextToLines(
  text: string,
  font: any,
  fontSize: number,
  maxWidth: number
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const width = font.widthOfTextAtSize(testLine, fontSize)

    if (width <= maxWidth) {
      currentLine = testLine
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
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
