'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { AppSidebar } from '@/app/(components)/ui/app-sidebar'
import { SidebarProvider } from '@una-gc/ui/components/sidebar'

export function ContentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  //  pages whitout sidebar
  const isLoginPage = pathname === '/auth/login'
  const isAuthErrorPage = pathname === '/auth/error'
  const isSelectRolePage = pathname === '/auth/select-role'

  if (isLoginPage || isAuthErrorPage || isSelectRolePage) {
    return <>{children}</>
  }

  // general layout with sidebar. Center content
  return (
    <SidebarProvider>
      <AppSidebar />
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100%'
        }}
      >
        {children}
      </div>
    </SidebarProvider>
  )
}
