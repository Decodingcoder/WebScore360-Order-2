import { Job } from 'bull'
import { logger } from '../utils/logger'
import { supabase } from '../config/supabase'
import { analyzeWebsite } from '../analysis/analyzer'
import { generatePdf } from '../pdf/generator'
import { sendReportEmail } from '../services/email'

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
    const pdfUrl = await generatePdf(websiteUrl, analysisResult)

    // Step 4: Update database with PDF URL
    logger.info(`Updating audit with PDF URL: ${pdfUrl}`)
    await updateAuditWithPdfUrl(auditId, pdfUrl)

    // Step 5: Send email with report
    logger.info(`Sending email to ${userEmail}`)
    await sendReportEmail(userEmail, websiteUrl, pdfUrl, analysisResult)

    // Step 6: Update audit status to completed
    await updateAuditStatus(auditId, 'completed')

    // Step 7: If user is logged in, update their remaining audits count
    if (userId) {
      await updateUserAuditsRemaining(userId)
    }

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

/**
 * Update user's remaining audits count
 */
async function updateUserAuditsRemaining(userId: string) {
  try {
    // First get the user's profile
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('audits_remaining')
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      logger.error(`Failed to fetch user profile: ${fetchError.message}`)
      return
    }

    // If audits_remaining is null or undefined, don't update
    if (
      profile.audits_remaining === null ||
      profile.audits_remaining === undefined
    ) {
      return
    }

    // Update the audits_remaining count
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        audits_remaining: Math.max(0, profile.audits_remaining - 1),
      })
      .eq('user_id', userId)

    if (updateError) {
      logger.error(
        `Failed to update user audits remaining: ${updateError.message}`
      )
    }
  } catch (error) {
    logger.error('Error updating user audits remaining', { error })
  }
}
