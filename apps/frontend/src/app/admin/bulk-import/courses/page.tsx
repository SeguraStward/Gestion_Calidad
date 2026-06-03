'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Upload, BookOpen, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import * as XLSX from 'xlsx'

import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Alert, AlertDescription, AlertTitle } from '@una-gc/ui/components/alert'
import { Progress } from '@una-gc/ui/components/progress'
import { courseService } from '@/modules/courses/services/course.service'
import type { BulkImportCoursesDto, CourseRowDto } from '@/modules/courses/types/course.types'

export default function BulkImportCoursesPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<CourseRowDto[]>([])
  const [errors, setErrors] = useState<string[]>([])

  // Mutation for bulk import
  const importMutation = useMutation({
    mutationFn: (data: BulkImportCoursesDto) => courseService.bulkImportCourses(data),
    onSuccess: (result) => {
      console.log('Import successful:', result)
    },
    onError: (error: any) => {
      console.error('Import failed:', error)
      setErrors([error.message || 'Error al importar cursos'])
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
        const courses: CourseRowDto[] = []
        const parseErrors: string[] = []

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i]

          // Skip empty rows
          if (!row || row.length === 0 || !row[0]) continue

          // Column order: codigo, nombre, creditos, nivel, horasContacto, horasIndependientes (optional), descripcion (optional)
          const codigo = String(row[0] || '').trim()
          const nombre = String(row[1] || '').trim()
          const creditos = Number(row[2])
          const nivel = Number(row[3])
          const horasContacto = Number(row[4])
          const horasIndependientes = row[5] ? Number(row[5]) : undefined
          const descripcion = row[6] ? String(row[6]).trim() : undefined

          // Validate required fields
          if (!codigo) {
            parseErrors.push(`Fila ${i + 1}: Código es requerido`)
            continue
          }
          if (!nombre) {
            parseErrors.push(`Fila ${i + 1}: Nombre es requerido`)
            continue
          }
          if (isNaN(creditos) || creditos <= 0) {
            parseErrors.push(`Fila ${i + 1}: Créditos debe ser un número mayor a 0`)
            continue
          }
          if (isNaN(nivel) || nivel < 1 || nivel > 5) {
            parseErrors.push(`Fila ${i + 1}: Nivel debe ser un número entre 1 y 5`)
            continue
          }
          if (isNaN(horasContacto) || horasContacto <= 0) {
            parseErrors.push(`Fila ${i + 1}: Horas de contacto debe ser un número mayor a 0`)
            continue
          }

          courses.push({
            codigo,
            nombre,
            creditos,
            nivel,
            horasContacto,
            horasIndependientes,
            descripcion
          })
        }

        if (parseErrors.length > 0) {
          setErrors(parseErrors)
        }

        setParsedData(courses)
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

    importMutation.mutate({ courses: parsedData })
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Importación Masiva de Cursos</h1>
          <p className="text-muted-foreground">Importa cursos desde un archivo Excel</p>
        </div>
      </div>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Formato del Archivo Excel
          </CardTitle>
          <CardDescription>
            El archivo debe tener las siguientes columnas en orden:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold w-48">Columna 1:</span>
                <span>Código (requerido, ej: EIF400)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold w-48">Columna 2:</span>
                <span>Nombre (requerido, ej: Fundamentos de Informática)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold w-48">Columna 3:</span>
                <span>Créditos (requerido, número, ej: 4)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold w-48">Columna 4:</span>
                <span>Nivel (requerido, 1-5, ej: 1)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold w-48">Columna 5:</span>
                <span>Horas de Contacto (requerido, número, ej: 4)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold w-48">Columna 6:</span>
                <span>Horas Independientes (opcional, número, ej: 6)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold w-48">Columna 7:</span>
                <span>Descripción (opcional)</span>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Nota Importante</AlertTitle>
              <AlertDescription>
                La primera fila debe contener los encabezados de las columnas. Los datos deben empezar en la fila 2.
              </AlertDescription>
            </Alert>

            {/* Ejemplo de cómo se ve una fila del Excel */}
            <div className="space-y-2 mt-4">
              <p className="text-sm font-semibold">Ejemplo:</p>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-xs">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Código</th>
                      <th className="px-3 py-2 text-left font-semibold">Nombre</th>
                      <th className="px-3 py-2 text-left font-semibold">Créditos</th>
                      <th className="px-3 py-2 text-left font-semibold">Nivel</th>
                      <th className="px-3 py-2 text-left font-semibold">H. Contacto</th>
                      <th className="px-3 py-2 text-left font-semibold">H. Independ.</th>
                      <th className="px-3 py-2 text-left font-semibold">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-3 py-2 font-mono">EIF400</td>
                      <td className="px-3 py-2">Fundamentos de Informática</td>
                      <td className="px-3 py-2">4</td>
                      <td className="px-3 py-2">1</td>
                      <td className="px-3 py-2">4</td>
                      <td className="px-3 py-2">6</td>
                      <td className="px-3 py-2 text-muted-foreground">Curso introductorio de programación</td>
                    </tr>
                    <tr className="border-t bg-muted/30">
                      <td className="px-3 py-2 font-mono">DEX321</td>
                      <td className="px-3 py-2">Desarrollo Web Avanzado</td>
                      <td className="px-3 py-2">3</td>
                      <td className="px-3 py-2">3</td>
                      <td className="px-3 py-2">3</td>
                      <td className="px-3 py-2 italic text-muted-foreground">(vacío)</td>
                      <td className="px-3 py-2 italic text-muted-foreground">(vacío)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">
                Las celdas marcadas como <em>(vacío)</em> son opcionales; dejá la columna en blanco si no aplica.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Cargar Archivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="flex-1"
              disabled={importMutation.isPending}
            />
            {file && (
              <Button
                onClick={handleImport}
                disabled={importMutation.isPending || parsedData.length === 0}
              >
                {importMutation.isPending ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importar {parsedData.length} curso(s)
                  </>
                )}
              </Button>
            )}
          </div>

          {importMutation.isPending && (
            <div className="space-y-2">
              <Progress value={33} />
              <p className="text-sm text-muted-foreground">Importando cursos...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Errores en el archivo</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.slice(0, 10).map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
              {errors.length > 10 && (
                <li className="text-sm">... y {errors.length - 10} errores más</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Result */}
      {importMutation.isSuccess && importMutation.data && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Importación Completada</AlertTitle>
          <AlertDescription className="text-green-700">
            <div className="space-y-2">
              <p>✅ Cursos creados: {importMutation.data.created}</p>
              <p>🔄 Cursos actualizados: {importMutation.data.updated}</p>
              {importMutation.data.errors > 0 && (
                <p>⚠️ Errores: {importMutation.data.errors}</p>
              )}
              {importMutation.data.errorDetails.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold">Detalles de errores:</p>
                  <ul className="list-disc list-inside">
                    {importMutation.data.errorDetails.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Parsed Data Preview */}
      {parsedData.length > 0 && !importMutation.isSuccess && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Vista Previa ({parsedData.length} cursos)
            </CardTitle>
            <CardDescription>
              Verifica que los datos sean correctos antes de importar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Código</th>
                    <th className="text-left p-2">Nombre</th>
                    <th className="text-left p-2">Créditos</th>
                    <th className="text-left p-2">Nivel</th>
                    <th className="text-left p-2">H. Contacto</th>
                    <th className="text-left p-2">H. Independ.</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 10).map((course, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 font-mono">{course.codigo}</td>
                      <td className="p-2">{course.nombre}</td>
                      <td className="p-2">{course.creditos}</td>
                      <td className="p-2">{course.nivel}</td>
                      <td className="p-2">{course.horasContacto}</td>
                      <td className="p-2">{course.horasIndependientes || '-'}</td>
                    </tr>
                  ))}
                  {parsedData.length > 10 && (
                    <tr>
                      <td colSpan={6} className="p-2 text-center text-muted-foreground">
                        ... y {parsedData.length - 10} cursos más
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
