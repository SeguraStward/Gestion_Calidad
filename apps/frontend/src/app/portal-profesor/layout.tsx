import { ReactNode } from 'react'

export const metadata = {
  title: 'Portal del Profesor — UNA',
  description: 'Acceso al portal de informes de cursos'
}

export default function PortalProfesorLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
