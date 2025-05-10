import { ReactNode } from 'react'
import { AppSidebar } from '../(components)/ui/app-sidebar'
import { SidebarProvider } from '@una-gc/ui/components/sidebar'

export default function GestionAcademicaLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        {/* Sidebar fijo */}
        <AppSidebar className="w-64 flex-shrink-0 border-r border-border" />

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto">
          {/* Wrapper centrado con padding y altura completa */}
          <div className="h-full w-full max-w-7xl mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export function GestionAcademicaPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-20">
      <h1 className="text-4xl font-bold mb-4">Gestión Académica</h1>
      <p className="text-lg text-muted-foreground">Selecciona una opción del menú lateral para empezar</p>
    </div>
  )
}
