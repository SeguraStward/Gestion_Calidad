'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { useImportExcel } from '../hooks/useImportExcel'
import { BulkImportHeader } from './bulk-import-header'
import { ImportForm } from './import-form'
import { RefreshCw, Upload } from 'lucide-react'
import { Skeleton } from '@una-gc/ui/components/skeleton'

export function BulkImportPage() {
  const { file, excelData, error, success, loading, handleFileChange, handleSubmit, resetImport } = useImportExcel()

  if (loading) {
    return (
      <div className="p-10 max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <RefreshCw className="animate-spin h-6 w-6 mr-3 text-primary" />
          <Skeleton className="h-10 w-1/3" />
        </div>
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-12 w-1/2 mb-6" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-2 px-2 flex flex-col items-center bg-background">
      <div className="w-full max-w-4xl mx-auto">
        <BulkImportHeader />
        <Card className="w-full">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-2xl font-semibold text-center flex justify-center items-center gap-2">
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
    </div>
  )
}
