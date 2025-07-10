'use client'

import { showErrorAlert, showSuccessAlert } from '@/lib/alert'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Input } from '@una-gc/ui/components/input'
import { Label } from '@una-gc/ui/components/label'
import { Progress } from '@una-gc/ui/components/progress'
import { RadioGroup, RadioGroupItem } from '@una-gc/ui/components/radio-group'
import { Download, FileDown, FileSpreadsheet, Loader2, Upload } from 'lucide-react'
import { memo, useCallback, useState } from 'react'

import FileDisplay from './file-display'
import { DEFAULT_ALLOWED_TYPES, DEFAULT_LABELS, DEFAULT_MAX_FILE_SIZE, ExcelDataManagerProps } from './types'
import { useExcelImport } from './useExcelImport'

const ExcelDataManager = memo(
  ({
    // Default props
    title = 'Datos Excel',
    description = 'Gestión de datos',
    importExcel,
    exportExcel,
    downloadTemplate,
    isImporting = false,
    isExporting = false,
    refetch,
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    allowedFileTypes = DEFAULT_ALLOWED_TYPES,
    labels = DEFAULT_LABELS
  }: ExcelDataManagerProps) => {
    const { fileInfo, importMode, progress, isProcessing, fileInputRef, handleFileChange, handleImport, setImportMode } =
      useExcelImport({
        importExcel,
        refetch: refetch ?? (() => {}),
        allowedFileTypes,
        maxFileSize
      })

    // Local loading states for better concurrency control
    const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false)
    const [isExportingData, setIsExportingData] = useState(false)

    // Template download with concurrency control
    const handleTemplateDownload = useCallback(async () => {
      if (isProcessing || isDownloadingTemplate) return

      try {
        setIsDownloadingTemplate(true)
        await downloadTemplate()
        showSuccessAlert('Plantilla descargada correctamente')
      } catch (error) {
        console.error('Template download error:', error)
        showErrorAlert('Error al descargar la plantilla. Por favor, intente nuevamente.')
      } finally {
        setIsDownloadingTemplate(false)
      }
    }, [isProcessing, isDownloadingTemplate, downloadTemplate])

    // Export data with better concurrency control
    const handleExportData = useCallback(async () => {
      if (isProcessing || isExporting || isExportingData) return

      try {
        setIsExportingData(true)
        await exportExcel()
        showSuccessAlert('Datos exportados correctamente')
      } catch (error) {
        console.error('Export error:', error)
        showErrorAlert('Error al exportar datos. Por favor, intente nuevamente.')
      } finally {
        setIsExportingData(false)
      }
    }, [isProcessing, isExporting, isExportingData, exportExcel])

    // Derived state for button disabled conditions
    const isTemplateButtonDisabled = isProcessing || isDownloadingTemplate
    const isExportButtonDisabled = isProcessing || isExporting || isExportingData
    const isImportButtonDisabled = !fileInfo || isProcessing || isImporting

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSpreadsheet className="mr-2 h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Import Section */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Upload className="mr-2 h-4 w-4" />
              <h3 className="text-sm font-medium">{labels.importSection}</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excel-file">{labels.selectFile}</Label>
              <Input
                id="excel-file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx,.xls,.csv"
                disabled={isImportButtonDisabled}
              />
              <FileDisplay fileInfo={fileInfo} />
            </div>

            <div className="space-y-2">
              <Label>Modo de importación</Label>
              <RadioGroup
                value={importMode}
                onValueChange={(value) => setImportMode(value as any)}
                className="flex flex-col md:flex-row gap-4"
              >
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="create" id="create" disabled={isImportButtonDisabled} />
                  <div>
                    <Label htmlFor="create" className="cursor-pointer">
                      {labels.createMode}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Crea nuevos registros sin tener en cuenta los IDs existentes. Use esta opción para agregar datos
                      completamente nuevos.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="update" id="update" disabled={isImportButtonDisabled} />
                  <div>
                    <Label htmlFor="update" className="cursor-pointer">
                      {labels.updateMode}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Actualiza registros existentes según su ID. El archivo debe contener IDs válidos para los registros a
                      modificar.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {progress > 0 && (
              <div className="space-y-1">
                <Progress value={progress} />
                <p className="text-xs text-right text-muted-foreground">{Math.round(progress)}%</p>
              </div>
            )}

            <Button onClick={handleImport} disabled={isImportButtonDisabled} className="w-full">
              {isImporting || isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {labels.processingText}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {labels.importButton}
                </>
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-muted"></div>
            <span className="flex-shrink mx-4 text-xs text-muted-foreground">{labels.dividerText}</span>
            <div className="flex-grow border-t border-muted"></div>
          </div>

          {/* Export Section */}
          <div className="space-y-4">
            <div className="flex items-center">
              <FileDown className="mr-2 h-4 w-4" />
              <h3 className="text-sm font-medium">{labels.exportSection}</h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {/* Template Download Button */}
              <Button
                variant="outline"
                onClick={handleTemplateDownload}
                disabled={isTemplateButtonDisabled}
                className="flex-1 justify-center whitespace-nowrap overflow-hidden text-ellipsis"
              >
                {isDownloadingTemplate ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
                ) : (
                  <Download className="mr-2 h-4 w-4 shrink-0" />
                )}
                <span className="overflow-hidden text-ellipsis">
                  {isDownloadingTemplate ? labels.processingText : labels.templateButton}
                </span>
              </Button>

              {/* Data Export Button */}
              <Button
                variant="outline"
                onClick={handleExportData}
                disabled={isExportButtonDisabled}
                className="flex-1 justify-center whitespace-nowrap overflow-hidden text-ellipsis"
              >
                {isExporting || isExportingData ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
                ) : (
                  <FileDown className="mr-2 h-4 w-4 shrink-0" />
                )}
                <span className="overflow-hidden text-ellipsis">
                  {isExporting || isExportingData ? labels.exportingText : labels.exportButton}
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)

ExcelDataManager.displayName = 'ExcelDataManager'

export default ExcelDataManager

// Re-export para facilitar importaciones
export * from './types'
