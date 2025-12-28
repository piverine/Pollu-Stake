import { NextRequest, NextResponse } from 'next/server'

// In-memory state for demo (toggling breach status)
const forecastState: Record<string, { breachEnabled: boolean; lastToggle: number }> = {}

/**
 * GET /api/forecast/[factoryId]
 * Returns AI forecast for a specific factory
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { factoryId: string } }
) {
  const { factoryId } = params

  // Helper to add random variance to base AQI
  const getRandomAQI = (base: number) => {
    const variance = Math.floor(Math.random() * 10) - 5 // +/- 5
    return Math.max(0, base + variance)
  }

  // Mock forecast data with dynamic updates
  const mockForecasts: Record<string, any> = {
    'Bhilai-001': {
      factory_id: 'Bhilai-001',
      forecast_breach: forecastState[factoryId]?.breachEnabled ?? true,
      confidence: 0.95,
      predicted_aqi: getRandomAQI(84),
      timestamp: new Date().toISOString(),
      next_check: new Date(Date.now() + 10000).toISOString(),
    },
    'Mumbai-002': {
      factory_id: 'Mumbai-002',
      forecast_breach: false,
      confidence: 0.88,
      predicted_aqi: getRandomAQI(112),
      timestamp: new Date().toISOString(),
      next_check: new Date(Date.now() + 10000).toISOString(),
    },
    'Delhi-003': {
      factory_id: 'Delhi-003',
      forecast_breach: false,
      confidence: 0.92,
      predicted_aqi: getRandomAQI(155),
      timestamp: new Date().toISOString(),
      next_check: new Date(Date.now() + 10000).toISOString(),
    },
    'Chennai-004': {
      factory_id: 'Chennai-004',
      forecast_breach: false,
      confidence: 0.91,
      predicted_aqi: getRandomAQI(42),
      timestamp: new Date().toISOString(),
      next_check: new Date(Date.now() + 10000).toISOString(),
    },
    'Kolkata-005': {
      factory_id: 'Kolkata-005',
      forecast_breach: forecastState[factoryId]?.breachEnabled ?? true,
      confidence: 0.89,
      predicted_aqi: getRandomAQI(178),
      timestamp: new Date().toISOString(),
      next_check: new Date(Date.now() + 10000).toISOString(),
    },
  }

  const forecast = mockForecasts[factoryId]

  if (!forecast) {
    return NextResponse.json(
      { error: 'Factory not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(forecast)
}
