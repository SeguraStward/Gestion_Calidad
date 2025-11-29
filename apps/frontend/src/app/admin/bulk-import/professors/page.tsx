'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Upload, Users, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import * as XLSX from 'xlsx'

import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Alert, AlertDescription, AlertTitle } from '@una-gc/ui/components/alert'
import { Progress } from '@una-gc/ui/components/progress'
import { userApiService } from '@/lib/api/modules/user/user-api.service'
import type { BulkImportProfessorsDto, ProfessorRowDto } from '@/lib/api/modules/user/user.types'

export default function BulkImportProfessorsPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ProfessorRowDto[]>([])
  const [errors, setErrors] = useState<string[]>([])

  // Mutation for bulk import
  const importMutation = useMutation({
    mutationFn: (data: BulkImportProfessorsDto) => userApiService.bulkImportProfessors(data),
    onSuccess: (result) => {
      console.log('Import successful:', result)
    },
    onError: (error: any) => {
      console.error('Import failed:', error)
      setErrors([error.message || 'Error al importar profesores'])
    }
  })

  // Handle file upload and parsing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) {
      setFile(null)
      setParsedData([])
      setErrors([])
      return
    }

    setFile(selectedFile)
    setErrors([])
    setParsedData([])

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.SheetNames[0]

        if (!firstSheet) {
          setErrors(['No se encontró ninguna hoja en el archivo'])
          return
        }

        const worksheet = workbook.Sheets[firstSheet]
        if (!worksheet) {
          setErrors(['No se pudo leer la hoja del archivo'])
          return
        }
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 })

        if (jsonData.length < 2) {
          setErrors(['El archivo debe tener al menos una fila de encabezados y una fila de datos'])
          return
        }

        // Parse data starting from row 1 (skip header row 0)
        const professors: ProfessorRowDto[] = []
        const parseErrors: string[] = []

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i]

          // Skip empty rows
          if (!row || row.length === 0 || !row[0]) continue

          const cedula = String(row[0] || '').trim()
          const nombre = String(row[1] || '').trim()

          // Validate required fields
          if (!cedula) {
            parseErrors.push(`Fila ${i + 1}: Cédula es requerida`)
            continue
          }
          if (!nombre) {
            parseErrors.push(`Fila ${i + 1}: Nombre es requerido`)
            continue
          }

          professors.push({ cedula, nombre })
        }

        if (parseErrors.length > 0) {
          setErrors(parseErrors)
        }

        setParsedData(professors)
      } catch (error) {
        console.error('Error parsing file:', error)
        setErrors(['Error al leer el archivo Excel'])
      }
    }

    reader.onerror = () => {
      setErrors(['Error al leer el archivo'])
    }

    reader.readAsArrayBuffer(selectedFile)
  }

  // Handle import submission
  const handleImport = () => {
    if (parsedData.length === 0) {
      setErrors(['No hay datos para importar'])
      return
    }

    importMutation.mutate({ professors: parsedData })
  }

  const handleReset = () => {
    setFile(null)
    setParsedData([])
    setErrors([])
    importMutation.reset()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Importación Masiva de Profesores</h1>
        </div>
        <p className="text-muted-foreground">
          Importa múltiples profesores desde un archivo Excel con las columnas: <strong>cedula</strong> y <strong>nombre</strong>
        </p>
      </div>

      {/* Instructions Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Formato del Archivo Excel
          </CardTitle>
          <CardDescription>
            El archivo debe contener las siguientes columnas en el orden especificado:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <strong>Columna A:</strong> cedula (ej: 123456789)
            </div>
            <div>
              <strong>Columna B:</strong> nombre (ej: Juan Pérez)
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Nota:</strong> Se creará un usuario con email temporal <code>profesor.[cedula]@una.cr</code> y se asignará el rol de PROFESOR.
          </p>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>1. Seleccionar Archivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={importMutation.isPending}
              className="flex-1"
            />
            {file && (
              <Button variant="outline" onClick={handleReset} disabled={importMutation.isPending}>
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {parsedData.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>2. Vista Previa de Datos</CardTitle>
            <CardDescription>
              Se encontraron {parsedData.length} profesores para importar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-auto max-h-96">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left">#</th>
                    <th className="px-4 py-2 text-left">Cédula</th>
                    <th className="px-4 py-2 text-left">Nombre</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 50).map((professor, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">{professor.cedula}</td>
                      <td className="px-4 py-2">{professor.nombre}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.length > 50 && (
                <div className="p-4 text-center text-sm text-muted-foreground border-t">
                  Mostrando primeros 50 de {parsedData.length} registros
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Errores de Validación</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2">
              {errors.slice(0, 10).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
            {errors.length > 10 && (
              <p className="mt-2 text-sm">Y {errors.length - 10} errores más...</p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Result */}
      {importMutation.isSuccess && importMutation.data && (
        <Alert className="mb-6 border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Importación Completada</AlertTitle>
          <AlertDescription className="text-green-700">
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <strong>Creados:</strong> {importMutation.data.created}
              </div>
              <div>
                <strong>Actualizados:</strong> {importMutation.data.updated}
              </div>
              <div>
                <strong>Errores:</strong> {importMutation.data.errors}
              </div>
              <div>
                <strong>Total procesados:</strong> {importMutation.data.created + importMutation.data.updated + importMutation.data.errors}
              </div>
            </div>
            {importMutation.data.errorDetails.length > 0 && (
              <div className="mt-4">
                <strong>Detalles de errores:</strong>
                <ul className="list-disc list-inside mt-2">
                  {importMutation.data.errorDetails.slice(0, 10).map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
                {importMutation.data.errorDetails.length > 10 && (
                  <p className="text-sm mt-2">Y {importMutation.data.errorDetails.length - 10} errores más...</p>
                )}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading Progress */}
      {importMutation.isPending && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importando profesores...</span>
                <span>Por favor espere</span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()} disabled={importMutation.isPending}>
          Cancelar
        </Button>
        <Button
          onClick={handleImport}
          disabled={parsedData.length === 0 || errors.length > 0 || importMutation.isPending}
        >
          <Upload className="mr-2 h-4 w-4" />
          {importMutation.isPending ? 'Importando...' : `Importar ${parsedData.length} Profesores`}
        </Button>
      </div>
    </div>
  )
}
