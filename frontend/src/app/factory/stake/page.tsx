'use client'

import { useState } from 'react'
import { stake, unstake } from '@/services/contractStubs'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Coins, TrendingUp, TrendingDown, FileText, AlertCircle } from 'lucide-react'
import { formatEth } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useStore } from '@/store/useStore' // <-- Import the store

export default function StakeManagementPage() {
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [isStaking, setIsStaking] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)

  // --- Get state from the global store ---
  const { factories, updateFactory, activeFactoryId } = useStore()
  
  // Get the currently selected factory object
  const currentFactory = activeFactoryId ? factories[activeFactoryId] : null
  const stakeBalance = currentFactory?.stakeBalance || '0'
  const nftId = currentFactory?.licenseNftId || null
  // --- End global state ---
  
  const minStakeRequired = '5.0'

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (!currentFactory) {
      toast.error('Factory not loaded')
      return
    }

    setIsStaking(true)
    try {
      const txHash = await stake(stakeAmount, currentFactory.id)
      toast.success(
        `Staked ${stakeAmount} ETH successfully! Transaction: ${txHash.slice(0, 10)}...`
      )
      
      // --- THIS IS THE FIX ---
      const newBalance = parseFloat(stakeBalance) + parseFloat(stakeAmount)
      updateFactory(currentFactory.id, { stakeBalance: newBalance.toString() })
      // --- END FIX ---
      
      setStakeAmount('')
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
    if (!currentFactory) {
      toast.error('Factory not loaded')
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
      const txHash = await unstake(unstakeAmount, currentFactory.id)
      toast.success(
        `Unstaked ${unstakeAmount} ETH successfully! Transaction: ${txHash.slice(0, 10)}...`
      )
      
      // --- THIS IS THE FIX ---
      updateFactory(currentFactory.id, { stakeBalance: remainingBalance.toString() })
      // --- END FIX ---
      
      setUnstakeAmount('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to unstake')
    } finally {
      setIsUnstaking(false)
    }
  }

  if (!currentFactory) {
    return (
      <div className="min-h-screen bg-charcoal-50 p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-charcoal-900">Stake Management</h1>
        <p className="mt-2 text-charcoal-600">
          Loading factory data... Please visit the main dashboard first.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal-900">Stake Management</h1>
          <p className="mt-2 text-charcoal-600">
            Manage {currentFactory.name}'s ETH stake and compliance bond
          </p>
        </div>

        {/* Current Stake Overview */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">Current Stake</p>
                  <p className="mt-1 text-3xl font-bold text-primary-900">
                    {/* Read from global store */}
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
                  <p className="mt-1 text-2xl font-bold text-teal-900">
                    {/* Read from global store */}
                    #{nftId || 'N/A'}
                  </p>
                </div>
                <FileText className="h-10 w-10 text-teal-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ... (rest of the page is the same, just make sure to use `handleStake` and `handleUnstake`) ... */}
        
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
        
      </div>
    </div>
  )
}