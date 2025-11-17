'use client'

import { usePathname } from 'next/navigation'
import { SideNav } from '@/components/SideNav'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showSidebar = pathname?.startsWith('/admin') || pathname?.startsWith('/factory')

  return (
    <div className="relative">
      {showSidebar && <SideNav />}
      <main className={showSidebar ? 'min-h-[calc(100vh-4rem)] lg:ml-64' : 'min-h-[calc(100vh-4rem)]'}>
        {children}
      </main>
    </div>
  )
}
