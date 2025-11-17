'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

interface StakeDataPoint {
  date: string
  balance: number
  slashed: number
}

interface StakeHistoryChartProps {
  data: StakeDataPoint[]
  title?: string
  height?: number
}

export function StakeHistoryChart({ data, title = 'Stake Balance History', height = 300 }: StakeHistoryChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSlashed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Area 
              type="natural" 
              dataKey="balance" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={0.6} 
              fill="url(#colorBalance)" 
              name="Balance (ETH)"
              isAnimationActive={true}
            />
            <Area 
              type="natural" 
              dataKey="slashed" 
              stroke="#ef4444" 
              strokeWidth={3}
              fillOpacity={0.6} 
              fill="url(#colorSlashed)" 
              name="Slashed (ETH)"
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
