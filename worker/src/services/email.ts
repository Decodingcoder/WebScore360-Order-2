import nodemailer from 'nodemailer'
import { logger } from '../utils/logger'
import { AnalysisResult } from '../analysis/analyzer'

/**
 * Send an email with the PDF report
 */
export async function sendReportEmail(
  email: string,
  websiteUrl: string,
  pdfUrl: string,
  analysisResult: AnalysisResult
): Promise<void> {
  try {
    logger.info(`Sending report email to ${email}`)

    // Create email transport
    const transporter = createTransporter()

    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@webscore360.com',
      to: email,
      subject: `Your WebScore360 Analysis Report for ${websiteUrl}`,
      html: generateEmailHtml(websiteUrl, pdfUrl, analysisResult),
      attachments: [
        {
          filename: 'webscore360-report.pdf',
          path: pdfUrl,
        },
      ],
    }

    // Send email
    await transporter.sendMail(mailOptions)

    logger.info(`Report email sent successfully to ${email}`)
  } catch (error) {
    logger.error(`Failed to send email to ${email}`, { error })
    throw new Error(
      `Email sending failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

/**
 * Create the nodemailer transport
 */
function createTransporter() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD

  // If no SMTP credentials, create a mock transporter for dev/test
  if (!host || !port) {
    logger.warn('No SMTP configuration found, using test transport')
    return nodemailer.createTransport({
      jsonTransport: true,
    })
  }

  // Create real transport
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  })
}

/**
 * Generate the HTML content of the email
 */
function generateEmailHtml(
  websiteUrl: string,
  pdfUrl: string,
  result: AnalysisResult
): string {
  const score = result.overallScore
  const scoreColorClass = getScoreColorClass(score)

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your WebScore360 Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #2c5282;
        }
        .score-box {
          text-align: center;
          margin: 20px 0;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        .score {
          font-size: 60px;
          font-weight: bold;
        }
        .score-red {
          color: #e53e3e;
        }
        .score-yellow {
          color: #d69e2e;
        }
        .score-green {
          color: #38a169;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #3182ce;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          margin-top: 20px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #718096;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">WebScore360</div>
          <p>Your website analysis report is ready!</p>
        </div>
        
        <p>Hello,</p>
        
        <p>We've completed the analysis of <strong>${websiteUrl}</strong> and your WebScore report is ready!</p>
        
        <div class="score-box">
          <p>Your Overall WebScore:</p>
          <div class="score ${scoreColorClass}">${score}</div>
          
          <p>
            ${getScoreMessage(score)}
          </p>
        </div>
        
        <p>We've attached your full PDF report to this email. For more detailed insights and to see step-by-step guidance on how to improve your score, visit your dashboard.</p>
        
        <div style="text-align: center;">
          <a href="https://webscore360.com/login" class="button">View Your Dashboard</a>
        </div>
        
        <p>If you have any questions, please don't hesitate to reply to this email.</p>
        
        <p>Thank you for using WebScore360!</p>
        
        <div class="footer">
          <p>© WebScore360</p>
          <p>This is an automated message, please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Get the CSS class for the score color
 */
function getScoreColorClass(score: number): string {
  if (score >= 80) {
    return 'score-green'
  } else if (score >= 50) {
    return 'score-yellow'
  } else {
    return 'score-red'
  }
}

/**
 * Get a message based on the score
 */
function getScoreMessage(score: number): string {
  if (score >= 80) {
    return "Excellent! Your website is performing well, but there's still room for some optimization."
  } else if (score >= 50) {
    return 'Good start! Your website needs some improvements to reach its full potential.'
  } else {
    return "Your website needs significant improvements. We've identified several key areas to focus on."
  }
}
