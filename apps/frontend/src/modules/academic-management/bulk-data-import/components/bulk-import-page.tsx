'use client'

import { Button } from '@una-gc/ui/components/button'
import { Upload, CheckCircle, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { FormLayout } from '../../../../app/(components)/form/form-layout'
import { FormFileInput } from '../../../../app/(components)/form/file-input'
import { useImportExcel } from '../hooks/useImportExcel'
import { ExcelPreview } from './excel-preview'
import { Alert, AlertDescription, AlertTitle } from '@una-gc/ui/components/alert'
import React, { useRef } from 'react'

export function BulkImportPage() {
  const { file, excelData, error, success, loading, handleFileChange, handleSubmit, resetImport } = useImportExcel()

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleImportOtherFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    resetImport()
  }

  return (
    <div className="py-8">
      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Importación Masiva de Datos</CardTitle>
        </CardHeader>

        <CardContent>
          <FormLayout
            title="Sube tu archivo Excel"
            onSubmit={handleSubmit}
            footer={
              <CardFooter className="pt-4">
                {success ? (
                  <Button onClick={handleImportOtherFile} className="w-full">
                    Importar Otro Archivo
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading || !file || !excelData} className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    {loading ? 'Cargando...' : success ? '¡Importación Exitosa!' : 'Importar'}
                  </Button>
                )}
              </CardFooter>
            }
          >
            <FormFileInput
              id="import-file"
              label="Archivo Excel (.xlsx)"
              accept=".xlsx"
              required
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </FormLayout>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="default" className="mb-4">
              <CheckCircle className="h-5 w-5" />
              <AlertTitle>¡Importación exitosa!</AlertTitle>
              <AlertDescription>
                Los datos del archivo <strong>{file?.name}</strong> fueron cargados correctamente.
              </AlertDescription>
            </Alert>
          )}

          {excelData ? (
            <ExcelPreview data={excelData} />
          ) : file && !error ? (
            <div className="mt-4 text-center text-muted">
              <p>¡Revisa que el archivo tenga datos válidos! No se detectaron filas de datos.</p>
            </div>
          ) : (
            !file && <div className="mt-4 text-center text-muted">Por favor, sube un archivo para continuar.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
