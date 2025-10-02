import '@/styles/homepage.css'
import '@una-gc/ui/globals.css'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'

import { HydrationGuard } from '@/components/styles/hydration-guard'
import { ContentLayout } from '@/components/ui/layouts/content.layout'
import { ThemeToggle } from '@/components/ui/toggles/theme.toggle'
import Providers from '@/providers/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Gestión de Calidad - UNA',
  description: 'Sistema de Gestión de Calidad de la Universidad Nacional'
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <title>Gestión de Calidad - UNA</title>
        <meta name="description" content="Sistema de Gestión de Calidad de la Universidad Nacional" />
      </head>
      <body className={`${inter.className}`}>
        <Providers>
          <HydrationGuard>
            {/* Layout configuration, is applied for all */}
            <ContentLayout>
              <div className="h-full w-full transition-opacity transition-transform duration-700 ease-in opacity-0 animate-fadeInComponent">
                {children}
              </div>
            </ContentLayout>
            {/* Theme button */}
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </div>
          </HydrationGuard>
        </Providers>
      </body>
    </html>
  )
}
