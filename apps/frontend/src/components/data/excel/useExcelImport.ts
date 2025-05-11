import { useState, useRef, useCallback } from 'react'
import { showErrorAlert } from '@/lib/alert'
import { ImportMode } from './types'

interface UseExcelImportProps {
  importExcel: (formData: FormData) => Promise<any>
  refetch?: () => void
  allowedFileTypes: string[]
  maxFileSize: number
}

export const useExcelImport = ({ importExcel, refetch, allowedFileTypes, maxFileSize }: UseExcelImportProps) => {
  const [file, setFile] = useState<File | null>(null)
  const [importMode, setImportMode] = useState<ImportMode>('create')
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // File validation
  const validateFile = useCallback(
    (selectedFile: File | null): boolean => {
      if (!selectedFile) return false

      // Type validation
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase() || ''
      const isValidType = allowedFileTypes.some(
        (type) => selectedFile.type === type || type.includes(fileExtension) || selectedFile.name.endsWith(type)
      )

      if (!isValidType) {
        showErrorAlert(`Tipo de archivo no válido. Formatos permitidos: ${allowedFileTypes.join(', ')}`)
        return false
      }

      // Size validation
      if (selectedFile.size > maxFileSize) {
        const sizeMB = maxFileSize / (1024 * 1024)
        showErrorAlert(`El archivo es demasiado grande. El tamaño máximo permitido es ${sizeMB}MB`)
        return false
      }

      return true
    },
    [allowedFileTypes, maxFileSize]
  )

  // Reset file input
  const resetFileInput = useCallback(() => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // File selection handler
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0] || null

      if (!validateFile(selectedFile)) {
        resetFileInput()
        return
      }

      setFile(selectedFile)
    },
    [validateFile, resetFileInput]
  )

  // Import handler
  const handleImport = useCallback(async () => {
    if (!file) {
      showErrorAlert('Por favor seleccione un archivo Excel')
      return
    }

    try {
      setIsProcessing(true)
      setProgress(10)

      // Prepare form data with the import mode
      const formData = new FormData()
      formData.append('file', file)
      formData.append('mode', importMode)

      // Calcula el intervalo de progreso basado en el tamaño del archivo
      const progressStep = Math.max(2, Math.min(10, Math.floor(file.size / (1024 * 100))))
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return Math.min(90, prev + progressStep)
        })
      }, 300)

      // Import the file
      await importExcel(formData)

      clearInterval(progressInterval)
      setProgress(100)

      setTimeout(() => {
        setProgress(0)
        setIsProcessing(false)
        resetFileInput()
        if (refetch) refetch()
      }, 500)
    } catch (error) {
      setIsProcessing(false)
      setProgress(0)
      console.error('Import error:', error)
      showErrorAlert('Error al importar el archivo. Por favor, intente nuevamente.')
    }
  }, [file, importMode, importExcel, resetFileInput, refetch])

  return {
    file,
    importMode,
    progress,
    isProcessing,
    fileInputRef,
    handleFileChange,
    handleImport,
    setImportMode,
    fileInfo: file
      ? {
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`
        }
      : null
  }
}
