import '@una-gc/ui/globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Gestión de Calidad - UNA',
  description: 'Sistema de Gestión de Calidad - Universidad Nacional'
}

function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <section className="flex items-center justify-center min-h-screen w-full px-4">
      <div className="w-full max-w-md space-y-6">{children}</div>
    </section>
  )
}

export default AuthLayout
