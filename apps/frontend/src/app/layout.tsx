import '@una-gc/ui/globals.css'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'

import { ThemeProvider } from '@/providers/theme-provider'
import { Toaster } from 'sonner'
import { ModeToggle } from './(components)/mode-toggle'
import ReactQueryProvider from '@/providers/react-query-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Google Login App',
  description: 'Login with Google and redirect to profile'
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} flex min-h-screen items-center justify-center antialiased`}>
        <ReactQueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
            <div className="fixed top-4 right-4">
              <ModeToggle />
            </div>
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
