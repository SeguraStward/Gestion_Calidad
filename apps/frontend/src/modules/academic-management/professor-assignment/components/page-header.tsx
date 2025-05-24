'use client'

import { UserPlus } from 'lucide-react'

export function PageHeader() {
  return (
    <div className="flex items-center space-x-3 border-b pb-4">
      <UserPlus className="h-8 w-8 text-primary" />
      <h1 className="text-3xl font-bold">Gestión de Profesores y Cursos</h1>
    </div>
  )
}
