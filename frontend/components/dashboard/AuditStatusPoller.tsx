'use client'

import { useEffect, useRef } from 'react'

interface AuditStatusPollerProps {
  auditId: string
  initialStatus:
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | string
    | null // Accept string/null initially
  onUpdate: (updatedAudit: {
    status: string | null
    overall_score: number | null
    report_pdf_url: string | null
    performance_score: number | null
    seo_score: number | null
    conversion_score: number | null
    branding_score: number | null
    presence_score: number | null
  }) => void
  pollInterval?: number // Optional interval in ms (defaults to 5000)
}

// This component doesn't render anything itself, it just polls.
export default function AuditStatusPoller({
  auditId,
  initialStatus,
  onUpdate,
  pollInterval = 5000,
}: AuditStatusPollerProps) {
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Only poll if the initial status suggests it's ongoing
    const isOngoing =
      initialStatus === 'pending' || initialStatus === 'processing'

    if (isOngoing) {
      const poll = async () => {
        try {
          const response = await fetch(`/api/audit/${auditId}/status`)
          if (!response.ok) {
            console.error(
              `Polling failed for ${auditId}: ${response.status} ${response.statusText}`
            )
            // Consider stopping polling on certain errors (e.g., 404, 403)
            if (response.status === 404 || response.status === 403) {
              if (intervalIdRef.current) clearInterval(intervalIdRef.current)
            }
            return // Don't proceed if fetch failed
          }

          const data = await response.json()

          // Call the update callback with the fetched data
          onUpdate(data)

          // Stop polling if the status is final
          if (data.status === 'completed' || data.status === 'failed') {
            if (intervalIdRef.current) {
              clearInterval(intervalIdRef.current)
              intervalIdRef.current = null // Clear the ref
            }
          }
        } catch (error) {
          console.error(`Error during polling fetch for ${auditId}:`, error)
          // Optionally stop polling on error
          if (intervalIdRef.current) clearInterval(intervalIdRef.current)
        }
      }

      // Start polling immediately and then set interval
      poll() // Initial poll
      intervalIdRef.current = setInterval(poll, pollInterval)
    } else {
      // If status is already completed/failed initially, ensure no interval is running
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = null
      }
    }

    // Cleanup function: clear interval on unmount or when dependencies change
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
      }
    }
  }, [auditId, initialStatus, onUpdate, pollInterval]) // Re-run if these change

  return null // This component does not render anything visual
}
