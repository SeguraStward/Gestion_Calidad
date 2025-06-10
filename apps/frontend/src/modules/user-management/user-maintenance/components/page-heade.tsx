import { UserCircle2 } from 'lucide-react'

export function PageHeader() {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="bg-primary/10 rounded-full p-3">
        <UserCircle2 className="h-10 w-10 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-bold leading-tight">Gestión de Usuarios</h1>
        <p className="text-muted-foreground text-sm">Administra los usuarios del sistema.</p>
      </div>
    </div>
  )
}
