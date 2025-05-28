'use client'

import { FileSpreadsheet } from 'lucide-react'

export function BulkImportHeader() {
  return (
    <header className="flex flex-col items-center mb-12 px-6 sm:px-0 select-none">
      <div
        className="
          inline-flex items-center justify-center 
          p-5 rounded-full 
          bg-gradient-to-tr from-primary/30 to-primary/10 
          shadow-lg 
          animate-pulse-slow
          mb-8
        "
        aria-label="Ícono de archivo Excel"
      >
        <FileSpreadsheet className="h-12 w-12 text-primary" />
      </div>

      <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-primary drop-shadow-md tracking-tight">
        Importación Masiva de Datos
      </h1>

      <p className="mt-4 max-w-xl text-center text-lg leading-relaxed text-muted-foreground max-sm:px-4">
        Sube tu archivo Excel y mete los datos al sistema de una vez, rápido y sin complicaciones.
      </p>
    </header>
  )
}
