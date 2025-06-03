'use client'

import { SidebarProvider } from '@una-gc/ui/components/sidebar'
import ReactQueryProvider from './react-query-provider'
import { ThemeProvider } from './theme-provider'
import { Toaster } from 'sonner'

interface ProvidersProps {
  children: React.ReactNode
  includeSidebar?: boolean
}

export default function Providers({ children, includeSidebar = false }: ProvidersProps) {
  return (
    <ReactQueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {includeSidebar ? <SidebarProvider>{children}</SidebarProvider> : children}
        <Toaster />
      </ThemeProvider>
    </ReactQueryProvider>
  )
}
