'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { mintGreenCredits } from '@/services/contractStubs'
import { formatEth, formatAddress } from '@/lib/utils'
import { MOCK_GREEN_CREDIT_DISTRIBUTIONS } from '@/services/mockData'
import { Coins, TrendingUp, Users } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TreasuryPage() {
  const [treasuryBalance, setTreasuryBalance] = useState('42.5')
  const [distributions, setDistributions] = useState(MOCK_GREEN_CREDIT_DISTRIBUTIONS)
  
  const [showMintModal, setShowMintModal] = useState(false)
  const [mintAddress, setMintAddress] = useState('')
  const [mintAmount, setMintAmount] = useState('')
  const [isMinting, setIsMinting] = useState(false)

  const handleMintCredits = async () => {
    if (!mintAddress || !mintAmount) {
      toast.error('Please fill all fields')
      return
    }

    setIsMinting(true)
    try {
      const txHash = await mintGreenCredits(mintAddress, parseInt(mintAmount))
      
      toast.success(`Minted ${mintAmount} GreenCredits! Tx: ${txHash.slice(0, 10)}...`)
      
      // Add distribution record
      const newDist = {
        id: `gc-${Date.now()}`,
        recipient: mintAddress,
        amount: parseInt(mintAmount),
        txHash,
        timestamp: new Date().toISOString(),
        reason: 'Manual admin mint',
      }
      setDistributions([newDist, ...distributions])
      
      // Reset
      setShowMintModal(false)
      setMintAddress('')
      setMintAmount('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to mint GreenCredits')
    } finally {
      setIsMinting(false)
    }
  }

  const totalDistributed = distributions.reduce((acc, dist) => acc + dist.amount, 0)

  return (
    <div className="min-h-screen bg-charcoal-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal-900">Treasury & GreenCredits</h1>
          <p className="mt-2 text-charcoal-600">Manage DAO funds and token distribution</p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">Treasury Balance</p>
                  <p className="mt-1 text-2xl font-bold text-primary-900">
                    {formatEth(treasuryBalance)} ETH
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
                  <p className="text-sm text-charcoal-600">Total Distributed</p>
                  <p className="mt-1 text-2xl font-bold text-teal-900">
                    {totalDistributed.toLocaleString()} GC
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-teal-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">Recipients</p>
                  <p className="mt-1 text-2xl font-bold text-charcoal-900">
                    {new Set(distributions.map((d) => d.recipient)).size}
                  </p>
                </div>
                <Users className="h-10 w-10 text-charcoal-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Treasury Management */}
          <Card>
            <CardHeader>
              <CardTitle>Treasury Management</CardTitle>
              <CardDescription>DAO funds from slashed stakes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-primary-50 p-6">
                  <p className="text-sm text-primary-700">Available Balance</p>
                  <p className="mt-2 text-4xl font-bold text-primary-900">
                    {formatEth(treasuryBalance)} ETH
                  </p>
                </div>
                <Button onClick={() => setShowMintModal(true)} className="w-full gap-2">
                  <Coins className="h-5 w-5" />
                  Mint GreenCredits
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Distributions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Distributions</CardTitle>
              <CardDescription>GreenCredit minting history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {distributions.map((dist) => (
                  <div
                    key={dist.id}
                    className="flex items-center justify-between rounded-lg border border-charcoal-200 p-3 hover:bg-charcoal-50"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-charcoal-900">
                        {formatAddress(dist.recipient)}
                      </p>
                      <p className="text-xs text-charcoal-500">{dist.reason}</p>
                    </div>
                    <p className="ml-3 font-semibold text-primary-600">{dist.amount} GC</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mint Modal */}
      <Modal
        isOpen={showMintModal}
        onClose={() => setShowMintModal(false)}
        title="Mint GreenCredits"
        size="md"
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-teal-50 p-3 text-sm text-teal-900">
            <p>GreenCredits reward factories for environmental compliance and performance.</p>
          </div>
          <Input
            label="Recipient Address"
            placeholder="0x..."
            value={mintAddress}
            onChange={(e) => setMintAddress(e.target.value)}
          />
          <Input
            label="Amount (GreenCredits)"
            type="number"
            placeholder="1000"
            value={mintAmount}
            onChange={(e) => setMintAmount(e.target.value)}
            min="1"
          />
          <div className="flex gap-2">
            <Button onClick={handleMintCredits} isLoading={isMinting} className="flex-1">
              Mint Tokens
            </Button>
            <Button
              onClick={() => setShowMintModal(false)}
              variant="outline"
              disabled={isMinting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
