'use client'

import { SignInButton, useUser } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import { SideNav } from '@/components/SideNav'
import { Button } from '@/components/ui/Button'
import { getPortalRoleFromPath, parseUserPortalRole } from '@/lib/auth'
import { PortalRole } from '@/types'

const roleCopy: Record<PortalRole, { title: string; description: string }> = {
  admin: {
    title: 'Admin portal access',
    description: 'Only designated regulators / DAO stewards can review the global dashboards.',
  },
  factory: {
    title: 'Factory portal access',
    description: 'Only verified factory operators can manage stakes and view compliance forecasts.',
  },
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isLoaded, user } = useUser()

  const requiredRole = getPortalRoleFromPath(pathname)
  const userRole = parseUserPortalRole(user?.publicMetadata?.role)
  const wantsSidebar = Boolean(pathname?.startsWith('/admin') || pathname?.startsWith('/factory'))
  const isAuthorized = !requiredRole || (!!user && userRole === requiredRole)
  const showSidebar = wantsSidebar && isAuthorized

  const renderGate = () => {
    if (!requiredRole) {
      return children
    }

    if (!isLoaded) {
      return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-charcoal-50 to-teal-50">
          <div className="space-y-4 text-center">
            <div className="text-lg font-semibold text-charcoal-700">Checking your access…</div>
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-teal-500" />
          </div>
        </div>
      )
    }

    if (!user) {
      const copy = roleCopy[requiredRole]
      return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-charcoal-50 to-teal-50 px-4 py-16">
          <div className="w-full max-w-lg rounded-3xl border border-charcoal-200 bg-white p-8 text-center shadow-xl">
            <h2 className="text-2xl font-semibold text-charcoal-900">{copy.title}</h2>
            <p className="mt-2 text-sm text-charcoal-600">{copy.description}</p>
            <p className="mt-6 text-sm text-charcoal-500">
              Please sign in with a Clerk account that has the appropriate role assigned.
            </p>
            <SignInButton mode="modal" forceRedirectUrl={pathname || undefined}>
              <Button className="mt-6 w-full">Sign in to continue</Button>
            </SignInButton>
          </div>
        </div>
      )
    }

    if (!isAuthorized) {
      const copy = roleCopy[requiredRole]
      return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-charcoal-50 to-teal-50 px-4 py-16">
          <div className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-charcoal-900">Access restricted</h2>
            <p className="mt-2 text-sm text-charcoal-600">{copy.title}</p>
            <p className="mt-4 text-sm text-charcoal-600">
              Your account role is <span className="font-semibold">{userRole ?? 'unassigned'}</span>. This area
              requires the <span className="font-semibold">{requiredRole}</span> role.
            </p>
            <p className="mt-4 text-sm text-charcoal-600">
              Update the Clerk user&apos;s <code className="rounded bg-charcoal-100 px-1">publicMetadata.role</code> to
              &quot;{requiredRole}&quot; (Clerk Dashboard → Users → Metadata) or switch to another authorized account.
            </p>
          </div>
        </div>
      )
    }

    return children
  }

  return (
    <div className="relative">
      {showSidebar && <SideNav />}
      <main className={showSidebar ? 'min-h-[calc(100vh-4rem)] lg:ml-64' : 'min-h-[calc(100vh-4rem)]'}>
        {renderGate()}
      </main>
    </div>
  )
}
