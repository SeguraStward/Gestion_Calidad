import { ReactNode } from 'react'
import { AppSidebar } from '@/app/(components)/ui/app-sidebar'
import { SidebarProvider } from '@una-gc/ui/components/sidebar'

export default function GestionAcademicaLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        <AppSidebar className="w-64 flex-shrink-0 border-r border-border" />
        <main className="flex-1 overflow-y-auto">
          <div className="h-full w-full max-w-7xl mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}
