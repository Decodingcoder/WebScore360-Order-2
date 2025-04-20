import {
  MailerSend,
  EmailParams,
  Sender,
  Recipient,
  Attachment,
} from 'mailersend'
import dotenv from 'dotenv'

dotenv.config()

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || '',
})

const sentFrom = new Sender(
  process.env.MAILERSEND_SENDER_EMAIL || '',
  'WebScore360 Report'
)

interface SendEmailOptions {
  to: string
  subject: string
  htmlBody: string
  pdfAttachment?: {
    content: Buffer
    filename: string
  }
}

export async function sendEmail({
  to,
  subject,
  htmlBody,
  pdfAttachment,
}: SendEmailOptions): Promise<void> {
  const recipients = [new Recipient(to)]
  const attachments: Attachment[] = []

  if (pdfAttachment) {
    attachments.push(
      new Attachment(
        pdfAttachment.content.toString('base64'), // MailerSend expects base64 content
        pdfAttachment.filename,
        'attachment' // Specify disposition as attachment
      )
    )
  }

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(subject)
    .setHtml(htmlBody)
    .setAttachments(attachments)

  try {
    console.log(`Sending email to ${to} with subject: ${subject}`)
    const response = await mailerSend.email.send(emailParams)
    console.log('MailerSend response:', response.statusCode, response.body)
    if (response.statusCode >= 300) {
      console.error('Failed to send email:', response.body)
      throw new Error(`Failed to send email: ${response.statusCode}`)
    }
    console.log(`Email sent successfully to ${to}`)
  } catch (error) {
    console.error('Error sending email:', error)
    // Rethrow or handle error appropriately
    throw error
  }
}
