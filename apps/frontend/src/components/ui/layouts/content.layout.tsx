'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { AppSidebar } from '@/app/(components)/ui/app-sidebar'
import { SidebarProvider } from '@una-gc/ui/components/sidebar'

export function ContentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // Pages without sidebar
  const isAuthPage = pathname.startsWith('/auth')
  const isCallbackPage = pathname === '/auth/callback'

  // Pages that need scroll
  const needsScroll = [
    '/final-reports',
    '/user-management',
    '/academic-management',
    '/academic-load',
    '/bulk-import',
    '/times-management'
  ].some((path) => pathname.startsWith(path))

  // Pages that need horizontal scroll
  const needsHorizontalScroll = pathname.startsWith('/sinaes-management')

  // HomePage doesn't need sidebar scroll
  const isHomePage = pathname === '/'

  if (isAuthPage || isCallbackPage) {
    return <div className="h-screen overflow-auto">{children}</div>
  }

  // General layout with sidebar
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 h-screen flex flex-col">
        <div
          className={`
            flex-1 transition-opacity transition-transform duration-700 ease-in opacity-0 animate-fadeInComponent
            ${needsScroll ? 'overflow-y-auto custom-scrollbar' : needsHorizontalScroll ? '' : 'overflow-hidden'}
            ${isHomePage ? 'p-0' : 'p-4 md:p-8'}
          `}
          style={needsHorizontalScroll ? { overflow: 'visible' } : {}}
        >
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
