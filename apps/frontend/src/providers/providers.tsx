'use client'

import ReactQueryProvider from './react-query-provider'
import { ThemeProvider } from './theme-provider'
import { Toaster } from 'sonner'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ReactQueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        <Toaster />
      </ThemeProvider>
    </ReactQueryProvider>
  )
}
