'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from '@clerk/nextjs'
import { WalletConnect } from '@/components/WalletConnect'
import { Button } from '@/components/ui/Button'
import { getPortalRoleFromPath, parseUserPortalRole } from '@/lib/auth'
import { useStore } from '@/store/useStore'

export function TopNav() {
  const pathname = usePathname()
  const { isSidebarOpen, toggleSidebar } = useStore()
  const { isLoaded, user } = useUser()

  const isAdmin = pathname.startsWith('/admin')
  const isFactory = pathname.startsWith('/factory')
  const requiredRole = getPortalRoleFromPath(pathname)
  const userRole = parseUserPortalRole(user?.publicMetadata?.role)
  const hasPortalAccess = !requiredRole || (!!user && userRole === requiredRole)

  const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Signed in'

  return (
    <nav className="sticky top-0 z-40 border-b border-charcoal-200 bg-white shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {(isAdmin || isFactory) && hasPortalAccess && isLoaded && user && (
              <button
                onClick={toggleSidebar}
                className="rounded-lg p-2 text-charcoal-600 hover:bg-charcoal-100 lg:hidden"
                aria-label="Toggle sidebar"
              >
                {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-teal-600">
                <span className="text-xl font-bold text-white">PS</span>
              </div>
              <div>
                <div className="text-lg font-bold text-charcoal-900">Pollu-Stake</div>
                <div className="text-xs text-charcoal-500">Environmental Compliance</div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isAdmin && (
              <div className="hidden rounded-xl bg-teal-100 px-3 py-1 text-sm font-medium text-teal-800 sm:block">
                Admin Portal
              </div>
            )}
            {isFactory && (
              <div className="hidden rounded-xl bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800 sm:block">
                Factory Portal
              </div>
            )}
            <SignedOut>
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm">Sign Up</Button>
                </SignUpButton>
              </div>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-semibold text-charcoal-900">{displayName}</div>
                  {userRole && (
                    <div className="text-xs uppercase tracking-wide text-charcoal-500">
                      {userRole} access
                    </div>
                  )}
                </div>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
            <WalletConnect />
          </div>
        </div>
      </div>
    </nav>
  )
}
