'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { FactoryRegistration } from './FactoryRegistration'
import toast from 'react-hot-toast'

interface FactoryRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FactoryRegistrationModal({ isOpen, onClose }: FactoryRegistrationModalProps) {
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRegistrationSuccess = async () => {
    setIsSubmitting(true)
    try {
      // Update user metadata to mark factory registration as complete
      if (user) {
        // Update unsafeMetadata to mark registration as complete
        await user.update({
          unsafeMetadata: {
            factoryRegistered: true,
          },
        })
        
        // Reload user to get updated metadata
        await user.reload()
      }

      toast.success('Factory registration completed!')
      setTimeout(() => {
        onClose()
        // Refresh the page to load the updated data
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error('Error updating user metadata:', error)
      toast.error('Failed to complete registration')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 py-4">
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <FactoryRegistration
          onSuccess={handleRegistrationSuccess}
          onCancel={onClose}
        />
      </div>
    </div>
  )
}
