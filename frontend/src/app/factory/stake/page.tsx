'use client'

import { useState } from 'react'
import { stake, unstake, getStakeBalance } from '@/services/contractStubs'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Coins, TrendingUp, TrendingDown, FileText, AlertCircle } from 'lucide-react'
import { formatEth } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function StakeManagementPage() {
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [stakeBalance, setStakeBalance] = useState('10.5')
  const [nftId, setNftId] = useState('42')
  const [isStaking, setIsStaking] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)

  const factoryId = 'Bhilai-001'
  const minStakeRequired = '5.0'

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setIsStaking(true)
    try {
      const txHash = await stake(stakeAmount, factoryId)
      toast.success(
        `Staked ${stakeAmount} ETH successfully! Transaction: ${txHash.slice(0, 10)}...`
      )
      
      // Update local state
      const newBalance = parseFloat(stakeBalance) + parseFloat(stakeAmount)
      setStakeBalance(newBalance.toString())
      setStakeAmount('')
      
      // Simulate NFT minting if first stake
      if (!nftId) {
        setNftId('42')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to stake')
    } finally {
      setIsStaking(false)
    }
  }

  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    const currentBalance = parseFloat(stakeBalance)
    const amountToUnstake = parseFloat(unstakeAmount)

    if (amountToUnstake > currentBalance) {
      toast.error('Insufficient stake balance')
      return
    }

    const remainingBalance = currentBalance - amountToUnstake
    if (remainingBalance < parseFloat(minStakeRequired)) {
      toast.error(`Cannot unstake: Must maintain minimum stake of ${minStakeRequired} ETH`)
      return
    }

    setIsUnstaking(true)
    try {
      const txHash = await unstake(unstakeAmount, factoryId)
      toast.success(
        `Unstaked ${unstakeAmount} ETH successfully! Transaction: ${txHash.slice(0, 10)}...`
      )
      
      // Update local state
      setStakeBalance(remainingBalance.toString())
      setUnstakeAmount('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to unstake')
    } finally {
      setIsUnstaking(false)
    }
  }

  return (
    <div className="min-h-screen bg-charcoal-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal-900">Stake Management</h1>
          <p className="mt-2 text-charcoal-600">Manage your factory's ETH stake and compliance bond</p>
        </div>

        {/* Current Stake Overview */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">Current Stake</p>
                  <p className="mt-1 text-3xl font-bold text-primary-900">
                    {formatEth(stakeBalance)} ETH
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
                  <p className="text-sm text-charcoal-600">Minimum Required</p>
                  <p className="mt-1 text-2xl font-bold text-charcoal-900">
                    {formatEth(minStakeRequired)} ETH
                  </p>
                </div>
                <TrendingDown className="h-10 w-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">License NFT</p>
                  <p className="mt-1 text-2xl font-bold text-teal-900">#{nftId || 'N/A'}</p>
                </div>
                <FileText className="h-10 w-10 text-teal-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Alert */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Stake Requirements</p>
            <p className="mt-1">
              Factories must maintain a minimum stake of {minStakeRequired} ETH to remain compliant. 
              Higher stakes demonstrate commitment to environmental standards and can reduce slashing penalties.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Stake Deposit Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary-600" />
                <CardTitle>Stake ETH</CardTitle>
              </div>
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
                  helperText="Enter the amount of ETH you want to stake"
                />
                <Button onClick={handleStake} isLoading={isStaking} className="w-full gap-2">
                  <Coins className="h-5 w-5" />
                  Stake ETH
                </Button>
                <p className="text-xs text-charcoal-500">
                  * Mock transaction - no real ETH will be transferred
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Unstake Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-orange-600" />
                <CardTitle>Unstake ETH</CardTitle>
              </div>
              <CardDescription>
                Withdraw stake (must maintain minimum balance)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="number"
                  label="Amount (ETH)"
                  placeholder="0.0"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  step="0.1"
                  min="0"
                  max={parseFloat(stakeBalance) - parseFloat(minStakeRequired)}
                  helperText={`Max unstake: ${formatEth(
                    Math.max(0, parseFloat(stakeBalance) - parseFloat(minStakeRequired))
                  )} ETH`}
                />
                <Button 
                  onClick={handleUnstake} 
                  isLoading={isUnstaking} 
                  variant="outline" 
                  className="w-full gap-2"
                >
                  <TrendingDown className="h-5 w-5" />
                  Unstake ETH
                </Button>
                <p className="text-xs text-charcoal-500">
                  * Must maintain minimum stake of {minStakeRequired} ETH
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stake Benefits */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Stake Benefits</CardTitle>
            <CardDescription>Why maintain a higher stake?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-charcoal-200 p-4">
                <h4 className="font-semibold text-charcoal-900">🛡️ Reduced Penalties</h4>
                <p className="mt-2 text-sm text-charcoal-600">
                  Higher stakes can reduce the severity of slashing penalties for minor violations
                </p>
              </div>
              <div className="rounded-lg border border-charcoal-200 p-4">
                <h4 className="font-semibold text-charcoal-900">💰 GreenCredit Rewards</h4>
                <p className="mt-2 text-sm text-charcoal-600">
                  Earn more GreenCredits for maintaining compliance with higher stakes
                </p>
              </div>
              <div className="rounded-lg border border-charcoal-200 p-4">
                <h4 className="font-semibold text-charcoal-900">🎯 Priority Support</h4>
                <p className="mt-2 text-sm text-charcoal-600">
                  Higher-staked factories receive priority in dispute resolution
                </p>
              </div>
              <div className="rounded-lg border border-charcoal-200 p-4">
                <h4 className="font-semibold text-charcoal-900">📊 DAO Voting Power</h4>
                <p className="mt-2 text-sm text-charcoal-600">
                  Stake amount contributes to voting power in governance proposals
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
