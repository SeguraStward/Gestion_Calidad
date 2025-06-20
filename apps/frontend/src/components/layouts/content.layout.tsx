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
        key={pathname}
        className="flex flex-col justify-center items-center h-full w-full px-4 md:px-8 py-8 md:py-16 gap-12 transition-opacity transition-transform duration-700 ease-in opacity-0 animate-fadeInComponent"
      >
        {children}
      </div>
    </SidebarProvider>
  )
}
