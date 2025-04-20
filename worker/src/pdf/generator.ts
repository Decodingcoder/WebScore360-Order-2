import { supabase } from '../config/supabase'
import { logger } from '../utils/logger'
import { AnalysisResult } from '../analysis/analyzer'
import { renderPdfFromTemplate } from './renderer'

interface GeneratePdfResult {
  pdfBuffer: Buffer
  pdfUrl: string
}

/**
 * Generate a PDF report for the analysis result
 */
export async function generatePdf(
  websiteUrl: string,
  analysisResult: AnalysisResult
): Promise<GeneratePdfResult> {
  logger.info(`Generating PDF report for ${websiteUrl}`)

  try {
    // Render PDF from HTML template
    const pdfBuffer = await renderPdfFromTemplate(websiteUrl, analysisResult)

    // Store the PDF in Supabase Storage
    const pdfUrl = await storePdf(pdfBuffer, websiteUrl, analysisResult)

    // Return both buffer and URL
    return { pdfBuffer, pdfUrl }
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
 * Store PDF in Supabase Storage
 */
async function storePdf(
  pdfBytes: Buffer,
  websiteUrl: string,
  result: AnalysisResult
): Promise<string> {
  try {
    const domain = extractDomain(websiteUrl)

    // Create formatted timestamp: yyyymmddhhmmss
    const now = new Date()
    const timestamp =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0')

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
