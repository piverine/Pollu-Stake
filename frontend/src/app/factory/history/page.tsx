'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table'
import { AlertTriangle, TrendingDown, Calendar, FileText } from 'lucide-react'
import { formatTimestamp, formatEth, formatAddress } from '@/lib/utils'
import { MOCK_SLASH_EVENTS } from '@/services/mockData'

export default function SlashHistoryPage() {
  const factoryId = 'Bhilai-001'
  const slashEvents = MOCK_SLASH_EVENTS.filter((e) => e.factoryId === factoryId)
  
  const totalSlashed = slashEvents.reduce((acc, event) => acc + parseFloat(event.amount), 0)
  const oracleSlashes = slashEvents.filter((e) => e.triggered_by === 'oracle').length
  const manualSlashes = slashEvents.filter((e) => e.triggered_by === 'manual').length
  const daoSlashes = slashEvents.filter((e) => e.triggered_by === 'dao').length

  return (
    <div className="min-h-screen bg-charcoal-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal-900">Slash History</h1>
          <p className="mt-2 text-charcoal-600">Record of compliance penalties for your factory</p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">Total Slashed</p>
                  <p className="mt-1 text-2xl font-bold text-red-600">
                    {formatEth(totalSlashed)} ETH
                  </p>
                </div>
                <TrendingDown className="h-10 w-10 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-charcoal-600">Total Events</p>
                <p className="mt-1 text-2xl font-bold text-charcoal-900">{slashEvents.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-charcoal-600">Oracle Triggered</p>
                <p className="mt-1 text-2xl font-bold text-orange-600">{oracleSlashes}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-charcoal-600">Manual/DAO</p>
                <p className="mt-1 text-2xl font-bold text-charcoal-900">
                  {manualSlashes + daoSlashes}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle>Slash Events</CardTitle>
            </div>
            <CardDescription>Complete history of all slashing penalties</CardDescription>
          </CardHeader>
          <CardContent>
            {slashEvents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Triggered By</TableHead>
                    <TableHead>Transaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slashEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-charcoal-400" />
                          {formatTimestamp(event.timestamp)}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-red-600">
                        -{formatEth(event.amount)} ETH
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm text-charcoal-900">{event.reason}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            event.triggered_by === 'oracle'
                              ? 'warning'
                              : event.triggered_by === 'manual'
                              ? 'default'
                              : 'info'
                          }
                        >
                          {event.triggered_by === 'oracle'
                            ? 'Oracle'
                            : event.triggered_by === 'manual'
                            ? 'Manual'
                            : 'DAO'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`https://etherscan.io/tx/${event.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary-600 hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          {formatAddress(event.txHash)}
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center text-charcoal-500">
                <AlertTriangle className="mx-auto h-12 w-12 mb-3 text-charcoal-300" />
                <p className="text-lg font-medium">No slash events recorded</p>
                <p className="text-sm mt-1">Your factory has maintained perfect compliance!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-charcoal-900">Oracle Slashing</p>
                  <p className="text-xs text-charcoal-600">
                    Automated penalties triggered by AI forecasts
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-charcoal-900">Manual Slashing</p>
                  <p className="text-xs text-charcoal-600">
                    Penalties applied by regulators or admins
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <TrendingDown className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-charcoal-900">DAO Slashing</p>
                  <p className="text-xs text-charcoal-600">
                    Penalties decided by DAO governance votes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
