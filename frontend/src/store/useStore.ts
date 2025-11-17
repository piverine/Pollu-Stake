import { create } from 'zustand'
import { WalletState, Factory } from '@/types'

// Define the Factory type in the store if it's not imported
// (Assuming 'Factory' is imported from '@/types')

interface AppState {
  // Wallet state
  wallet: WalletState
  setWallet: (wallet: Partial<WalletState>) => void
  disconnectWallet: () => void

  // --- NEW FACTORY STATE ---
  // We use an object (Record) for easier lookup
  factories: Record<string, Factory>
  activeFactoryId: string | null
  setFactories: (factories: Factory[]) => void
  updateFactory: (factoryId: string, updates: Partial<Factory>) => void
  setActiveFactoryId: (factoryId: string | null) => void
  // --- END NEW FACTORY STATE ---

  // UI state
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

export const useStore = create<AppState>((set) => ({
  // Wallet
  wallet: {
    address: null,
    chainId: null,
    isConnected: false,
    balance: '0',
  },
  setWallet: (wallet) =>
    set((state) => ({
      wallet: { ...state.wallet, ...wallet },
    })),
  disconnectWallet: () =>
    set({
      wallet: {
        address: null,
        chainId: null,
        isConnected: false,
        balance: '0',
      },
    }),

  // --- UPDATED FACTORY STATE ---
  factories: {},
  activeFactoryId: null, // No factory selected by default
  
  setFactories: (factories) =>
    set(() => {
      // Convert the array of factories into an object for easy lookup
      const factoriesAsRecord = factories.reduce((acc, factory) => {
        acc[factory.id] = factory
        return acc
      }, {} as Record<string, Factory>)
      
      // Automatically select the first factory
      const firstFactoryId = factories.length > 0 ? factories[0].id : null
      
      return { factories: factoriesAsRecord, activeFactoryId: firstFactoryId }
    }),
  
  updateFactory: (factoryId, updates) =>
    set((state) => ({
      factories: {
        ...state.factories,
        [factoryId]: {
          ...state.factories[factoryId],
          ...updates,
        },
      },
    })),
    
  setActiveFactoryId: (factoryId) => set({ activeFactoryId: factoryId }),
  // --- END UPDATED FACTORY STATE ---
  
  // UI
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}))