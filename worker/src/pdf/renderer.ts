import * as fs from 'fs'
import * as path from 'path'
import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib'
import { AnalysisResult } from '../analysis/analyzer'
import { logger } from '../utils/logger'

// Import Fix-It Guidance
// Ensure the path is correct relative to the compiled JS file in 'dist'
// You might need to adjust this path based on your build process or copy the JSON to 'dist'
const guidancePath = path.resolve(__dirname, '../lib/fix-it-guidance.json')
let guidance: Record<string, { what: string; why: string; how: string }> = {}
try {
  const guidanceJson = fs.readFileSync(guidancePath, 'utf-8')
  guidance = JSON.parse(guidanceJson)
  // Add a log to check the loaded guidance keys
  logger.info(`Loaded guidance keys: ${Object.keys(guidance).join(', ')}`)
} catch (e) {
  logger.error(`Failed to load fix-it-guidance.json from ${guidancePath}`, {
    error: e,
  })
  // Also log if loading failed, so we know guidance is empty
  logger.warn('Guidance object is empty due to loading error.')
}

/**
 * Render PDF from data directly
 */
export async function renderPdfFromTemplate(
  websiteUrl: string,
  analysisResult: AnalysisResult,
  subscriptionTier: 'free' | 'pro' // Add subscription tier
): Promise<Buffer> {
  try {
    logger.info(
      `Generating PDF report for ${websiteUrl} (Tier: ${subscriptionTier}) using pdf-lib`
    )

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()

    // Add a font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Load and embed logo
    let logoImage
    try {
      const logoPath = path.resolve(__dirname, '../assets/logo.png')
      const logoBytes = fs.readFileSync(logoPath)
      logoImage = await pdfDoc.embedPng(logoBytes)
      logger.info('Logo embedded successfully')
    } catch (logoError) {
      logger.warn(`Could not load logo image: ${logoError}`)
      // Continue without the logo
    }

    // Add a page
    let page = pdfDoc.addPage([595.28, 841.89]) // A4 size
    const { width, height } = page.getSize()

    // Set initial position
    let y = height - 50
    const margin = 50
    const contentWidth = width - margin * 2

    // Add logo if available
    if (logoImage) {
      const logoWidth = 120
      const logoHeight = logoImage.height * (logoWidth / logoImage.width)
      page.drawImage(logoImage, {
        x: width - margin - logoWidth,
        y: height - margin - logoHeight,
        width: logoWidth,
        height: logoHeight,
      })
    }

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

    y -= 20 // Adjust spacing

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

    y -= 15 // Adjust spacing before plan identifier

    // Add Plan Identifier
    const planText = `Generated on ${
      subscriptionTier === 'pro' ? 'Pro' : 'Free'
    } Plan`
    page.drawText(planText, {
      x: margin,
      y,
      size: 10,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    })

    y -= 40 // Adjust spacing after plan identifier

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
    const interpretationLines = splitTextToLines(
      interpretation,
      helveticaFont,
      12,
      contentWidth
    )

    page.drawText('Summary:', {
      x: margin,
      y,
      size: 14,
      font: helveticaBold,
    })

    y -= 25

    // Draw each line of the interpretation
    for (const line of interpretationLines) {
      if (y < margin + 18) {
        page = pdfDoc.addPage([width, height])
        y = height - margin - 30
      }
      page.drawText(line, {
        x: margin,
        y,
        size: 12,
        font: helveticaFont,
      })
      y -= 18
    }

    y -= 30 // Space after summary

    // --- Add Upgrade CTA for Free Tier --- START
    if (subscriptionTier === 'free') {
      const upgradeText1 = 'Unlock detailed insights and step-by-step fixes!'
      const upgradeText2 = 'Upgrade to Pro: https://webscore360.io/dashboard'

      // Check for page break before CTA
      if (y < margin + 50) {
        // Estimate space needed for CTA
        page = pdfDoc.addPage([width, height])
        y = height - margin - 30 // Reset y position
        // Optionally redraw header/logo on new page if needed
      }

      page.drawText(upgradeText1, {
        x: margin,
        y,
        size: 12,
        font: helveticaBold,
        color: rgb(0.1, 0.5, 0.1), // Greenish color
      })
      y -= 20
      page.drawText(upgradeText2, {
        x: margin,
        y,
        size: 11,
        font: helveticaFont,
        color: rgb(0.2, 0.4, 0.6), // Blueish link color
      })
      y -= 30 // Space after CTA
    }
    // --- Add Upgrade CTA for Free Tier --- END

    // --- Add Detailed Findings Section (Pro Only) --- START
    if (subscriptionTier === 'pro') {
      // Check for page break before starting section
      if (y < margin + 50) {
        page = pdfDoc.addPage([width, height])
        y = height - margin - 30
      }

      page.drawText('Detailed Findings & Fix-It Guidance', {
        x: margin,
        y,
        size: 16,
        font: helveticaBold,
      })
      y -= 30

      const failedChecks = Object.entries(analysisResult.rawData.checks).filter(
        ([_key, check]) => !check.passed
      )

      if (failedChecks.length === 0) {
        if (y < margin + 20) {
          // Check space
          page = pdfDoc.addPage([width, height])
          y = height - margin - 30
        }
        page.drawText(
          'Excellent! No specific issues requiring guidance were found in this analysis.',
          {
            x: margin,
            y,
            size: 12,
            font: helveticaFont,
          }
        )
        y -= 20
      } else {
        for (const [key, check] of failedChecks) {
          const guidanceItem = guidance[key]
          if (!guidanceItem) {
            logger.warn(`No fix-it guidance found for failed check key: ${key}`)
            continue // Skip if no guidance defined
          }

          // Estimate space needed for this item (can be refined)
          const neededSpace =
            60 + // Title + Spacing
            guidanceItem.what.length / 5 + // Rough estimate for lines
            guidanceItem.why.length / 5 +
            guidanceItem.how.length / 5

          // Add page break if needed before starting item
          if (y < margin + neededSpace) {
            page = pdfDoc.addPage([width, height])
            y = height - margin - 30 // Reset y position
          }

          // Draw Check Title (human-readable from key)
          const checkTitle = key
            .replace(/^[^_]+_/, '') // Remove category prefix (e.g., "seo_")
            .replace(/_/g, ' ')
            .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase())
            .trim()

          page.drawText(checkTitle, {
            x: margin,
            y,
            size: 13,
            font: helveticaBold,
            color: getScoreRgb(check.score), // Use score color for title
          })
          y -= 25

          // Helper to draw wrapped text section
          const drawSection = (label: string, text: string) => {
            const fullText = `${label}: ${text}`
            const lines = splitTextToLines(
              fullText,
              helveticaFont,
              11,
              contentWidth - 15
            )
            if (y < margin + lines.length * 16) {
              // Check space for lines
              page = pdfDoc.addPage([width, height])
              y = height - margin - 30
            }
            for (const line of lines) {
              page.drawText(line, {
                x: margin + 15,
                y,
                size: 11,
                font: helveticaFont,
              })
              y -= 16 // Line spacing
              if (y < margin) {
                // Check during loop
                page = pdfDoc.addPage([width, height])
                y = height - margin - 30
              }
            }
            y -= 8 // Space after section
          }

          // Draw What, Why, How sections
          drawSection('What it is', guidanceItem.what)
          drawSection('Why it matters', guidanceItem.why)
          drawSection('How to fix it', guidanceItem.how)

          y -= 15 // Extra space after the whole item
        } // End loop through failed checks
      }
    } // End if (subscriptionTier === 'pro')
    // --- Add Detailed Findings Section (Pro Only) --- END

    // Ensure y is not too low before drawing footer
    if (y < margin + 30) {
      page = pdfDoc.addPage([width, height])
      y = height - margin - 30 // Leave space at top
    }

    // Update footer to include the website URL
    page.drawText('© WebScore360', {
      x: margin,
      y: 30,
      size: 10,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    })

    page.drawText('https://webscore360.io', {
      x: width - margin - 120,
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
 * Get RGB color based on score
 */
function getScoreRgb(score: number) {
  if (score >= 80) {
    return rgb(0.2, 0.6, 0.2) // Green
  } else if (score >= 50) {
    return rgb(0.8, 0.6, 0.1) // Yellow/Orange
  } else {
    return rgb(0.8, 0.2, 0.2) // Red
  }
}

/**
 * Split text into lines to fit within a max width
 */
function splitTextToLines(
  text: string,
  font: PDFFont, // Use specific PDFFont type
  fontSize: number,
  maxWidth: number
): string[] {
  const lines: string[] = []
  const words = text.split(' ')
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const testWidth = font.widthOfTextAtSize(testLine, fontSize)

    if (testWidth <= maxWidth) {
      currentLine = testLine
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }
  lines.push(currentLine)

  return lines
}
