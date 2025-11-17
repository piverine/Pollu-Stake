'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatTimestamp, formatEth, formatAddress } from '@/lib/utils'
import { MOCK_SLASH_EVENTS } from '@/services/mockData'
import { AlertTriangle } from 'lucide-react'

export default function SlashMonitorPage() {
  const [slashEvents] = useState(MOCK_SLASH_EVENTS)

  const totalSlashed = slashEvents.reduce(
    (acc, event) => acc + parseFloat(event.amount),
    0
  )
  const autoSlashes = slashEvents.filter((e) => e.triggered_by === 'oracle').length
  const manualSlashes = slashEvents.filter((e) => e.triggered_by === 'manual').length

  return (
    <div className="min-h-screen bg-charcoal-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal-900">Slash Monitor</h1>
          <p className="mt-2 text-charcoal-600">Live feed of compliance penalties and stake slashing</p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">Total Slashed</p>
                  <p className="mt-1 text-2xl font-bold text-red-600">
                    {formatEth(totalSlashed)} ETH
                  </p>
                </div>
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-charcoal-600">AI-Triggered</p>
                <p className="mt-1 text-2xl font-bold text-charcoal-900">{autoSlashes}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-charcoal-600">Manual</p>
                <p className="mt-1 text-2xl font-bold text-charcoal-900">{manualSlashes}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Slash Events</CardTitle>
            <CardDescription>Complete history of all slashing actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {slashEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border border-charcoal-200 p-4 hover:bg-charcoal-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-charcoal-900">{event.factoryName}</p>
                          <Badge
                            variant={event.triggered_by === 'oracle' ? 'warning' : 'default'}
                          >
                            {event.triggered_by === 'oracle' ? 'Oracle Triggered' : event.triggered_by === 'manual' ? 'Manual' : 'DAO'}
                          </Badge>
                        </div>
                      <p className="mt-1 text-sm text-charcoal-600">{event.reason}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-charcoal-500">
                        <span>{formatTimestamp(event.timestamp)}</span>
                        <span className="font-mono">Tx: {formatAddress(event.txHash)}</span>
                      </div>
                    </div>
                    <p className="ml-3 text-lg font-semibold text-red-600">
                      -{formatEth(event.amount)} ETH
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
