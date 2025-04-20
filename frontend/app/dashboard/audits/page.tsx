'use client'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createClient } from '@/utils/supabase/client'
import { FileDown } from 'lucide-react'
import { useEffect, useState } from 'react'

// Define the full Audit interface based on needed columns
interface Audit {
  id: string
  website_url: string
  created_at: string
  overall_score: number
  performance_score: number
  seo_score: number
  conversion_score: number
  branding_score: number
  presence_score: number
  report_pdf_url: string | null
  // Add other fields if needed from 'audits' table
}

// Force dynamic rendering for this authenticated page
export const dynamic = 'force-dynamic'

export default function AuditsPage() {
  // Use state for audits and loading
  const [audits, setAudits] = useState<Audit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      let userId = null // Variable to hold the user ID
      try {
        // Get user first
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError || !user) {
          console.error('User not found, cannot fetch audits', userError)
          // Optionally redirect or show error
          setIsLoading(false)
          setAudits([]) // Ensure audits are empty if no user
          return
        }
        userId = user.id // Store the user ID

        // Fetch all audits for the user
        const { data, error } = await supabase
          .from('audits')
          .select('*') // Select all columns needed for the table
          .eq('user_id', userId) // Use the fetched user ID
          .order('created_at', { ascending: false })

        if (error) throw error

        setAudits((data as Audit[]) || [])
      } catch (error) {
        console.error('Error fetching audits:', error)
        setAudits([]) // Clear audits on error
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [supabase])

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // Function to render score with color
  const renderScore = (score: number) => {
    let color = 'text-gray-500'
    if (score >= 90) color = 'text-green-500'
    else if (score >= 70) color = 'text-yellow-500'
    else if (score >= 0) color = 'text-red-500'

    return <span className={`font-semibold ${color}`}>{score}</span>
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg
          className="animate-spin h-8 w-8 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    )
  }

  // Empty State
  if (!isLoading && audits.length === 0) {
    return (
      <div className="space-y-6 text-center py-10">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit History</h2>
          <p className="text-muted-foreground">
            You haven&apos;t analyzed any websites yet.
          </p>
        </div>
        {/* Optional: Add a button/link to the main dashboard to start an analysis */}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Audit History</h2>
        <p className="text-muted-foreground">
          View and manage your previous website audits
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Website</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-center">Overall</TableHead>
              <TableHead className="text-center">Performance</TableHead>
              <TableHead className="text-center">SEO</TableHead>
              <TableHead className="text-center">Conversion</TableHead>
              <TableHead className="text-center">Branding</TableHead>
              <TableHead className="text-center">Presence</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {audits.map((audit) => (
              <TableRow key={audit.id}>
                <TableCell className="font-medium">
                  {audit.website_url}
                </TableCell>
                <TableCell>{formatDate(audit.created_at)}</TableCell>
                <TableCell className="text-center">
                  {renderScore(audit.overall_score)}
                </TableCell>
                <TableCell className="text-center">
                  {renderScore(audit.performance_score)}
                </TableCell>
                <TableCell className="text-center">
                  {renderScore(audit.seo_score)}
                </TableCell>
                <TableCell className="text-center">
                  {renderScore(audit.conversion_score)}
                </TableCell>
                <TableCell className="text-center">
                  {renderScore(audit.branding_score)}
                </TableCell>
                <TableCell className="text-center">
                  {renderScore(audit.presence_score)}
                </TableCell>
                <TableCell className="text-right">
                  {audit.report_pdf_url ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      title="Download PDF Report"
                    >
                      <a
                        href={audit.report_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <FileDown className="h-4 w-4" />
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled
                      title="Report not available"
                    >
                      <FileDown className="h-4 w-4 opacity-50" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
