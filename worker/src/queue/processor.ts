import { Job } from 'bull'
import { logger } from '../utils/logger'
import { supabase } from '../config/supabase'
import { analyzeWebsite } from '../analysis/analyzer'
import { generatePdf } from '../pdf/generator'
import { sendEmail } from '../services/mailer'

interface AnalysisJob {
  websiteUrl: string
  userEmail: string
  userId?: string // Optional if the user is not logged in
  auditId: string
}

/**
 * Process a website analysis job
 */
export async function processWebsiteAnalysis(job: Job<AnalysisJob>) {
  const { websiteUrl, userEmail, userId, auditId } = job.data

  logger.info(`Processing analysis for ${websiteUrl}`, { jobId: job.id })

  try {
    // Update job status in database
    await updateAuditStatus(auditId, 'processing')

    // Step 1: Analyze the website and calculate scores
    logger.info(`Starting analysis for ${websiteUrl}`)
    const analysisResult = await analyzeWebsite(websiteUrl)

    // Step 2: Save analysis results to database
    logger.info(`Saving analysis results for ${websiteUrl}`)
    await saveAnalysisResults(auditId, analysisResult)

    // Step 3: Generate PDF report
    logger.info(`Generating PDF report for ${websiteUrl}`)
    const { pdfBuffer, pdfUrl } = await generatePdf(websiteUrl, analysisResult)

    // Step 4: Update database with PDF URL
    logger.info(`Updating audit with PDF URL: ${pdfUrl}`)
    await updateAuditWithPdfUrl(auditId, pdfUrl)

    // Step 5: Send email with report via MailerSend
    try {
      logger.info(`Sending report email to ${userEmail}`)
      await sendEmail({
        to: userEmail,
        subject: `Your WebScore360 Report for ${websiteUrl} is ready!`,
        htmlBody: `<p>Hello,</p><p>Your WebScore360 analysis for <strong>${websiteUrl}</strong> is complete.</p><p>You can also view the report online here: <a href="${pdfUrl}">${pdfUrl}</a></p><p>The PDF report is attached to this email.</p><p>Thank you,<br>The WebScore360 Team</p>`,
        pdfAttachment: {
          content: pdfBuffer,
          filename: `WebScore360_Report_${websiteUrl.replace(
            /[^a-zA-Z0-9]/g,
            '_'
          )}.pdf`,
        },
      })
      logger.info(`Report email sent successfully to ${userEmail}`)
    } catch (emailError) {
      logger.error(`Failed to send report email to ${userEmail}`, {
        emailError,
      })
      // Decide if this should be a critical failure or just logged
      // For now, we log the error but continue to mark the audit as completed
    }

    // Step 6: Update audit status to completed
    await updateAuditStatus(auditId, 'completed')

    logger.info(`Analysis for ${websiteUrl} completed successfully`)
    return { success: true, auditId }
  } catch (error) {
    logger.error(`Failed to process analysis for ${websiteUrl}`, {
      error,
      jobId: job.id,
    })

    // Update audit status to failed
    await updateAuditStatus(auditId, 'failed')

    throw error
  }
}

/**
 * Update the status of an audit
 */
async function updateAuditStatus(
  auditId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed'
) {
  try {
    const { error } = await supabase
      .from('audits')
      .update({ status })
      .eq('id', auditId)

    if (error) {
      logger.error(`Failed to update audit status: ${error.message}`)
    }
  } catch (error) {
    logger.error('Error updating audit status', { error })
  }
}

/**
 * Save analysis results to the database
 */
async function saveAnalysisResults(auditId: string, results: any) {
  try {
    const { error } = await supabase
      .from('audits')
      .update({
        overall_score: results.overallScore,
        performance_score: results.categoryScores.performance,
        seo_score: results.categoryScores.seo,
        conversion_score: results.categoryScores.conversion,
        branding_score: results.categoryScores.branding,
        presence_score: results.categoryScores.presence,
        raw_data: results.rawData,
      })
      .eq('id', auditId)

    if (error) {
      logger.error(`Failed to save analysis results: ${error.message}`)
      throw error
    }
  } catch (error) {
    logger.error('Error saving analysis results', { error })
    throw error
  }
}

/**
 * Update audit with PDF URL
 */
async function updateAuditWithPdfUrl(auditId: string, pdfUrl: string) {
  try {
    const { error } = await supabase
      .from('audits')
      .update({ report_pdf_url: pdfUrl })
      .eq('id', auditId)

    if (error) {
      logger.error(`Failed to update audit with PDF URL: ${error.message}`)
    }
  } catch (error) {
    logger.error('Error updating audit with PDF URL', { error })
  }
}
