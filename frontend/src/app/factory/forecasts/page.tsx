'use client'

import { useState } from 'react'
import { usePolling } from '@/hooks/usePolling'
import { getForecast } from '@/services/aiApiClient'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AlertTriangle, CheckCircle2, TrendingUp, Clock, Activity, BarChart3 } from 'lucide-react'
import { ForecastData } from '@/types'
import toast from 'react-hot-toast'

export default function ForecastsPage() {
  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [forecastEnabled, setForecastEnabled] = useState(true)
  const [isToggling, setIsToggling] = useState(false)

  const factoryId = 'Bhilai-001'

  // Poll forecast data every 10 seconds
  usePolling(
    async () => {
      if (forecastEnabled) {
        try {
          const data = await getForecast(factoryId)
          setForecast(data)
        } catch (error) {
          console.error('Failed to fetch forecast:', error)
        }
      }
    },
    { interval: 10000, enabled: forecastEnabled }
  )

  const handleToggleForecast = async () => {
    setIsToggling(true)
    try {
      // TODO: Implement actual API call to toggle forecast
      await new Promise((resolve) => setTimeout(resolve, 500))
      setForecastEnabled(!forecastEnabled)
      toast.success(
        `Forecast monitoring ${!forecastEnabled ? 'enabled' : 'disabled'} successfully`
      )
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle forecast')
    } finally {
      setIsToggling(false)
    }
  }

  const getRiskLevel = (aqi: number) => {
    if (aqi < 50) return { level: 'Good', color: 'text-green-600', bg: 'bg-green-50' }
    if (aqi < 100) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    if (aqi < 150) return { level: 'Unhealthy', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { level: 'Hazardous', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const forecastBreachAlert = forecast?.forecast_breach
  const risk = forecast ? getRiskLevel(forecast.predicted_aqi) : null

  return (
    <div className="min-h-screen bg-charcoal-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-charcoal-900">AI Pollution Forecasts</h1>
              <p className="mt-2 text-charcoal-600">Real-time AQI predictions and breach alerts</p>
            </div>
            <Button
              onClick={handleToggleForecast}
              isLoading={isToggling}
              variant={forecastEnabled ? 'outline' : 'primary'}
            >
              {forecastEnabled ? 'Disable Monitoring' : 'Enable Monitoring'}
            </Button>
          </div>
        </div>

        {/* Alert Banner */}
        {forecastBreachAlert && forecastEnabled && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border-2 border-red-500 bg-red-50 p-4 text-red-900">
            <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0" />
            <div>
              <p className="font-semibold">⚠️ Breach Predicted!</p>
              <p className="mt-1 text-sm">
                AI forecast indicates a potential AQI violation (Predicted: {forecast?.predicted_aqi}{' '}
                AQI, Confidence: {forecast && (forecast.confidence * 100).toFixed(0)}%). Please
                review remediation steps immediately to avoid slashing.
              </p>
            </div>
          </div>
        )}

        {/* Current Forecast */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary-600" />
                <CardTitle>Current Forecast</CardTitle>
              </div>
              {forecastEnabled && (
                <Badge variant="success">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live
                  </div>
                </Badge>
              )}
            </div>
            <CardDescription>Latest AI-powered pollution prediction</CardDescription>
          </CardHeader>
          <CardContent>
            {!forecastEnabled ? (
              <div className="py-8 text-center text-charcoal-500">
                <Activity className="mx-auto h-12 w-12 mb-2 text-charcoal-400" />
                <p>Forecast monitoring is disabled</p>
                <p className="text-sm mt-1">Enable monitoring to receive real-time predictions</p>
              </div>
            ) : forecast ? (
              <div className="space-y-6">
                {/* Main Prediction */}
                <div className={`rounded-xl p-6 ${risk?.bg}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-charcoal-600">Predicted AQI</p>
                      <p className={`mt-1 text-5xl font-bold ${risk?.color}`}>
                        {forecast.predicted_aqi}
                      </p>
                      <p className={`mt-1 text-sm font-medium ${risk?.color}`}>
                        {risk?.level}
                      </p>
                    </div>
                    {forecast.forecast_breach ? (
                      <AlertTriangle className="h-16 w-16 text-red-600" />
                    ) : (
                      <CheckCircle2 className="h-16 w-16 text-green-600" />
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-charcoal-200 p-4">
                    <p className="text-sm text-charcoal-600">Confidence Level</p>
                    <p className="mt-1 text-2xl font-bold text-charcoal-900">
                      {(forecast.confidence * 100).toFixed(0)}%
                    </p>
                    <div className="mt-2 h-2 w-full rounded-full bg-charcoal-200">
                      <div
                        className="h-2 rounded-full bg-primary-600"
                        style={{ width: `${forecast.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-charcoal-200 p-4">
                    <p className="text-sm text-charcoal-600">Breach Risk</p>
                    <Badge
                      variant={forecast.forecast_breach ? 'danger' : 'success'}
                      className="mt-2"
                    >
                      {forecast.forecast_breach ? 'HIGH RISK' : 'LOW RISK'}
                    </Badge>
                  </div>

                  <div className="rounded-lg border border-charcoal-200 p-4">
                    <p className="text-sm text-charcoal-600">Next Update</p>
                    <div className="mt-2 flex items-center gap-1 text-charcoal-900">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">10 seconds</span>
                    </div>
                  </div>
                </div>

                {/* Historical Context */}
                <div className="rounded-lg border border-charcoal-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-5 w-5 text-charcoal-600" />
                    <h4 className="font-semibold text-charcoal-900">Forecast Details</h4>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-charcoal-600">Factory ID:</span>
                      <span className="font-medium text-charcoal-900">{forecast.factory_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-600">Last Updated:</span>
                      <span className="font-medium text-charcoal-900">
                        {new Date(forecast.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-600">Next Check:</span>
                      <span className="font-medium text-charcoal-900">
                        {new Date(forecast.next_check).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-charcoal-500">
                <TrendingUp className="mx-auto h-12 w-12 mb-2 text-charcoal-400 animate-pulse" />
                <p>Loading forecast data...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How AI Forecasting Works</CardTitle>
            <CardDescription>Understanding the prediction system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-charcoal-900">Data Collection</h4>
                  <p className="mt-1 text-sm text-charcoal-600">
                    The system continuously monitors your factory's operational data, weather conditions, 
                    and historical pollution patterns.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-charcoal-900">AI Analysis</h4>
                  <p className="mt-1 text-sm text-charcoal-600">
                    Machine learning models analyze patterns and predict future AQI levels with 
                    confidence scores based on model certainty.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-charcoal-900">Breach Detection</h4>
                  <p className="mt-1 text-sm text-charcoal-600">
                    If predicted AQI exceeds regulatory thresholds (typically 150), the system 
                    flags a potential breach and triggers alerts.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-charcoal-900">Automated Action</h4>
                  <p className="mt-1 text-sm text-charcoal-600">
                    If breach confidence is high, the system may automatically initiate stake 
                    slashing as part of the compliance enforcement mechanism.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
