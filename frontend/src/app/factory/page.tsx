
'use client'

import { useState, useEffect } from 'react'
import { usePolling } from '@/hooks/usePolling'
import { useFactoryRegistration } from '@/hooks/useFactoryRegistration'
import { getForecast } from '@/services/aiApiClient'
import { stake } from '@/services/contractStubs'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PollutionTrendChart } from '@/components/charts/PollutionTrendChart'
import { StakeHistoryChart } from '@/components/charts/StakeHistoryChart'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table'
import { AlertTriangle, CheckCircle2, TrendingUp, Coins, FileText, Clock } from 'lucide-react'
import { formatTimestamp, formatEth } from '@/lib/utils'
import { ForecastData, RemediationStep, Factory } from '@/types'
import { MOCK_SLASH_EVENTS, MOCK_REMEDIATION_STEPS } from '@/services/mockData'
import toast from 'react-hot-toast'
import { useStore } from '@/store/useStore' // <-- Import the store
import { FactoryRegistrationModal } from '@/components/FactoryRegistrationModal'

// --- ADD THIS MISSING FUNCTION ---
// This function fetches from your backend's /api/dashboard-data
async function fetchAllDashboardData() {
  // This should point to your backend API, not the frontend's
  const response = await fetch('http://localhost:8000/api/dashboard-data');
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  return response.json();
}
// --- END OF MISSING FUNCTION ---

