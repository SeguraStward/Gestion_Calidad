'use client'

import { useRouter } from 'next/navigation'
import { Users, GraduationCap, FileSpreadsheet, ArrowLeft } from 'lucide-react'

import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'

export default function BulkImportIndexPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <FileSpreadsheet className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Importación Masiva</h1>
        </div>
        <p className="text-muted-foreground">
          Selecciona el tipo de datos que deseas importar desde un archivo Excel
        </p>
      </div>

      {/* Import Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Professors Import */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/bulk-import/professors')}>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Profesores</CardTitle>
            </div>
            <CardDescription>
              Importa múltiples profesores desde un archivo Excel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <strong>Columnas requeridas:</strong>
                <ul className="list-disc list-inside mt-1 text-muted-foreground">
                  <li>Cédula</li>
                  <li>Nombre</li>
                </ul>
              </div>
              <div className="text-sm text-muted-foreground">
                Se crearán usuarios con rol de PROFESOR y email temporal
              </div>
              <Button className="w-full" onClick={(e) => {
                e.stopPropagation()
                router.push('/admin/bulk-import/professors')
              }}>
                Importar Profesores
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Academic Loads Import */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/bulk-import/academic-loads')}>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Cargas Académicas</CardTitle>
            </div>
            <CardDescription>
              Importa múltiples cargas académicas desde un archivo Excel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <strong>Columnas requeridas:</strong>
                <ul className="list-disc list-inside mt-1 text-muted-foreground">
                  <li>Número Aula (opcional), Campus, Ciclo</li>
                  <li>Cupos (Disponible, Matrícula, Máximo)</li>
                  <li>Curso (código), Grupo</li>
                  <li>Horario (opcional), NRC, Cédula Profesor</li>
                </ul>
              </div>
              <div className="text-sm text-muted-foreground">
                El ciclo debe ser "Ciclo I" o "Ciclo II". Los grupos se crearán automáticamente si no existen.
              </div>
              <Button className="w-full" onClick={(e) => {
                e.stopPropagation()
                router.push('/admin/bulk-import/academic-loads')
              }}>
                Importar Cargas Académicas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="mt-8 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Información Importante</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Formato de archivo:</strong> Solo se aceptan archivos Excel (.xlsx, .xls)
          </p>
          <p>
            <strong>Primera fila:</strong> Debe contener los encabezados de las columnas
          </p>
          <p>
            <strong>Validación:</strong> El sistema validará los datos antes de importar y mostrará errores si los hay
          </p>
          <p>
            <strong>Duplicados:</strong> Si un registro ya existe (por cédula o NRC), se actualizará en lugar de crear uno nuevo
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
