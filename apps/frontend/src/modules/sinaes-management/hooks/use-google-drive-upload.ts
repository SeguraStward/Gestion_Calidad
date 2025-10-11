import { useState } from 'react'
import { toast } from 'sonner'
import { googleDriveService } from '../services/google-drive.service'
import type { FolderStructure } from '../services/google-drive.service'

export interface GoogleDriveUploadOptions {
  file: File
  folderStructure: FolderStructure
  onSuccess?: (fileId: string, fileUrl: string, folderId: string) => void
  onError?: (error: Error) => void
}

export interface GoogleDriveUploadResult {
  fileId: string
  fileUrl: string
  folderId: string
  fileName: string
  fileSize: number
  mimeType: string
}

export function useGoogleDriveUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<Error | null>(null)

  const uploadToGoogleDrive = async (
    options: GoogleDriveUploadOptions
  ): Promise<GoogleDriveUploadResult | null> => {
    console.log('🚀 [useGoogleDriveUpload] Starting upload process...')
    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Step 1: Create folder structure in admin's Google Drive
      console.log('📂 [useGoogleDriveUpload] Step 1: Creating folder structure...')
      toast.info('Creando estructura de carpetas en Google Drive...')
      setUploadProgress(25)

      const folder = await googleDriveService.createFolderStructure(options.folderStructure)

      console.log('✅ [useGoogleDriveUpload] Folder created successfully:', folder)
      setUploadProgress(50)

      // Step 2: Upload file to the created folder
      console.log('📤 [useGoogleDriveUpload] Step 2: Uploading file...')
      toast.info('Subiendo archivo a Google Drive...')

      const uploadedFile = await googleDriveService.uploadFile(options.file, folder.id)

      console.log('✅ [useGoogleDriveUpload] File uploaded successfully:', uploadedFile)
      setUploadProgress(100)

      toast.success('Archivo subido exitosamente a Google Drive')

      const result: GoogleDriveUploadResult = {
        fileId: uploadedFile.id,
        fileUrl: uploadedFile.url,
        folderId: folder.id,
        fileName: uploadedFile.name,
        fileSize: uploadedFile.size,
        mimeType: uploadedFile.mimeType
      }

      options.onSuccess?.(uploadedFile.id, uploadedFile.url, folder.id)

      return result
    } catch (err: any) {
      console.error('❌ Error uploading to Google Drive:', err)

      const error = err instanceof Error ? err : new Error(err.message || 'Error desconocido')
      setError(error)

      // Check if it's an OAuth error
      if (err.message?.includes('log in with Google') || err.message?.includes('authenticated with Google')) {
        toast.error('Debes volver a iniciar sesión con Google', {
          description: 'Cierra sesión y vuelve a iniciar sesión con tu cuenta de Google para habilitar las funciones de Drive.',
          duration: 7000
        })
      } else if (err.message?.includes('Only administrators')) {
        toast.error('Solo administradores pueden subir archivos', {
          description: 'Necesitas permisos de administrador para gestionar documentos de SINAES.',
          duration: 5000
        })
      } else {
        toast.error('Error al subir archivo a Google Drive', {
          description: error.message
        })
      }

      options.onError?.(error)

      return null
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const reset = () => {
    setIsUploading(false)
    setUploadProgress(0)
    setError(null)
  }

  return {
    uploadToGoogleDrive,
    isUploading,
    uploadProgress,
    error,
    reset
  }
}
