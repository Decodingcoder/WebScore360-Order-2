import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

// Basic logger fallback
const logger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
}

export async function GET(
  request: Request,
  { params }: { params: { auditId: string } }
) {
  const { auditId } = params
  if (!auditId) {
    return NextResponse.json({ error: 'Audit ID is required' }, { status: 400 })
  }

  // Use createServerActionClient for server-side operations
  const supabase = await createClient()

  try {
    // 1. Get the current user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      logger.error('Error getting user session', { sessionError })
      return NextResponse.json(
        { error: 'Failed to get user session' },
        { status: 500 }
      )
    }

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const userEmail = session.user.email

    // 2. Fetch the specific audit record
    const { data: auditData, error: auditError } = await supabase
      .from('audits')
      .select(
        `
        status,
        overall_score,
        report_pdf_url,
        user_id,
        requested_email
      `
      )
      .eq('id', auditId)
      .maybeSingle()

    if (auditError) {
      logger.error('Error fetching audit data', { auditId, auditError })
      return NextResponse.json(
        { error: 'Failed to fetch audit data' },
        { status: 500 }
      )
    }

    if (!auditData) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
    }

    // 3. Authorize the request
    const isAuthorized =
      (auditData.user_id && auditData.user_id === userId) ||
      (!auditData.user_id && auditData.requested_email === userEmail)

    if (!isAuthorized) {
      logger.warn('User unauthorized to access audit', {
        auditId,
        userId,
        userEmail,
      })
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 4. Return the relevant audit status and data
    return NextResponse.json({
      status: auditData.status,
      overall_score: auditData.overall_score,
      report_pdf_url: auditData.report_pdf_url,
    })
  } catch (error) {
    logger.error('Unexpected error in audit status route', { auditId, error })
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
