/**
 * Wallet connection hook using ethers.js
 * 
 * Handles MetaMask detection, connection, and account management
 */

import { useState, useEffect, useCallback } from 'react'
import { BrowserProvider } from 'ethers'
import { useStore } from '@/store/useStore'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    ethereum?: any
  }
}

export function useWallet() {
  const { wallet, setWallet, disconnectWallet } = useStore()
  const [isConnecting, setIsConnecting] = useState(false)

  // Check if MetaMask is installed and available
  const [hasMetaMask, setHasMetaMask] = useState(false)

  // Connect wallet
  const connect = useCallback(async () => {
    // Re-check MetaMask installation in case the hook hasn't updated yet
    const isMetaMaskAvailable = 
      typeof window !== 'undefined' && 
      typeof window.ethereum !== 'undefined' &&
      (window.ethereum.isMetaMask || window.ethereum.providers?.some((p: any) => p.isMetaMask))

    if (!isMetaMaskAvailable) {
      toast.error('MetaMask is not installed or not detected')
      setHasMetaMask(false)
      return
    }

    // If we thought MetaMask wasn't available but it is, update the state
    if (!hasMetaMask) {
      setHasMetaMask(true)
    }

    setIsConnecting(true)

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()
      const balance = await provider.getBalance(address)

      setWallet({
        address,
        chainId: Number(network.chainId),
        isConnected: true,
        balance: balance.toString(),
      })

      toast.success('Wallet connected successfully')
    } catch (error: any) {
      console.error('Error connecting wallet:', error)
      toast.error(error.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }, [hasMetaMask, setWallet])

  // Check for MetaMask on component mount and on window.ethereum changes
  useEffect(() => {
    const checkMetaMask = () => {
      const isMetaMaskInstalled = 
        typeof window !== 'undefined' && 
        typeof window.ethereum !== 'undefined' &&
        (window.ethereum.isMetaMask || window.ethereum.providers?.some((p: any) => p.isMetaMask))
      
      setHasMetaMask(!!isMetaMaskInstalled)
      
      // If MetaMask is installed but not connected, try to connect automatically
      if (isMetaMaskInstalled && !wallet.isConnected) {
        // Small delay to ensure the provider is fully initialized
        const timer = setTimeout(() => {
          connect()
        }, 500)
        return () => clearTimeout(timer)
      }
    }

    // Initial check
    checkMetaMask()

    // Listen for MetaMask injection
    if (typeof window !== 'undefined') {
      window.addEventListener('ethereum#initialized', checkMetaMask, {
        once: true,
      })

      // Cleanup
      return () => {
        window.removeEventListener('ethereum#initialized', checkMetaMask)
      }
    }
  }, [wallet.isConnected, connect])

  // Disconnect wallet
  const disconnect = useCallback(() => {
    disconnectWallet()
    toast.success('Wallet disconnected')
  }, [disconnectWallet])

  // Listen for account changes
  useEffect(() => {
    if (!hasMetaMask) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else {
        // Re-connect with new account
        connect()
      }
    }

    const handleChainChanged = () => {
      // Reload page on chain change (recommended by MetaMask)
      window.location.reload()
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [hasMetaMask, connect, disconnectWallet])

  // Check if already connected on mount
  useEffect(() => {
    if (!hasMetaMask) return

    const checkConnection = async () => {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        })

        if (accounts.length > 0) {
          await connect()
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }

    checkConnection()
  }, [hasMetaMask, connect])

  return {
    wallet,
    isConnecting,
    hasMetaMask,
    connect,
    disconnect,
  }
}
