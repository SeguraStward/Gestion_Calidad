import '@una-gc/ui/globals.css'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'

import Providers from '@/providers/providers'
import { ThemeToggle } from '@/components/toggles/theme-toggle'
import { ContentLayout } from '@/components/layouts/content.layout'

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
      <body className={inter.className}>
        <Providers>
          {/* Layout configuration, is aplicated for all */}
          <ContentLayout>{children}</ContentLayout>

          {/* Theme button */}
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
        </Providers>
      </body>
    </html>
  )
}
