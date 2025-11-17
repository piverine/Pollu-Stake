'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { slash } from '@/services/contractStubs'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table'
import { formatEth } from '@/lib/utils'
import { MOCK_FACTORIES, MOCK_SLASH_EVENTS } from '@/services/mockData'
import { Factory } from '@/types'
import toast from 'react-hot-toast'

export default function FactoriesPage() {
  const { factories, setFactories } = useStore()
  const [slashEvents, setSlashEvents] = useState(MOCK_SLASH_EVENTS)
  const [treasuryBalance, setTreasuryBalance] = useState('42.5')
  
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null)
  const [slashAmount, setSlashAmount] = useState('')
  const [slashReason, setSlashReason] = useState('')
  const [isSlashing, setIsSlashing] = useState(false)

  useEffect(() => {
    if (factories.length === 0) {
      setFactories(MOCK_FACTORIES)
    }
  }, [factories, setFactories])

  const handleTriggerSlash = async (factory: Factory) => {
    setSelectedFactory(factory)
  }

  const executeSlash = async () => {
    if (!selectedFactory || !slashAmount || !slashReason) {
      toast.error('Please fill all fields')
      return
    }

    setIsSlashing(true)
    try {
      const txHash = await slash(selectedFactory.id, slashAmount, slashReason)
      
      toast.success(`Slash executed successfully! Tx: ${txHash.slice(0, 10)}...`)
      
      // Update treasury
      const newBalance = parseFloat(treasuryBalance) + parseFloat(slashAmount)
      setTreasuryBalance(newBalance.toString())
      
      // Add slash event
      const newEvent = {
        id: `slash-${Date.now()}`,
        factoryId: selectedFactory.id,
        factoryName: selectedFactory.name,
        amount: slashAmount,
        reason: slashReason,
        txHash,
        timestamp: new Date().toISOString(),
        triggered_by: 'manual' as const,
      }
      setSlashEvents([newEvent, ...slashEvents])
      
      // Reset
      setSelectedFactory(null)
      setSlashAmount('')
      setSlashReason('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to execute slash')
    } finally {
      setIsSlashing(false)
    }
  }

  return (
    <div className="min-h-screen bg-charcoal-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal-900">Registered Factories</h1>
          <p className="mt-2 text-charcoal-600">Monitor compliance and risk across all factories</p>
        </div>

        {/* Factory List */}
        <Card>
          <CardHeader>
            <CardTitle>All Factories ({factories.length})</CardTitle>
            <CardDescription>Complete list of registered factories with compliance status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Factory</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Stake</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {factories.map((factory) => (
                  <TableRow key={factory.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-charcoal-900">{factory.name}</p>
                        <p className="text-xs text-charcoal-500">{factory.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>{factory.location.city}</TableCell>
                    <TableCell className="font-semibold">
                      {formatEth(factory.stakeBalance)} ETH
                    </TableCell>
                    <TableCell>
                      <Badge risk={factory.riskLevel}>{factory.riskLevel.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-semibold ${
                          factory.complianceScore >= 80
                            ? 'text-primary-600'
                            : factory.complianceScore >= 60
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {factory.complianceScore}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTriggerSlash(factory)}
                      >
                        Trigger Slash
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Slash Modal */}
      {selectedFactory && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedFactory(null)}
          title={`Slash Factory: ${selectedFactory.name}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-900">
              <p className="font-semibold">⚠️ Warning</p>
              <p className="mt-1">
                This will slash stake from {selectedFactory.name} and transfer it to the DAO
                treasury.
              </p>
            </div>
            <Input
              label="Slash Amount (ETH)"
              type="number"
              placeholder="0.0"
              value={slashAmount}
              onChange={(e) => setSlashAmount(e.target.value)}
              step="0.1"
              min="0"
            />
            <Input
              label="Reason"
              placeholder="e.g., AQI breach predicted at 165 AQI"
              value={slashReason}
              onChange={(e) => setSlashReason(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={executeSlash} isLoading={isSlashing} variant="danger" className="flex-1">
                Execute Slash
              </Button>
              <Button
                onClick={() => setSelectedFactory(null)}
                variant="outline"
                disabled={isSlashing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
