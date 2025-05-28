export type ImportMode = 'create' | 'update'

export interface ExcelDataManagerProps {
  // Title and descriptions
  title?: string
  description?: string

  // Functions for data operations
  importExcel: (formData: FormData) => Promise<any>
  exportExcel: () => Promise<any>
  downloadTemplate: () => void

  // API status indicators
  isImporting?: boolean
  isExporting?: boolean

  // Optional refetch function to update data after import
  refetch?: () => void

  // File configuration
  maxFileSize?: number // in bytes
  allowedFileTypes?: string[]

  // Custom labels
  labels?: {
    importSection?: string
    exportSection?: string
    selectFile?: string
    createMode?: string
    updateMode?: string
    importButton?: string
    templateButton?: string
    exportButton?: string
    processingText?: string
    exportingText?: string
    dividerText?: string
  }
}

export const DEFAULT_LABELS = {
  importSection: 'Importar Datos',
  exportSection: 'Exportar Datos',
  selectFile: 'Seleccionar archivo Excel',
  createMode: 'Crear nuevos (ignora ID)',
  updateMode: 'Actualizar (requiere ID)',
  importButton: 'Importar',
  templateButton: 'Descargar Plantilla',
  exportButton: 'Exportar Datos',
  processingText: 'Procesando...',
  exportingText: 'Exportando...',
  dividerText: 'O'
}

export const DEFAULT_ALLOWED_TYPES = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.csv',
  '.xlsx',
  '.xls'
]

export const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
