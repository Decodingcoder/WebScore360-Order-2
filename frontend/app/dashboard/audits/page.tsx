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
import { FileDown } from 'lucide-react'
import { useState } from 'react'

// Test data for audit history
const testAudits = [
  {
    id: '1',
    url: 'https://example.com',
    date: '2025-04-15T14:30:00',
    score: 87,
    performance: 92,
    seo: 85,
    conversion: 76,
    branding: 90,
    presence: 82,
    status: 'completed',
  },
  {
    id: '2',
    url: 'https://testsite.org',
    date: '2025-04-10T09:15:00',
    score: 73,
    performance: 68,
    seo: 80,
    conversion: 71,
    branding: 75,
    presence: 69,
    status: 'completed',
  },
  {
    id: '3',
    url: 'https://mystore.shop',
    date: '2025-04-05T16:45:00',
    score: 91,
    performance: 88,
    seo: 94,
    conversion: 89,
    branding: 93,
    presence: 90,
    status: 'completed',
  },
  {
    id: '4',
    url: 'https://blog.example.com',
    date: '2025-04-28T11:20:00',
    score: 65,
    performance: 59,
    seo: 72,
    conversion: 60,
    branding: 68,
    presence: 70,
    status: 'completed',
  },
  {
    id: '5',
    url: 'https://portfolio.dev',
    date: '2025-04-20T13:10:00',
    score: 82,
    performance: 78,
    seo: 88,
    conversion: 79,
    branding: 85,
    presence: 80,
    status: 'completed',
  },
]

export default function AuditsPage() {
  const [audits] = useState(testAudits)

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

  // Function to handle PDF download
  const handleDownloadPDF = (id: string) => {
    console.log(`Downloading PDF for audit ${id}`)
    // Actual PDF download logic would go here
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
                <TableCell className="font-medium">{audit.url}</TableCell>
                <TableCell>{formatDate(audit.date)}</TableCell>
                <TableCell className="text-center">
                  {renderScore(audit.score)}
                </TableCell>
                <TableCell className="text-center">
                  {renderScore(audit.performance)}
                </TableCell>
                <TableCell className="text-center">
                  {renderScore(audit.seo)}
                </TableCell>
                <TableCell className="text-center">
                  {renderScore(audit.conversion)}
                </TableCell>
                <TableCell className="text-center">
                  {renderScore(audit.branding)}
                </TableCell>
                <TableCell className="text-center">
                  {renderScore(audit.presence)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownloadPDF(audit.id)}
                    title="Download PDF Report"
                  >
                    <FileDown className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
