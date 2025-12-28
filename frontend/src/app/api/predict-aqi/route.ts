import { NextRequest, NextResponse } from 'next/server'

const PYTHON_BACKEND_URL = 'http://127.0.0.1:8000'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { history } = body

        if (!history || !Array.isArray(history) || history.length === 0) {
            return NextResponse.json(
                { error: 'Invalid history data provided' },
                { status: 400 }
            )
        }

        // Forward to Python backend
        try {
            const response = await fetch(`${PYTHON_BACKEND_URL}/api/predict-aqi`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data_history: history }),
            })

            if (!response.ok) {
                throw new Error(`Backend responded with ${response.status}`)
            }

            const data = await response.json()
            return NextResponse.json(data)
        } catch (backendError) {
            console.error('Python backend connection failed:', backendError)

            // Fallback Mock Prediction if backend is offline
            // This ensures the UI still works for the demo even if python server isn't running
            const lastValue = history[history.length - 1]
            const trend = Math.random() > 0.5 ? 1 : -1
            const change = Math.floor(Math.random() * 10) + 1
            const predicted = Math.max(0, lastValue + (trend * change))

            return NextResponse.json({
                success: true,
                current_aqi: lastValue,
                predicted_aqi: predicted,
                trend: trend > 0 ? 'INCREASING' : 'DECREASING',
                difference: parseFloat((predicted - lastValue).toFixed(2)),
                is_mock: true
            })
        }

    } catch (error) {
        console.error('Prediction API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