export default function FactoryDashboard() {
  const [stakeAmount, setStakeAmount] = useState('')
  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [isStaking, setIsStaking] = useState(false)
  const [remediationSteps, setRemediationSteps] = useState<RemediationStep[]>(
    MOCK_REMEDIATION_STEPS
  )
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [licenseFileUrl, setLicenseFileUrl] = useState<string | null>(null)
  const [registrationData, setRegistrationData] = useState<any>(null)
  
  // Check if user needs to complete factory registration
  const { needsRegistration, isChecking } = useFactoryRegistration()
  
  // --- Get ALL factory state from the global store ---
  const {
    factories,
    setFactories,
    updateFactory,
    activeFactoryId,
    setActiveFactoryId,
  } = useStore()
  
  // Get an array of all factories for the dropdown
  const allFactories = Object.values(factories)
  // Get the currently selected factory object
  const currentFactory = activeFactoryId ? factories[activeFactoryId] : null

  // Show registration modal if user needs to complete registration
  useEffect(() => {
    if (!isChecking && needsRegistration) {
      setShowRegistrationModal(true)
    }
  }, [needsRegistration, isChecking])

  // Load license file and registration data from localStorage
  useEffect(() => {
    const storedFile = localStorage.getItem('factoryLicenseFile')
    if (storedFile) {
      try {
        const fileData = JSON.parse(storedFile)
        setLicenseFileUrl(fileData.data)
      } catch (error) {
        console.error('Error loading license file:', error)
      }
    }

    // Load registration data from localStorage
    const storedRegistration = localStorage.getItem('factoryRegistrationData')
    if (storedRegistration) {
      try {
        const regData = JSON.parse(storedRegistration)
        setRegistrationData(regData)
      } catch (error) {
        console.error('Error loading registration data:', error)
      }
    }
  }, [])

  // --- Fetch data ONCE on page load ---
  useEffect(() => {
    // Only fetch if factories aren't already loaded
    if (Object.keys(factories).length === 0) {
      fetchAllDashboardData()
        .then((data) => {
          setFactories(data.factories) // Load all factories into the store
        })
        .catch((err) => {
          console.error(err)
          toast.error('Failed to load factory data from backend.')
        })
    }
  }, [factories, setFactories])

  // Poll forecast data every 10 seconds FOR THE ACTIVE FACTORY
  usePolling(
    async () => {
      if (activeFactoryId) { // Only poll if a factory is selected
        try {
          const data = await getForecast(activeFactoryId)
          setForecast(data)
        } catch (error) {
          console.error('Failed to fetch forecast:', error)
          setForecast(null) // Clear forecast on error
        }
      }
    },
    { interval: 10000, enabled: !!activeFactoryId } // Only enable polling if activeFactoryId is set
  )

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (!currentFactory) {
      toast.error('Please select a factory first')
      return
    }

    setIsStaking(true)
    try {
      const txHash = await stake(stakeAmount, currentFactory.id)
      toast.success(
        `Staked ${stakeAmount} ETH successfully! Transaction: ${txHash.slice(0, 10)}...`
      )
      
      // --- THIS IS THE FIX ---
      // Update the global store instead of local state
      const currentBalance = parseFloat(currentFactory.stakeBalance.toString())
      const newBalance = currentBalance + parseFloat(stakeAmount)
      updateFactory(currentFactory.id, { stakeBalance: newBalance.toString() })
      // --- END FIX ---

      setStakeAmount('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to stake')
    } finally {
      setIsStaking(false)
    }
  }

  const toggleRemediationStep = (id: string) => {
    setRemediationSteps((steps) =>
      steps.map((step) => (step.id === id ? { ...step, completed: !step.completed } : step))
    )
  }

  const forecastBreachAlert = forecast?.forecast_breach

  // Show a loading state if no factory is selected or data is loading
  if (!currentFactory) {
    return (
      <div className="min-h-screen bg-charcoal-50 p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-charcoal-900">Factory Dashboard</h1>
        <p className="mt-2 text-charcoal-600">Loading factory data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal-900">Factory Dashboard</h1>
          <p className="mt-2 text-charcoal-600">
            {currentFactory.name} (ID: {currentFactory.id})
          </p>
        </div>

        {/* Factory Registration Information */}
        {(registrationData || (currentFactory.ownerName && currentFactory.ownerName !== 'Not registered')) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Factory Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-charcoal-600">Factory Name</p>
                  <p className="mt-1 text-lg text-charcoal-900">{registrationData?.factoryName || (currentFactory.ownerName && currentFactory.ownerName !== 'Not registered' ? currentFactory.name : 'Not registered')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal-600">Owner Name</p>
                  <p className="mt-1 text-lg text-charcoal-900">{registrationData?.ownerName || currentFactory.ownerName || 'Not registered'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal-600">Location</p>
                  <p className="mt-1 text-lg text-charcoal-900">{registrationData?.location || currentFactory.location || 'Not registered'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-charcoal-600">Bond Size</p>
                  <p className="mt-1 text-lg text-charcoal-900">{registrationData?.bondSize || (currentFactory.bondSize && currentFactory.bondSize > 0 ? currentFactory.bondSize : 'Not registered')}</p>
                </div>
                {licenseFileUrl && (
                  <div>
                    <p className="text-sm font-medium text-charcoal-600">Factory License</p>
                    <a
                      href={licenseFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 underline"
                    >
                      <FileText className="h-4 w-4" />
                      View License
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alert Banner */}
        {forecastBreachAlert && (
         <div className="mb-6 flex items-start gap-3 rounded-xl border-2 border-red-500 bg-red-50 p-4 text-red-900">
            <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0" />
            <div>
              <p className="font-semibold">⚠️ Breach Predicted!</p>
              <p className="mt-1 text-sm">
                AI forecast indicates a potential AQI violation (Predicted: {forecast?.predicted_aqi}{' '}
                AQI, Confidence: {forecast && (forecast.confidence * 100).toFixed(0)}%). Please
                review remediation steps immediately.
              </p>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">Stake Balance</p>
                  <p className="mt-1 text-2xl font-bold text-charcoal-900">
                    {/* Read from global store */}
                    {formatEth(currentFactory.stakeBalance)} ETH 
                  </p>
                </div>
                <Coins className="h-10 w-10 text-primary-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">License NFT</p>
                  <p className="mt-1 text-2xl font-bold text-charcoal-900">
                    #{currentFactory.licenseNftId || 'N/A'}
                  </p>
                </div>
                <FileText className="h-10 w-10 text-teal-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">Current AQI</p>
                  <p className="mt-1 text-2xl font-bold text-charcoal-900">
                    {forecast?.predicted_aqi || '—'}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">Risk Level</p>
                  <Badge risk={forecastBreachAlert ? 'high' : 'low'} className="mt-1">
                    {forecastBreachAlert ? 'High' : 'Low'}
                  </Badge>
                </div>
                {forecastBreachAlert ? (
                  <AlertTriangle className="h-10 w-10 text-red-600" />
                ) : (
                  <CheckCircle2 className="h-10 w-10 text-primary-600" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <PollutionTrendChart 
            data={[
              { time: '00:00', pm2_5: 45, so2: 20, nox: 15 },
              { time: '04:00', pm2_5: 52, so2: 25, nox: 18 },
              { time: '08:00', pm2_5: 78, so2: 35, nox: 25 },
              { time: '12:00', pm2_5: 95, so2: 42, nox: 32 },
              { time: '16:00', pm2_5: 85, so2: 38, nox: 28 },
              { time: '20:00', pm2_5: 62, so2: 28, nox: 20 },
            ]}
          />
          <StakeHistoryChart 
            data={[
              { date: 'Day 1', balance: 100, slashed: 0 },
              { date: 'Day 2', balance: 100, slashed: 0 },
              { date: 'Day 3', balance: 95, slashed: 5 },
              { date: 'Day 4', balance: 95, slashed: 5 },
              { date: 'Day 5', balance: 90, slashed: 10 },
            ]}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Stake Deposit Card */}
          <Card>
            <CardHeader>
              <CardTitle>Stake ETH</CardTitle>
              <CardDescription>
                Increase your stake to maintain compliance and earn more rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="number"
                  label="Amount (ETH)"
                  placeholder="0.0"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  step="0.1"
                  min="0"
                />
                <Button onClick={handleStake} isLoading={isStaking} className="w-full">
                  Stake ETH
                </Button>
                <p className="text-xs text-charcoal-500">
                  * Mock transaction - no real ETH will be transferred
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Forecast Panel (rest of the page is the same) */}
          <Card>
            <CardHeader>
              <CardTitle>AI Forecast</CardTitle>
              <CardDescription>Real-time pollution predictions</CardDescription>
            </CardHeader>
            <CardContent>
              {forecast ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-charcoal-600">Predicted AQI</span>
                    <span className="text-2xl font-bold text-charcoal-900">
                      {forecast.predicted_aqi}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-charcoal-600">Confidence</span>
                    <span className="font-semibold text-charcoal-900">
                      {(forecast.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-charcoal-600">Breach Risk</span>
                    <Badge variant={forecast.forecast_breach ? 'danger' : 'success'}>
                      {forecast.forecast_breach ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="mt-4 rounded-lg bg-charcoal-50 p-3 text-xs text-charcoal-600">
                    <Clock className="mb-1 inline h-4 w-4" /> Next update in 10 seconds
                  </div>
                </div>
              ) : (
                <div className="text-center text-charcoal-500">Loading forecast...</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Remediation Guidance */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Remediation Steps</CardTitle>
            <CardDescription>
              Recommended actions to improve compliance and reduce risk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {remediationSteps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-start gap-3 rounded-lg border border-charcoal-200 p-3 transition-colors hover:bg-charcoal-50"
                >
                  <input
                    type="checkbox"
                    checked={step.completed}
                    onChange={() => toggleRemediationStep(step.id)}
                    className="mt-1 h-5 w-5 cursor-pointer rounded border-charcoal-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
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
                      <p className="mt-1 text-xs text-charcoal-500">
                        Due: {formatTimestamp(step.dueDate)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Slash History */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Slash History</CardTitle>
            <CardDescription>Record of compliance penalties</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Transaction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_SLASH_EVENTS.filter((e) => e.factoryId === currentFactory.id).map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{formatTimestamp(event.timestamp)}</TableCell>
                    <TableCell className="font-semibold text-red-600">
                      -{formatEth(event.amount)} ETH
                    </TableCell>
                    <TableCell>{event.reason}</TableCell>
                    <TableCell>
                      <a
                        href={`#tx-${event.txHash}`}
                        className="text-primary-600 hover:underline"
                      >
                        {event.txHash.slice(0, 10)}...
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Factory Registration Modal */}
      <FactoryRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
      />
    </div>
  )
}
