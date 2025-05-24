'use client'

import { FileSpreadsheet, FileQuestion, AlertTriangle } from 'lucide-react'
import { ExcelPreview } from './excel-preview'

interface ImportPreviewProps {
  excelData?: any[][] | null
  file?: File | null
  error?: string | null
  onErrorClick?: () => void
}

export function ImportPreview({ excelData, file, error, onErrorClick }: ImportPreviewProps) {
  // Estado inicial - sin archivo
  if (!file) {
    return (
      <div className="mt-6 text-center px-6 py-8 bg-card/50 border border-dashed border-muted rounded-lg shadow-sm dark:shadow-none">
        <FileSpreadsheet className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground font-medium">Suba un archivo</p>
        <p className="text-xs text-muted-foreground mt-2">
          Formatos soportados: <code className="px-1 py-0.5 bg-muted/50 rounded">.xlsx</code>
        </p>
      </div>
    )
  }

  // Estado de error
  if (error) {
    return (
      <div
        className="mt-6 text-center px-6 py-8 bg-warning/10 border border-warning rounded-lg shadow-sm dark:shadow-none cursor-pointer hover:bg-warning/20 transition-colors"
        onClick={onErrorClick}
      >
        <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-warning" />
        <p className="text-sm font-semibold text-warning-foreground">
          Hubo un error: <span className="block mt-1 font-normal">{error}</span>
        </p>
        <p className="text-xs text-warning-foreground/80 mt-2">Haz clic aquí para limpiar el formulario e intentar de nuevo.</p>
      </div>
    )
  }

  // Archivo cargado pero sin datos válidos
  if (!excelData || excelData.length === 0) {
    return (
      <div className="mt-6 text-center px-6 py-8 bg-card/50 border border-dashed border-muted rounded-lg shadow-sm dark:shadow-none">
        <FileQuestion className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground font-medium">No se encontraron filas válidas en el archivo.</p>
        <p className="text-xs text-muted-foreground mt-2">Revise el contenido del Excel, que no esté vacío o mal formado.</p>
      </div>
    )
  }

  // Vista previa normal con datos
  return (
    <div className="mt-6 w-full">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground mb-4">
        <FileSpreadsheet className="h-5 w-5 text-primary" />
        Vista previa de datos
      </h3>
      <ExcelPreview data={excelData} />
    </div>
  )
}
