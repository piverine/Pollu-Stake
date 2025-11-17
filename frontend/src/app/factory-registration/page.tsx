'use client'

import { useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { FactoryRegistration } from '@/components/FactoryRegistration'
import toast from 'react-hot-toast'

export default function FactoryRegistrationPage() {
  const { isLoaded, user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  // Redirect to home if user is not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/')
    }
  }, [isLoaded, user, router])

  const handleRegistrationSuccess = async () => {
    toast.success('Welcome to Pollu-Stake!')
    // Reload user data to get the updated role
    if (user) {
      await user.reload()
    }
    // Redirect to factory dashboard after successful registration
    setTimeout(() => {
      router.push('/factory')
    }, 1500)
  }

  const handleCancel = async () => {
    await signOut()
    router.push('/')
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-charcoal-50 to-teal-50">
        <div className="space-y-4 text-center">
          <div className="text-lg font-semibold text-charcoal-700">Loading...</div>
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-teal-500" />
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-charcoal-50 to-teal-50 px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-teal-600">
              <span className="text-3xl font-bold text-white">PS</span>
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-charcoal-900">Welcome to Pollu-Stake</h1>
          <p className="text-charcoal-600">
            Complete your factory registration to get started with on-chain environmental compliance
          </p>
        </div>

        {/* Registration Form */}
        <FactoryRegistration
          onSuccess={handleRegistrationSuccess}
          onCancel={handleCancel}
        />

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-charcoal-600">
          <p>
            By registering, you agree to our{' '}
            <a href="#" className="font-medium text-primary-600 hover:text-primary-700">
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="#" className="font-medium text-primary-600 hover:text-primary-700">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
