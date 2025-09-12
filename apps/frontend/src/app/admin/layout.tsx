import { ReactNode } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Administración - Sistema de Gestión de Calidad',
  description: 'Panel de administración del sistema',
}

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-6">
            <h1 className="text-xl font-semibold">Panel de Administración</h1>
            <div className="flex space-x-4">
              <a
                href="/admin/question-management"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Gestión de Preguntas
              </a>
              {/* Agregar más enlaces de navegación aquí */}
            </div>
          </nav>
        </div>
      </div>
      <main>{children}</main>
    </div>
  )
}
