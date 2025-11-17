import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

/**
 * Hook to check if a factory user needs to complete their registration
 * Returns true if user has factory role but hasn't completed registration yet
 */
export function useFactoryRegistration() {
  const { user, isLoaded } = useUser()
  const [needsRegistration, setNeedsRegistration] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isLoaded || !user) {
      setIsChecking(false)
      return
    }

    // Check if user has factory role
    const userRole = user.publicMetadata?.role
    const hasFactoryRole = userRole === 'factory'

    // Check if user has completed factory registration
    // We check unsafeMetadata for the factoryRegistered flag
    const hasFactoryInfo = user.unsafeMetadata?.factoryRegistered === true

    // User needs registration if they have factory role but haven't registered
    setNeedsRegistration(hasFactoryRole && !hasFactoryInfo)
    setIsChecking(false)
  }, [user, isLoaded])

  return { needsRegistration, isChecking }
}
