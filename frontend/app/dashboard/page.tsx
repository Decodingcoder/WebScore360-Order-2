'use client'

import AnalyzeForm from '@/components/dashboard/AnalyzeForm'
import AuditStatusPoller from '@/components/dashboard/AuditStatusPoller'
import ScoreCard from '@/components/dashboard/ScoreCard'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { FileDown, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

// Force dynamic rendering for this authenticated page
export const dynamic = 'force-dynamic'

interface Audit {
  id: string
  user_id: string | null
  requested_email: string
  website_url: string
  created_at: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | null
  overall_score: number | null
  performance_score: number | null
  seo_score: number | null
  conversion_score: number | null
  branding_score: number | null
  presence_score: number | null
  report_pdf_url: string | null
  raw_data: Record<string, unknown>
}

interface PolledAuditData {
  status: string | null
  overall_score: number | null
  report_pdf_url: string | null
  performance_score: number | null
  seo_score: number | null
  conversion_score: number | null
  branding_score: number | null
  presence_score: number | null
}

export default function Dashboard() {
  const [subscription, setSubscription] = useState<
    'free' | 'pro' | 'business_plus'
  >('free')
  const [auditsRemaining, setAuditsRemaining] = useState(1)
  const [latestAudit, setLatestAudit] = useState<Audit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [recentAudits, setRecentAudits] = useState<Audit[]>([])
  const [totalAudits, setTotalAudits] = useState<number>(0)
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showUpgradeSuccessDialog, setShowUpgradeSuccessDialog] =
    useState(false)

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      setShowUpgradeSuccessDialog(true)
      router.replace('/dashboard', { scroll: false })
    }
  }, [searchParams, router])

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      try {
        // Get user first
        const {
          data: { user: fetchedUser },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !fetchedUser) {
          console.error('Error fetching user or user not logged in:', userError)
          router.push('/login') // Redirect if no user
          return
        }
        setUser(fetchedUser) // Set user state

        // Get user profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', fetchedUser.id)
          .single()

        if (profile) {
          setSubscription(profile.subscription_tier)
          setAuditsRemaining(profile.audits_remaining)
        }

        // Define columns to select (including status)
        const auditSelectColumns = `
          id,
          user_id,
          requested_email,
          website_url,
          created_at,
          status, 
          overall_score,
          performance_score,
          seo_score,
          conversion_score,
          branding_score,
          presence_score,
          report_pdf_url,
          raw_data
        `

        // --- Fetch Audit Data Concurrently ---
        const auditPromises = [
          // Get latest audit (limit 1)
          supabase
            .from('audits')
            .select(auditSelectColumns) // Use defined columns
            .eq('user_id', fetchedUser.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(), // Use maybeSingle for latest

          // Get recent 3 audits (limit 3)
          supabase
            .from('audits')
            .select(auditSelectColumns) // Use defined columns
            .eq('user_id', fetchedUser.id)
            .order('created_at', { ascending: false })
            .limit(3),

          // Get total audit count
          supabase
            .from('audits')
            .select('count', { count: 'exact', head: true })
            .eq('user_id', fetchedUser.id),
        ]

        const [latestAuditResult, recentAuditsResult, totalAuditsResult] =
          await Promise.all(auditPromises)

        // Process results
        if (latestAuditResult.error)
          console.error('Error fetching latest audit:', latestAuditResult.error)
        else setLatestAudit(latestAuditResult.data as Audit | null)

        if (recentAuditsResult.error)
          console.error(
            'Error fetching recent audits:',
            recentAuditsResult.error
          )
        else setRecentAudits((recentAuditsResult.data as Audit[]) || [])

        if (totalAuditsResult.error)
          console.error(
            'Error fetching total audits count:',
            totalAuditsResult.error
          )
        else setTotalAudits(totalAuditsResult.count ?? 0)
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [supabase, router])

  // --- State Update Handlers for Poller --- START
  const handleLatestAuditUpdate = useCallback(
    (updatedData: PolledAuditData) => {
      setLatestAudit((prevAudit) => {
        if (!prevAudit) return null // Should not happen if poller is running
        // Create a new object with updated fields, including category scores
        return {
          ...prevAudit,
          status: updatedData.status as Audit['status'], // Cast status
          overall_score: updatedData.overall_score,
          report_pdf_url: updatedData.report_pdf_url,
          performance_score: updatedData.performance_score,
          seo_score: updatedData.seo_score,
          conversion_score: updatedData.conversion_score,
          branding_score: updatedData.branding_score,
          presence_score: updatedData.presence_score,
        }
      })
    },
    []
  )

  const handleRecentAuditUpdate = useCallback(
    (auditId: string, updatedData: PolledAuditData) => {
      setRecentAudits((prevAudits) =>
        prevAudits.map((audit) => {
          if (audit.id === auditId) {
            // Create a new object for the updated audit, including category scores
            return {
              ...audit,
              status: updatedData.status as Audit['status'], // Cast status
              overall_score: updatedData.overall_score,
              report_pdf_url: updatedData.report_pdf_url,
              performance_score: updatedData.performance_score,
              seo_score: updatedData.seo_score,
              conversion_score: updatedData.conversion_score,
              branding_score: updatedData.branding_score,
              presence_score: updatedData.presence_score,
            }
          }
          return audit // Return unchanged audit
        })
      )
    },
    []
  )
  // --- State Update Handlers for Poller --- END

  // Helper function to render traffic light color based on score
  const getScoreColor = (score: number | null) => {
    // Handle null case
    if (score === null) {
      return 'bg-gray-400 dark:bg-gray-600' // Default color for null/processing
    }
    // Existing logic for actual scores
    if (score >= 80) return 'bg-green-500'
    if (score >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).format(date)
  }

  // Function to render score with color OR processing indicator
  const renderScoreOrStatus = (audit: Audit) => {
    if (audit.status === 'completed' && audit.overall_score !== null) {
      return renderScore(audit.overall_score) // Existing score rendering
    } else if (audit.status === 'processing' || audit.status === 'pending') {
      return (
        <span className="flex items-center justify-center text-xs text-blue-600 dark:text-blue-400">
          <Loader2 className="animate-spin h-3 w-3 mr-1" />
          Processing...
        </span>
      )
    } else if (audit.status === 'failed') {
      return (
        <span className="text-xs text-red-600 dark:text-red-400">Failed</span>
      )
    } else {
      // Fallback if status is unexpected or score is null for completed
      return <span className="text-gray-400">-</span>
    }
  }

  // Function to render score with color
  const renderScore = (score: number | null) => {
    if (score === null || score === undefined) {
      return <span className="text-gray-400">-</span>
    }
    let color = 'text-gray-600 dark:text-gray-400'
    if (score >= 80) color = 'text-green-600 dark:text-green-400'
    else if (score >= 50) color = 'text-yellow-600 dark:text-yellow-400'
    else if (score >= 0) color = 'text-red-600 dark:text-red-400'

    return <span className={`font-semibold ${color}`}>{Math.round(score)}</span>
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Subscription Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                Your Plan:{' '}
                <span
                  className={
                    subscription === 'business_plus'
                      ? 'text-purple-600 dark:text-purple-400'
                      : subscription === 'pro'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }
                >
                  {subscription === 'business_plus'
                    ? 'Business+'
                    : subscription === 'pro'
                    ? 'Pro'
                    : 'Free'}
                </span>
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {/* Conditionally render count only if not business_plus */}
                {subscription !== 'business_plus' && (
                  <>
                    {auditsRemaining}{' '}
                    {`of ${subscription === 'pro' ? '30' : '1'}`}{' '}
                  </>
                )}
                {subscription === 'business_plus' && 'Unlimited '}
                audits remaining this month
              </p>
            </div>
            {subscription !== 'business_plus' && (
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
                asChild
              >
                <Link href="/dashboard/upgrade">Upgrade Plan</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Latest Audit Section (Conditional Rendering) */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Latest Audit Results</h2>
        {(() => {
          // Handle loading state first (handled globally)
          if (isLoading) {
            return (
              <Card>
                <CardContent className="p-4 h-48 flex justify-center items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            )
          }

          // Handle no audit case
          if (!latestAudit) {
            return (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground">
                  You haven&apos;t analyzed any websites yet. Run your first
                  analysis below!
                </CardContent>
              </Card>
            )
          }

          // Define whether the latest audit is ongoing
          const isLatestAuditOngoing =
            latestAudit.status === 'pending' ||
            latestAudit.status === 'processing'

          // Handle processing state
          if (isLatestAuditOngoing) {
            return (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Analysis In Progress
                  </CardTitle>
                  <CardDescription>
                    Started on{' '}
                    {new Date(latestAudit.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center justify-center space-y-3 text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                  <p className="font-medium">Processing analysis for:</p>
                  <p className="text-muted-foreground break-all">
                    {latestAudit.website_url}
                  </p>
                  {/* Add the poller component here */}
                  <AuditStatusPoller
                    auditId={latestAudit.id}
                    initialStatus={latestAudit.status}
                    onUpdate={handleLatestAuditUpdate}
                  />
                </CardContent>
              </Card>
            )
          }

          // Handle Failed State
          if (latestAudit.status === 'failed') {
            return (
              <Card>
                {/* Simple failure message, can be enhanced */}
                <CardHeader className="bg-destructive/10">
                  <CardTitle className="text-destructive">
                    Analysis Failed
                  </CardTitle>
                  <CardDescription>
                    For: {latestAudit.website_url}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 text-center text-destructive">
                  Something went wrong during the analysis. Please try again or
                  contact support.
                </CardContent>
              </Card>
            )
          }

          // Handle completed state (render score cards)
          if (latestAudit.status === 'completed') {
            return (
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold ${getScoreColor(
                          latestAudit.overall_score
                        )} shrink-0`}
                      >
                        {latestAudit.overall_score !== null
                          ? Math.round(latestAudit.overall_score)
                          : '-'}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold break-all">
                          {latestAudit.website_url}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Analyzed on{' '}
                          {new Date(
                            latestAudit.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {latestAudit.report_pdf_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="mt-1"
                      >
                        <a
                          href={latestAudit.report_pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                        >
                          Download Report
                        </a>
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                    <ScoreCard
                      title="Performance"
                      score={latestAudit.performance_score}
                      description="Page speed and technical aspects"
                    />
                    <ScoreCard
                      title="SEO"
                      score={latestAudit.seo_score}
                      description="Search engine optimization"
                    />
                    <ScoreCard
                      title="Conversion"
                      score={latestAudit.conversion_score}
                      description="Lead generation potential"
                    />
                    <ScoreCard
                      title="Branding"
                      score={latestAudit.branding_score}
                      description="Brand presentation and identity"
                    />
                    <ScoreCard
                      title="Presence"
                      score={latestAudit.presence_score}
                      description="Online presence and social media"
                    />
                  </div>
                </CardContent>
              </Card>
            )
          }

          // Fallback if status is unexpected
          return null
        })()}
      </div>

      {/* New Analysis Form */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Analyze a Website</h2>
        <Card>
          <CardContent className="p-4">
            <AnalyzeForm
              auditsRemaining={auditsRemaining}
              subscription={subscription}
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Audits */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Recent Audits</h2>
        <Card>
          <CardContent className="p-4">
            {recentAudits.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Website</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-center">
                        Status / Score
                      </TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAudits.map((audit) => {
                      const isAuditOngoing =
                        audit.status === 'pending' ||
                        audit.status === 'processing'
                      return (
                        <TableRow key={audit.id}>
                          <TableCell className="font-medium max-w-xs truncate">
                            {audit.website_url}
                          </TableCell>
                          <TableCell>{formatDate(audit.created_at)}</TableCell>
                          <TableCell className="text-center">
                            {renderScoreOrStatus(audit)}
                            {isAuditOngoing && (
                              <AuditStatusPoller
                                auditId={audit.id}
                                initialStatus={audit.status}
                                onUpdate={(updatedData) =>
                                  handleRecentAuditUpdate(audit.id, updatedData)
                                }
                              />
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {audit.status === 'completed' &&
                              audit.report_pdf_url && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  asChild
                                  title="Download Report"
                                >
                                  <a
                                    href={audit.report_pdf_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                  >
                                    <FileDown className="h-4 w-4 ml-1" />
                                  </a>
                                </Button>
                              )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                <div className="text-sm text-gray-500 dark:text-gray-400 px-2 py-3">
                  Showing {recentAudits.length} of {totalAudits} audits.{' '}
                  {totalAudits > recentAudits.length && (
                    <Link
                      href="/dashboard/audits"
                      className="text-blue-600 hover:underline"
                    >
                      View All
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                <p>You haven&apos;t analyzed any websites yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Success Dialog */}
      <Dialog
        open={showUpgradeSuccessDialog}
        onOpenChange={setShowUpgradeSuccessDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Successful!</DialogTitle>
            <DialogDescription>
              Your plan has been upgraded successfully. Enjoy your new features!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowUpgradeSuccessDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
