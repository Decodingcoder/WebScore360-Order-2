import { createClient as createServiceRoleClient } from '@supabase/supabase-js' // Use the standard JS client for service role
import { NextResponse } from 'next/server'

// NOTE: Ensure these environment variables are set in your deployment!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: Request) {
  // Validate environment variables
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables')
    return NextResponse.json(
      { error: 'Server configuration error.' },
      { status: 500 }
    )
  }

  // Create a client with the SERVICE ROLE KEY
  const supabase = createServiceRoleClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: { persistSession: false }, // No need to persist session for service role
    }
  )

  try {
    const { websiteUrl, email } = await request.json()

    // Basic validation
    if (!websiteUrl || !email) {
      return NextResponse.json(
        { error: 'Website URL and Email are required' },
        { status: 400 }
      )
    }

    // TODO: Add more robust URL and email validation if needed

    // Insert the audit request into the database
    // We only insert the requested email and URL initially.
    // Scores and user_id will be updated later.
    const { data, error } = await supabase
      .from('audits')
      .insert([
        {
          requested_email: email,
          website_url: websiteUrl,
          // Initialize scores/status as needed, e.g., null or 'pending'
          overall_score: null,
          performance_score: null,
          seo_score: null,
          conversion_score: null,
          branding_score: null,
          presence_score: null,
          status: 'pending', // Add a status column if you don't have one
        },
      ])
      .select() // Select the inserted data if needed, otherwise remove
      .single() // Expecting a single row inserted

    if (error) {
      console.error('Supabase insert error:', error)
      // Don't expose detailed error to client
      return NextResponse.json(
        { error: 'Failed to save audit request.' },
        { status: 500 }
      )
    }

    // Return a simple success response. Frontend will handle redirect.
    // Returning the created audit ID might be useful later.
    return NextResponse.json(
      { success: true, auditId: data?.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('API Error:', error)
    // Handle JSON parsing errors or other unexpected issues
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
