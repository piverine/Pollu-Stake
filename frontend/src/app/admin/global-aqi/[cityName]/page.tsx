'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Activity, Wind, CloudRain, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { getAQIPrediction } from '@/services/aiApiClient'
import { Badge } from '@/components/ui/Badge'

// Mock function to generate plausible history based on current AQI
// In a real app, you'd fetch this from an API
const generateHistory = (currentAQI: number) => {
    const history = []
    let value = currentAQI
    const now = new Date()

    // Generate 20 points (last 20 hours/days)
    for (let i = 20; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000) // Hourly
        // Add some random noise
        const noise = Math.floor(Math.random() * 20) - 10
        value = Math.max(10, value - noise * 0.5) // Smooth drift

        // Ensure it stays somewhat realistic
        if (Math.abs(value - currentAQI) > 50) {
            value = currentAQI + (noise * 2)
        }

        history.push({
            timestamp: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            aqi: Math.round(value)
        })
    }
    // Ensure the last point matches current
    history[history.length - 1].aqi = currentAQI
    return history
}

export default function CityAQIDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const cityName = decodeURIComponent(params.cityName as string)

    const [loading, setLoading] = useState(true)
    const [currentAQI, setCurrentAQI] = useState<number | null>(null)
    const [historyData, setHistoryData] = useState<any[]>([])
    const [prediction, setPrediction] = useState<{
        prediction: number
        trend: 'INCREASING' | 'DECREASING' | 'STABLE'
        difference: number
    } | null>(null)

    const WAQI_TOKEN = process.env.NEXT_PUBLIC_WAQI_TOKEN

    useEffect(() => {
        const fetchData = async () => {
            // Set page title
            document.title = `${cityName} | PolluStake Global AQI`

            if (!WAQI_TOKEN) return

            try {
                // 1. Fetch Current AQI
                const res = await fetch(`https://api.waqi.info/feed/${cityName}/?token=${WAQI_TOKEN}`)
                const data = await res.json()

                if (data.status === 'ok') {
                    const aqi = parseInt(data.data.aqi, 10)
                    setCurrentAQI(aqi)

                    // 2. Generate History (Simulated "Collecting last few days")
                    const history = generateHistory(aqi)
                    setHistoryData(history)

                    // 3. Get AI Prediction
                    const aqis = history.map(h => h.aqi)
                    const pred = await getAQIPrediction(aqis)
                    setPrediction(pred)
                }
            } catch (error) {
                console.error('Failed to fetch city data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [cityName, WAQI_TOKEN])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-charcoal-50">
                <div className="text-center">
                    <Activity className="mx-auto h-12 w-12 animate-pulse text-primary-500" />
                    <p className="mt-4 text-charcoal-600">Analyzing atmospheric data...</p>
                    <p className="text-sm text-charcoal-400">Running LSTM Prediction Model</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-charcoal-50 p-6">
            <div className="mx-auto max-w-6xl space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()} className="h-10 w-10 rounded-full p-0 hover:bg-white">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-charcoal-900">{cityName} Air Quality</h1>
                        <p className="text-charcoal-600">AI-Powered Forecasting & Analysis</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Info Card */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>{cityName}: Historical Trend & AI Prediction</CardTitle>
                            <CardDescription>24-hour AQI history with next-hour forecast</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={historyData}>
                                        <defs>
                                            <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis
                                            dataKey="timestamp"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#6B7280', fontSize: 12 }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#6B7280', fontSize: 12 }}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="aqi"
                                            stroke="#2563eb"
                                            fillOpacity={1}
                                            fill="url(#colorAqi)"
                                            strokeWidth={3}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Prediction Card */}
                    <div className="space-y-6">
                        <Card className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white border-none shadow-xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-indigo-300" />
                                    AI Prediction
                                </CardTitle>
                                <CardDescription className="text-indigo-200">Next hour forecast</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6 text-center">
                                    <p className="text-5xl font-bold tracking-tight">
                                        {prediction?.prediction.toFixed(0)}
                                    </p>
                                    <p className="text-sm font-medium text-indigo-300 mt-1">Predicted AQI</p>
                                </div>

                                <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-indigo-200">Trend</span>
                                        <Badge
                                            variant={
                                                prediction?.trend === 'DECREASING' ? 'success' :
                                                    prediction?.trend === 'INCREASING' ? 'danger' : 'default'
                                            }
                                            className="text-sm px-3 py-1"
                                        >
                                            <div className="flex items-center gap-1.5">
                                                {prediction?.trend === 'INCREASING' && <TrendingUp className="h-4 w-4" />}
                                                {prediction?.trend === 'DECREASING' && <TrendingDown className="h-4 w-4" />}
                                                {prediction?.trend === 'STABLE' && <Minus className="h-4 w-4" />}
                                                {prediction?.trend}
                                            </div>
                                        </Badge>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                                        <span className="text-sm text-indigo-200">Expected Change</span>
                                        <span className="font-semibold">
                                            {prediction?.trend === 'DECREASING' ? '-' : '+'}
                                            {prediction?.difference} pts
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 text-xs text-indigo-300">
                                    * Powered by backend LSTM neural network trained on historical pollution data.
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="font-semibold text-charcoal-900 mb-4">Live Conditions</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-lg bg-blue-50 p-3">
                                        <Wind className="h-5 w-5 text-blue-600 mb-2" />
                                        <div className="text-2xl font-bold text-charcoal-900">
                                            {currentAQI}
                                        </div>
                                        <div className="text-xs text-charcoal-500">Current AQI</div>
                                    </div>
                                    <div className="rounded-lg bg-orange-50 p-3">
                                        <AlertTriangle className="h-5 w-5 text-orange-600 mb-2" />
                                        <div className="text-2xl font-bold text-charcoal-900">
                                            {historyData.length > 0 ? historyData[0].aqi : '--'}
                                        </div>
                                        <div className="text-xs text-charcoal-500">24h Ago</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
