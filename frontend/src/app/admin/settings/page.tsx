'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Settings, Save, Bell, Shield, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [slashThreshold, setSlashThreshold] = useState('150')
  const [minStake, setMinStake] = useState('5.0')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [autoSlashEnabled, setAutoSlashEnabled] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-charcoal-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal-900">Admin Settings</h1>
          <p className="mt-2 text-charcoal-600">Configure system parameters and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Compliance Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary-600" />
                <CardTitle>Compliance Parameters</CardTitle>
              </div>
              <CardDescription>Set thresholds for automated compliance enforcement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="AQI Slash Threshold"
                  type="number"
                  value={slashThreshold}
                  onChange={(e) => setSlashThreshold(e.target.value)}
                  helperText="Factories exceeding this AQI will be automatically slashed"
                  min="100"
                  max="300"
                />
                <Input
                  label="Minimum Stake Required (ETH)"
                  type="number"
                  value={minStake}
                  onChange={(e) => setMinStake(e.target.value)}
                  helperText="Minimum stake required for factory registration"
                  step="0.1"
                  min="1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Automation Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <CardTitle>Automation</CardTitle>
              </div>
              <CardDescription>Configure automated actions and triggers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label className="flex items-center justify-between rounded-lg border border-charcoal-200 p-4 cursor-pointer hover:bg-charcoal-50">
                  <div>
                    <p className="font-medium text-charcoal-900">Auto-Slash on Forecast</p>
                    <p className="text-sm text-charcoal-600">
                      Automatically slash stakes when AI predicts AQI breach
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoSlashEnabled}
                    onChange={(e) => setAutoSlashEnabled(e.target.checked)}
                    className="h-5 w-5 text-primary-600 rounded"
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>Manage alert and notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label className="flex items-center justify-between rounded-lg border border-charcoal-200 p-4 cursor-pointer hover:bg-charcoal-50">
                  <div>
                    <p className="font-medium text-charcoal-900">Email Notifications</p>
                    <p className="text-sm text-charcoal-600">
                      Receive email alerts for critical events
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="h-5 w-5 text-primary-600 rounded"
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveSettings}
              isLoading={isSaving}
              className="gap-2"
              size="lg"
            >
              <Save className="h-5 w-5" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
