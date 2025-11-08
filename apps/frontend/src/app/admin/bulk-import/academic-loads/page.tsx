'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Upload, GraduationCap, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import * as XLSX from 'xlsx'

import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Alert, AlertDescription, AlertTitle } from '@una-gc/ui/components/alert'
import { Progress } from '@una-gc/ui/components/progress'
import { academicLoadService } from '@/modules/academic-management/academic-load/services/academic-load.service'
import type {
  AcademicLoadRowDto,
  BulkImportAcademicLoadsDto
} from '@/modules/academic-management/academic-load/types/academic-load'

export default function BulkImportAcademicLoadsPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<AcademicLoadRowDto[]>([])
  const [errors, setErrors] = useState<string[]>([])

  // Mutation for bulk import
  const importMutation = useMutation({
    mutationFn: (data: BulkImportAcademicLoadsDto) => academicLoadService.bulkImportAcademicLoads(data),
    onSuccess: (result) => {
      console.log('Import successful:', result)
    },
    onError: (error: any) => {
      console.error('Import failed:', error)
      setErrors([error.message || 'Error al importar cargas académicas'])
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
        const loads: AcademicLoadRowDto[] = []
        const parseErrors: string[] = []

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i]

          // Skip empty rows
          if (!row || row.length === 0) continue

          // Column order: numeroAula, campus, ciclo, cupoDisponible, cupoMatricula, cupoMaximo, curso, grupo, horario, nrc, profesorCedula
          const numeroAula = row[0] ? String(row[0]).trim() : undefined
          const campus = String(row[1] || '').trim()
          const ciclo = String(row[2] || '').trim()
          const cupoDisponible = String(row[3] || '').trim()
          const cupoMatricula = String(row[4] || '').trim()
          const cupoMaximo = String(row[5] || '').trim()
          const curso = String(row[6] || '').trim()
          const grupo = String(row[7] || '').trim()
          const horario = row[8] ? String(row[8]).trim() : undefined
          const nrc = String(row[9] || '').trim()
          const profesorCedula = String(row[10] || '').trim()

          // Validate required fields
          if (!campus) parseErrors.push(`Fila ${i + 1}: Campus es requerido`)
          if (!ciclo) parseErrors.push(`Fila ${i + 1}: Ciclo es requerido (ej: Ciclo I, Ciclo II)`)
          if (!cupoDisponible) parseErrors.push(`Fila ${i + 1}: Cupo disponible es requerido`)
          if (!cupoMatricula) parseErrors.push(`Fila ${i + 1}: Cupo matrícula es requerido`)
          if (!cupoMaximo) parseErrors.push(`Fila ${i + 1}: Cupo máximo es requerido`)
          if (!curso) parseErrors.push(`Fila ${i + 1}: Código del curso es requerido`)
          if (!grupo) parseErrors.push(`Fila ${i + 1}: Grupo es requerido`)
          if (!nrc) parseErrors.push(`Fila ${i + 1}: NRC es requerido`)
          if (!profesorCedula) parseErrors.push(`Fila ${i + 1}: Cédula del profesor es requerida`)

          if (parseErrors.length > 10) break // Stop if too many errors

          if (campus && ciclo && cupoDisponible && cupoMatricula && cupoMaximo && curso && grupo && nrc && profesorCedula) {
            loads.push({
              numeroAula,
              campus,
              ciclo,
              cupoDisponible,
              cupoMatricula,
              cupoMaximo,
              curso,
              grupo,
              horario,
              nrc,
              profesorCedula
            })
          }
        }

        if (parseErrors.length > 0) {
          setErrors(parseErrors)
        }

        setParsedData(loads)
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

    importMutation.mutate({ loads: parsedData })
  }

  const handleReset = () => {
    setFile(null)
    setParsedData([])
    setErrors([])
    importMutation.reset()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Importación Masiva de Cargas Académicas</h1>
        </div>
        <p className="text-muted-foreground">
          Importa múltiples cargas académicas desde un archivo Excel
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-muted rounded-lg text-sm">
            <div><strong>1. Número Aula:</strong> Opcional</div>
            <div><strong>2. Campus:</strong> Nombre del campus</div>
            <div><strong>3. Ciclo:</strong> Ciclo I o Ciclo II</div>
            <div><strong>4. Cupo Disponible:</strong> Cantidad</div>
            <div><strong>5. Cupo Matrícula:</strong> Cantidad</div>
            <div><strong>6. Cupo Máximo:</strong> Cantidad</div>
            <div><strong>7. Curso:</strong> Código del curso</div>
            <div><strong>8. Grupo:</strong> Número de grupo</div>
            <div><strong>9. Horario:</strong> Opcional</div>
            <div><strong>10. NRC:</strong> Código único</div>
            <div><strong>11. Cédula Profesor:</strong> Identificación</div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p><strong>Notas importantes:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>El <strong>ciclo</strong> debe ser "Ciclo I" o "Ciclo II"</li>
              <li>El <strong>curso</strong> se buscará por código (ej: DEX321)</li>
              <li>El <strong>profesor</strong> se buscará por cédula (debe estar registrado previamente)</li>
              <li>El <strong>grupo</strong> se creará automáticamente si no existe</li>
              <li>Si el <strong>horario</strong> no existe, se creará automáticamente</li>
              <li>Si el <strong>NRC</strong> ya existe, se actualizará la carga académica</li>
            </ul>
          </div>
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
              Se encontraron {parsedData.length} cargas académicas para importar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Aula</th>
                    <th className="px-3 py-2 text-left">Campus</th>
                    <th className="px-3 py-2 text-left">Ciclo</th>
                    <th className="px-3 py-2 text-left">Curso</th>
                    <th className="px-3 py-2 text-left">Grupo</th>
                    <th className="px-3 py-2 text-left">NRC</th>
                    <th className="px-3 py-2 text-left">Profesor</th>
                    <th className="px-3 py-2 text-left">Cupos (D/M/Max)</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 50).map((load, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-3 py-2">{index + 1}</td>
                      <td className="px-3 py-2">{load.numeroAula || '-'}</td>
                      <td className="px-3 py-2">{load.campus}</td>
                      <td className="px-3 py-2">{load.ciclo}</td>
                      <td className="px-3 py-2">{load.curso}</td>
                      <td className="px-3 py-2">{load.grupo}</td>
                      <td className="px-3 py-2 font-mono">{load.nrc}</td>
                      <td className="px-3 py-2">{load.profesorCedula}</td>
                      <td className="px-3 py-2">{load.cupoDisponible}/{load.cupoMatricula}/{load.cupoMaximo}</td>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
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
                <strong>Total:</strong> {importMutation.data.created + importMutation.data.updated + importMutation.data.errors}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-green-200">
              <div>
                <strong>Cursos encontrados:</strong> {importMutation.data.stats.coursesFound}
              </div>
              <div>
                <strong>Grupos encontrados:</strong> {importMutation.data.stats.groupsFound}
              </div>
              <div>
                <strong>Horarios creados:</strong> {importMutation.data.stats.schedulesCreated}
              </div>
              <div>
                <strong>Profesores creados:</strong> {importMutation.data.stats.professorsCreated}
              </div>
            </div>
            {importMutation.data.errorDetails.length > 0 && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <strong>Detalles de errores:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
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
                <span>Importando cargas académicas...</span>
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
          {importMutation.isPending ? 'Importando...' : `Importar ${parsedData.length} Cargas`}
        </Button>
      </div>
    </div>
  )
}
