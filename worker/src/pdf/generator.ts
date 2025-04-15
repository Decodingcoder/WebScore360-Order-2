import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'
import { AnalysisResult } from '../analysis/analyzer'

/**
 * Generate a PDF report for the analysis result
 */
export async function generatePdf(
  websiteUrl: string,
  analysisResult: AnalysisResult
): Promise<string> {
  logger.info(`Generating PDF report for ${websiteUrl}`)

  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()

    // Add the fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Generate pages
    await generateCoverPage(pdfDoc, helveticaFont, helveticaBold, websiteUrl)
    await generateSummaryPage(
      pdfDoc,
      helveticaFont,
      helveticaBold,
      analysisResult
    )

    // Save PDF
    const pdfBytes = await pdfDoc.save()

    // Store the PDF in Supabase Storage
    const pdfUrl = await storePdf(pdfBytes, websiteUrl, analysisResult)

    return pdfUrl
  } catch (error) {
    logger.error(`Error generating PDF for ${websiteUrl}`, { error })
    throw new Error(
      `Failed to generate PDF: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

/**
 * Generate the cover page of the PDF
 */
async function generateCoverPage(
  pdfDoc: PDFDocument,
  regularFont: any,
  boldFont: any,
  websiteUrl: string
): Promise<void> {
  const page = pdfDoc.addPage([595.28, 841.89]) // A4 size
  const { width, height } = page.getSize()

  // Add report title
  page.drawText('WebScore360', {
    x: 50,
    y: height - 100,
    size: 36,
    font: boldFont,
    color: rgb(0.2, 0.4, 0.6),
  })

  page.drawText('Website Analysis Report', {
    x: 50,
    y: height - 150,
    size: 24,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  })

  // Website URL
  page.drawText('Website:', {
    x: 50,
    y: height - 220,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  })

  page.drawText(websiteUrl, {
    x: 50,
    y: height - 240,
    size: 14,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  })

  // Date
  page.drawText('Report generated on:', {
    x: 50,
    y: height - 280,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  })

  page.drawText(new Date().toLocaleDateString(), {
    x: 50,
    y: height - 300,
    size: 14,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  })

  // Footer
  page.drawText('© WebScore360', {
    x: width / 2 - 50,
    y: 30,
    size: 10,
    font: regularFont,
    color: rgb(0.6, 0.6, 0.6),
  })
}

/**
 * Generate the summary page of the PDF
 */
async function generateSummaryPage(
  pdfDoc: PDFDocument,
  regularFont: any,
  boldFont: any,
  result: AnalysisResult
): Promise<void> {
  const page = pdfDoc.addPage([595.28, 841.89]) // A4 size
  const { width, height } = page.getSize()

  // Page title
  page.drawText('Overall WebScore', {
    x: 50,
    y: height - 100,
    size: 24,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  })

  // Overall score
  const scoreColor = getScoreColor(result.overallScore)
  page.drawText(result.overallScore.toString(), {
    x: width / 2 - 25,
    y: height - 180,
    size: 60,
    font: boldFont,
    color: rgb(scoreColor.r, scoreColor.g, scoreColor.b),
  })

  // Score interpretation
  let interpretation = ''
  if (result.overallScore >= 80) {
    interpretation =
      'Your website is well-optimized overall, but there is still room for improvement in specific areas.'
  } else if (result.overallScore >= 50) {
    interpretation =
      'Your website needs some improvements to reach its full potential.'
  } else {
    interpretation =
      'Your website requires significant improvements in multiple areas.'
  }

  page.drawText('Interpretation:', {
    x: 50,
    y: height - 250,
    size: 14,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  })

  const textWidth = width - 100
  const words = interpretation.split(' ')
  let line = ''
  let y = height - 270

  for (const word of words) {
    const testLine = line + (line ? ' ' : '') + word
    const testWidth = regularFont.widthOfTextAtSize(testLine, 12)

    if (testWidth > textWidth) {
      page.drawText(line, {
        x: 50,
        y,
        size: 12,
        font: regularFont,
        color: rgb(0.3, 0.3, 0.3),
      })
      line = word
      y -= 20
    } else {
      line = testLine
    }
  }

  if (line) {
    page.drawText(line, {
      x: 50,
      y,
      size: 12,
      font: regularFont,
      color: rgb(0.3, 0.3, 0.3),
    })
  }

  // Category scores
  const categories = [
    { name: 'Performance', score: result.categoryScores.performance },
    { name: 'SEO', score: result.categoryScores.seo },
    { name: 'Conversion', score: result.categoryScores.conversion },
    { name: 'Branding', score: result.categoryScores.branding },
    { name: 'Online Presence', score: result.categoryScores.presence },
  ]

  page.drawText('Category Scores:', {
    x: 50,
    y: height - 350,
    size: 16,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
  })

  let categoryY = height - 380
  for (const category of categories) {
    const categoryColor = getScoreColor(category.score)

    // Category name
    page.drawText(category.name, {
      x: 50,
      y: categoryY,
      size: 14,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    })

    // Score
    page.drawText(category.score.toString(), {
      x: 250,
      y: categoryY,
      size: 14,
      font: boldFont,
      color: rgb(categoryColor.r, categoryColor.g, categoryColor.b),
    })

    categoryY -= 30
  }

  // CTA
  page.drawText(
    'Log in to your dashboard for detailed explanations and step-by-step fixes!',
    {
      x: 50,
      y: height - 550,
      size: 12,
      font: boldFont,
      color: rgb(0.2, 0.4, 0.6),
    }
  )

  page.drawText('Visit: https://webscore360.com/login', {
    x: 50,
    y: height - 570,
    size: 12,
    font: regularFont,
    color: rgb(0.2, 0.4, 0.6),
  })

  // Footer
  page.drawText('© WebScore360', {
    x: width / 2 - 50,
    y: 30,
    size: 10,
    font: regularFont,
    color: rgb(0.6, 0.6, 0.6),
  })
}

/**
 * Get RGB color based on score (red for low, yellow for medium, green for high)
 */
function getScoreColor(score: number): { r: number; g: number; b: number } {
  if (score >= 80) {
    return { r: 0.2, g: 0.7, b: 0.2 } // Green
  } else if (score >= 50) {
    return { r: 0.9, g: 0.7, b: 0.1 } // Yellow
  } else {
    return { r: 0.9, g: 0.2, b: 0.2 } // Red
  }
}

/**
 * Store PDF in Supabase Storage
 */
async function storePdf(
  pdfBytes: Uint8Array,
  websiteUrl: string,
  result: AnalysisResult
): Promise<string> {
  try {
    const domain = extractDomain(websiteUrl)
    const timestamp = new Date().getTime()
    const filename = `${domain}_${timestamp}.pdf`
    const storageBucket = process.env.STORAGE_BUCKET || 'reports'

    // Upload PDF to Supabase Storage
    const { data, error } = await supabase.storage
      .from(storageBucket)
      .upload(`reports/${filename}`, pdfBytes, {
        contentType: 'application/pdf',
        cacheControl: '3600',
      })

    if (error) {
      logger.error(`Failed to upload PDF to Supabase Storage: ${error.message}`)
      throw error
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(storageBucket)
      .getPublicUrl(`reports/${filename}`)

    return urlData.publicUrl
  } catch (error) {
    logger.error('Error storing PDF in Supabase Storage', { error })
    throw new Error(
      `Failed to store PDF: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname
    return hostname.replace(/^www\./, '')
  } catch (error) {
    return url.replace(/https?:\/\/(www\.)?/, '').split('/')[0]
  }
}
