'use client'

import { useRef, DragEvent, ChangeEvent } from 'react'
import { Button } from '@una-gc/ui/components'
import { Upload, FileText } from 'lucide-react'
import { useDocumentAssignment } from '../../store/document-assignment.store'

export const FileUploadArea = () => {
  const { addFiles } = useDocumentAssignment()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    addFiles(files)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    addFiles(files)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const acceptedTypes = '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg'

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleClick}
      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/5"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="space-y-3">
        <FileText className="h-8 w-8 mx-auto text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-medium">Arrastra archivos aquí</p>
          <p className="text-xs text-muted-foreground">
            o haz clic para seleccionar
          </p>
        </div>
        <Button size="sm" variant="outline" type="button">
          <Upload className="h-4 w-4 mr-2" />
          Seleccionar Archivos
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        Formatos: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG
      </p>
    </div>
  )
}
