'use client'

import { useRef, useState, useEffect } from 'react'
import { Button } from '@una-gc/ui/components/button'
import { CardFooter } from '@una-gc/ui/components/card'
import { FormLayout } from '@/app/(components)/form/form-layout'
import { FormFileInput } from '@/app/(components)/form/file-input'
import { Upload, RefreshCw, X } from 'lucide-react'
import { ImportPreview } from './import-preview'
import { AlertMessage } from '@/app/(components)/ui/alert-message' // ⚠️ Ajustá esta ruta según tu estructura

interface ImportFormProps {
  file?: File | null
  excelData?: any
  loading: boolean | null
  success: boolean | null
  error?: string | null
  onChange: (file: File | null) => void
  onSubmit: (e: React.FormEvent) => void
  reset: () => void
}

export function ImportForm({ file, excelData, loading, success, error, onChange, onSubmit, reset }: ImportFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [showError, setShowError] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false) // 🟢 Controla modal

  useEffect(() => {
    if (error) setShowError(true)
  }, [error])

  useEffect(() => {
    if (success) {
      setShowSuccessModal(true) // ✅ Dispara modal al éxito
    }
  }, [success])

  const handleImportOtherFile = () => {
    resetFileInput()
    reset()
    setShowError(false)
  }

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = () => {
    resetFileInput()
    onChange(null)
    setShowError(false)
  }

  return (
    <div className="flex flex-col items-center px-4 py-8">
      <FormLayout
        title={<h2 className="text-center text-2xl font-semibold mb-4">Selecciona el archivo Excel que deseas importar</h2>}
        onSubmit={onSubmit}
        footer={
          <CardFooter className="pt-6 flex flex-col gap-2">
            {success ? (
              <Button onClick={handleImportOtherFile} className="w-full bg-primary">
                <RefreshCw className="mr-2 h-4 w-4" />
                Importar otro archivo
              </Button>
            ) : (
              <>
                <Button type="submit" disabled={loading || !file || !excelData} className="w-full bg-primary">
                  <Upload className="mr-2 h-4 w-4" />
                  {loading ? 'Procesando...' : 'Importar Datos'}
                </Button>
                {file && !loading && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveFile}
                    className="w-full hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Quitar archivo
                  </Button>
                )}
              </>
            )}
          </CardFooter>
        }
        className="space-y-4 w-full max-w-md"
      >
        <div className="bg-muted/30 p-4 rounded-lg border border-dashed border-muted-foreground/30">
          <FormFileInput
            id="import-file"
            label="Archivo Excel (.xlsx)"
            accept=".xlsx"
            required
            onChange={(e) => {
              onChange(e)
              setShowError(false)
            }}
            ref={fileInputRef}
          />
        </div>
      </FormLayout>

      <div className="w-full max-w-3xl mt-6">
        <ImportPreview excelData={excelData} file={file} error={showError ? error : null} onErrorClick={handleRemoveFile} />
      </div>

      {/* MODAL DE ÉXITO */}
      <AlertMessage
        title="¡Importación exitosa!"
        description="El archivo se importó correctamente."
        variant="success"
        confirmText="Aceptar"
        cancelText=""
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
      />
    </div>
  )
}
