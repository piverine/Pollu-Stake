'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle2, AlertCircle, FileText, TrendingUp, Shield } from 'lucide-react'
import { MOCK_REMEDIATION_STEPS } from '@/services/mockData'
import { RemediationStep } from '@/types'
import { formatTimestamp } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function CompliancePage() {
  const [remediationSteps, setRemediationSteps] = useState<RemediationStep[]>(
    MOCK_REMEDIATION_STEPS
  )

  const complianceScore = 78
  const completedSteps = remediationSteps.filter((s) => s.completed).length
  const totalSteps = remediationSteps.length

  const toggleRemediationStep = (id: string) => {
    setRemediationSteps((steps) =>
      steps.map((step) => {
        if (step.id === id) {
          const newCompleted = !step.completed
          if (newCompleted) {
            toast.success(`Marked "${step.title}" as complete`)
          }
          return { ...step, completed: newCompleted }
        }
        return step
      })
    )
  }

  const getComplianceLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' }
    if (score >= 60) return { level: 'Good', color: 'text-primary-600', bg: 'bg-primary-50' }
    if (score >= 40) return { level: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    return { level: 'Poor', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const compliance = getComplianceLevel(complianceScore)

  return (
    <div className="min-h-screen bg-charcoal-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal-900">Compliance Dashboard</h1>
          <p className="mt-2 text-charcoal-600">Track your environmental compliance status</p>
        </div>

        {/* Compliance Score */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary-600" />
              <CardTitle>Compliance Score</CardTitle>
            </div>
            <CardDescription>Your current environmental compliance rating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`rounded-xl p-6 ${compliance.bg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">Overall Score</p>
                  <p className={`mt-1 text-5xl font-bold ${compliance.color}`}>
                    {complianceScore}
                    <span className="text-2xl">/100</span>
                  </p>
                  <p className={`mt-1 text-sm font-medium ${compliance.color}`}>
                    {compliance.level}
                  </p>
                </div>
                <div className="text-right">
                  <TrendingUp className={`h-16 w-16 ${compliance.color}`} />
                </div>
              </div>
              <div className="mt-4">
                <div className="h-3 w-full rounded-full bg-white/50">
                  <div
                    className={`h-3 rounded-full ${compliance.color.replace('text-', 'bg-')}`}
                    style={{ width: `${complianceScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">Remediation Tasks</p>
                  <p className="mt-1 text-2xl font-bold text-charcoal-900">
                    {completedSteps}/{totalSteps}
                  </p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-primary-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">Pending Actions</p>
                  <p className="mt-1 text-2xl font-bold text-orange-600">
                    {totalSteps - completedSteps}
                  </p>
                </div>
                <AlertCircle className="h-10 w-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">Completion Rate</p>
                  <p className="mt-1 text-2xl font-bold text-primary-600">
                    {Math.round((completedSteps / totalSteps) * 100)}%
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-primary-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Remediation Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Remediation Action Plan</CardTitle>
            <CardDescription>
              Recommended actions to improve compliance and reduce environmental impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {remediationSteps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-start gap-3 rounded-lg border border-charcoal-200 p-4 transition-colors hover:bg-charcoal-50 cursor-pointer"
                  onClick={() => toggleRemediationStep(step.id)}
                >
                  <input
                    type="checkbox"
                    checked={step.completed}
                    onChange={() => toggleRemediationStep(step.id)}
                    className="mt-1 h-5 w-5 cursor-pointer rounded border-charcoal-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <h4
                      className={`font-medium ${
                        step.completed ? 'text-charcoal-500 line-through' : 'text-charcoal-900'
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p className="mt-1 text-sm text-charcoal-600">{step.description}</p>
                    {step.dueDate && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-charcoal-500">
                        <FileText className="h-3 w-3" />
                        Due: {formatTimestamp(step.dueDate)}
                      </div>
                    )}
                  </div>
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-primary-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Guidelines</CardTitle>
            <CardDescription>Key requirements for maintaining environmental standards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border border-charcoal-200 p-4">
                <h4 className="font-semibold text-charcoal-900">📊 AQI Monitoring</h4>
                <p className="mt-2 text-sm text-charcoal-600">
                  Maintain Air Quality Index below regulatory thresholds (typically 150 AQI). 
                  Regular monitoring and reporting is mandatory.
                </p>
              </div>
              <div className="rounded-lg border border-charcoal-200 p-4">
                <h4 className="font-semibold text-charcoal-900">💰 Stake Requirements</h4>
                <p className="mt-2 text-sm text-charcoal-600">
                  Maintain minimum stake balance of 5.0 ETH. Higher stakes demonstrate commitment 
                  and can reduce penalty severity.
                </p>
              </div>
              <div className="rounded-lg border border-charcoal-200 p-4">
                <h4 className="font-semibold text-charcoal-900">⚠️ Breach Response</h4>
                <p className="mt-2 text-sm text-charcoal-600">
                  When AI forecasts predict a breach, implement remediation steps within 24 hours 
                  to avoid automatic slashing penalties.
                </p>
              </div>
              <div className="rounded-lg border border-charcoal-200 p-4">
                <h4 className="font-semibold text-charcoal-900">📋 Documentation</h4>
                <p className="mt-2 text-sm text-charcoal-600">
                  Keep detailed records of all environmental compliance activities, remediation 
                  efforts, and operational changes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
