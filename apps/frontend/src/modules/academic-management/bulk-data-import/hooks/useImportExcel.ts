import { useState } from 'react'
import * as XLSX from 'xlsx'

export function useImportExcel() {
  const [file, setFile] = useState<File | null>(null)
  const [excelData, setExcelData] = useState<any[][] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (file: File | null) => {
    setFile(file)
    setSuccess(false)
    setError(null)
    setExcelData(null) // Reinicia el preview cuando cambia el archivo

    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheet = workbook.SheetNames[0]
      if (!firstSheet) {
        setError('No se encontró ninguna hoja en el archivo.')
        return
      }
      const worksheet = workbook.Sheets[firstSheet]
      if (!worksheet) {
        setError('No se pudo leer la hoja del archivo.')
        return
      }
      const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      if (parsedData.length === 0) {
        setError('El archivo está vacío.')
      } else if (!Array.isArray(parsedData[0]) || parsedData[0].length === 0) {
        setError('El archivo debe tener al menos una fila de encabezados.')
      } else {
        setExcelData(parsedData as any[][])
      }
    }
    reader.onerror = () => setError('Error al leer el archivo.')
    reader.readAsArrayBuffer(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)
    setError(null)

    if (!file || !excelData) {
      setError('Debes subir un archivo válido antes de importar.')
      return
    }

    setLoading(true)
    try {
      // Aquí va la integración con el backend
      await new Promise((r) => setTimeout(r, 1500)) // Simulación de carga
      setSuccess(true)
    } catch (err) {
      setError('Ocurrió un error al intentar importar.')
    } finally {
      setLoading(false)
    }
  }

  const resetImport = () => {
    setFile(null)
    setExcelData(null)
    setError(null)
    setSuccess(false)
    setLoading(false) // Si quieres resetear también el estado de carga
  }

  return {
    file,
    excelData,
    error,
    success,
    loading,
    handleFileChange,
    handleSubmit,
    resetImport
  }
}
