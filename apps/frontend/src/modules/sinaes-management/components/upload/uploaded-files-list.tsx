'use client'

import { useState } from 'react'
import { X, File, FileText, FileSpreadsheet, Image, Download, Upload, Check, AlertCircle } from 'lucide-react'
import { Button, Badge, ScrollArea, Progress } from '@una-gc/ui/components'
import { useDocumentAssignment } from '../../store/document-assignment.store'

interface FileWithPreview extends File {
  preview?: string
  uploadStatus?: 'pending' | 'uploading' | 'completed' | 'error'
  uploadProgress?: number
}

const getFileIcon = (file: File) => {
  const extension = file.name.split('.').pop()?.toLowerCase()

  switch (extension) {
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-500" />
    case 'doc':
    case 'docx':
      return <FileText className="h-5 w-5 text-blue-500" />
    case 'xls':
    case 'xlsx':
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />
    case 'png':
    case 'jpg':
    case 'jpeg':
      return <Image className="h-5 w-5 text-purple-500" />
    default:
      return <File className="h-5 w-5 text-gray-500" />
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'uploading':
      return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />
    case 'completed':
      return <Check className="h-4 w-4 text-green-500" />
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />
    default:
      return null
  }
}

export const UploadedFilesList = () => {
  const { uploadedFiles, removeFile, isUploading } = useDocumentAssignment()
  const [filesWithStatus, setFilesWithStatus] = useState<FileWithPreview[]>([])

  // Simular el estado de upload para la demostración
  const simulateUpload = (file: File) => {
    const fileWithStatus: FileWithPreview = {
      ...file,
      uploadStatus: 'uploading',
      uploadProgress: 0
    }

    setFilesWithStatus(prev => [...prev, fileWithStatus])

    // Simular progreso
    const interval = setInterval(() => {
      setFilesWithStatus(prev =>
        prev.map(f =>
          f.name === file.name && f.uploadStatus === 'uploading'
            ? { ...f, uploadProgress: Math.min((f.uploadProgress || 0) + 10, 100) }
            : f
        )
      )
    }, 200)

    // Completar después de 2 segundos
    setTimeout(() => {
      clearInterval(interval)
      setFilesWithStatus(prev =>
        prev.map(f =>
          f.name === file.name
            ? { ...f, uploadStatus: 'completed', uploadProgress: 100 }
            : f
        )
      )
    }, 2000)
  }

  const handleRemoveFile = (fileName: string) => {
    removeFile(fileName)
    setFilesWithStatus(prev => prev.filter(f => f.name !== fileName))
  }

  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const totalFiles = uploadedFiles.length
  const completedFiles = filesWithStatus.filter(f => f.uploadStatus === 'completed').length

  if (uploadedFiles.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay archivos seleccionados</p>
        <p className="text-xs mt-1">
          Arrastra archivos al área de carga
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Archivos Seleccionados</h3>
        <div className="flex gap-2">
          <Badge variant="outline">
            {totalFiles} archivo{totalFiles !== 1 ? 's' : ''}
          </Badge>
          {isUploading && (
            <Badge variant="secondary">
              Subiendo {completedFiles}/{totalFiles}
            </Badge>
          )}
        </div>
      </div>

      {/* Progreso global */}
      {isUploading && totalFiles > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso total</span>
            <span>{Math.round((completedFiles / totalFiles) * 100)}%</span>
          </div>
          <Progress value={(completedFiles / totalFiles) * 100} />
        </div>
      )}

      {/* Lista de archivos */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {uploadedFiles.map((file, index) => {
            const fileWithStatus = filesWithStatus.find(f => f.name === file.name)
            const status = fileWithStatus?.uploadStatus
            const progress = fileWithStatus?.uploadProgress || 0

            return (
              <div
                key={`${file.name}-${index}`}
                className="border rounded-lg p-3 space-y-2"
              >
                {/* Header del archivo */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Modificado: {new Date(file.lastModified).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {getStatusIcon(status)}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadFile(file)}
                      className="h-6 w-6 p-0"
                      title="Descargar archivo"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveFile(file.name)}
                      className="h-6 w-6 p-0"
                      title="Eliminar archivo"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Progreso individual */}
                {status === 'uploading' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Subiendo...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1" />
                  </div>
                )}

                {/* Estado completado */}
                {status === 'completed' && (
                  <div className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">Archivo listo para subir</span>
                  </div>
                )}

                {/* Estado de error */}
                {status === 'error' && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-600">Error al procesar archivo</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => simulateUpload(file)}
                      className="h-6 text-xs px-2"
                    >
                      Reintentar
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Resumen */}
      <div className="p-3 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Resumen de archivos:</p>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">Total:</span>
            <span className="ml-2 font-medium">{totalFiles} archivos</span>
          </div>
          <div>
            <span className="text-muted-foreground">Tamaño total:</span>
            <span className="ml-2 font-medium">
              {formatFileSize(uploadedFiles.reduce((acc, file) => acc + file.size, 0))}
            </span>
          </div>
        </div>

        {/* Tipos de archivo */}
        <div className="mt-2">
          <span className="text-muted-foreground text-xs">Tipos: </span>
          {Array.from(new Set(uploadedFiles.map(f => f.name.split('.').pop()?.toLowerCase())))
            .map(ext => (
              <Badge key={ext} variant="secondary" className="text-xs mr-1">
                .{ext}
              </Badge>
            ))}
        </div>
      </div>

      {/* Botón de prueba para simular upload */}
      {uploadedFiles.length > 0 && !isUploading && (
        <Button
          onClick={() => uploadedFiles.forEach(simulateUpload)}
          className="w-full"
          variant="outline"
        >
          <Upload className="h-4 w-4 mr-2" />
          Simular Proceso de Carga
        </Button>
      )}
    </div>
  )
}
