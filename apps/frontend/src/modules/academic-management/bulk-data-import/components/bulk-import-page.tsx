'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Badge } from '@una-gc/ui/components/badge'
import { useImportExcel } from '../hooks/useImportExcel'
import { ImportForm } from './import-form'
import { RefreshCw, Upload, FileSpreadsheet } from 'lucide-react'
import { Skeleton } from '@una-gc/ui/components/skeleton'

export function BulkImportPage() {
  const { file, excelData, error, success, loading, handleFileChange, handleSubmit, resetImport } = useImportExcel()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <RefreshCw className="animate-spin h-8 w-8 text-primary mr-4" />
            <Skeleton className="h-10 w-1/3" />
          </div>
          <Skeleton className="h-6 w-1/2 mx-auto" />
        </div>
        <Card className="border-0 shadow-sm glass-effect">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-1/2" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10 mr-4 icon-bounce">
            <FileSpreadsheet className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Importación Masiva de Datos
            </h1>
            <div className="flex items-center justify-center mt-2">
              <Badge variant="secondary" className="text-xs">
                Cargar Archivos Excel
              </Badge>
            </div>
          </div>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Importe datos masivamente desde archivos Excel para agilizar la gestión académica.
        </p>
      </div>

      {/* Content Card */}
      <Card className="border-0 shadow-sm glass-effect">
        <CardHeader className="pb-2 pt-6">
          <CardTitle className="text-xl font-semibold text-center flex justify-center items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            <span>Selecciona el archivo Excel que deseas importar</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 px-6 space-y-4">
          <ImportForm
            file={file}
            excelData={excelData}
            loading={loading}
            success={success}
            error={error}
            onChange={handleFileChange}
            onSubmit={handleSubmit}
            reset={resetImport}
          />
        </CardContent>
      </Card>
    </div>
  )
}
