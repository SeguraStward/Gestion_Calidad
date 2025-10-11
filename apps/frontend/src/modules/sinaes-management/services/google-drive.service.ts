import { HttpClient } from '@/lib/http-client'

export interface DriveFolder {
  id: string
  name: string
  path: string
  level: number
  rootFolderId?: string
}

export interface DriveFile {
  id: string
  name: string
  url: string
  folderId: string
  size: number
  mimeType: string
}

export interface FolderStructure {
  dimensionCode: string
  dimensionName: string
  componentCode: string
  componentName: string
  criterionCode: string
  criterionName: string
  standardCode: string
  standardName: string
  evidenceCode: string
  evidenceName: string
  careerCode: string
  careerName: string
}

class GoogleDriveService {
  private basePath = '/google-drive'

  /**
   * Creates folder structure in admin's Google Drive
   * Requires user to be admin and authenticated with Google
   */
  async createFolderStructure(structure: FolderStructure): Promise<DriveFolder> {
    try {
      console.log('🔵 [GoogleDriveService] Creating folder structure:', structure)
      const response = await HttpClient.post(`${this.basePath}/create-structure`, structure)
      console.log('✅ [GoogleDriveService] Folder structure created:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ [GoogleDriveService] Error creating folder structure:', error)
      console.error('❌ [GoogleDriveService] Error response:', error.response)
      if (error.response?.status === 401) {
        throw new Error(error.response?.data?.message || 'You must be logged in with Google to use this feature. Please log out and log in again with Google.')
      }
      throw error
    }
  }

  /**
   * Uploads file to admin's Google Drive
   * Requires user to be admin and authenticated with Google
   */
  async uploadFile(file: File, folderId: string): Promise<DriveFile> {
    try {
      console.log('🔵 [GoogleDriveService] Uploading file:', { fileName: file.name, size: file.size, folderId })
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folderId', folderId)

      const response = await HttpClient.post(`${this.basePath}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      console.log('✅ [GoogleDriveService] File uploaded:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ [GoogleDriveService] Error uploading file:', error)
      console.error('❌ [GoogleDriveService] Error response:', error.response)
      if (error.response?.status === 401) {
        throw new Error(error.response?.data?.message || 'You must be logged in with Google to use this feature. Please log out and log in again with Google.')
      }
      throw error
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    await HttpClient.delete(`${this.basePath}/files/${fileId}`)
  }

  async getFolderFiles(folderId: string): Promise<DriveFile[]> {
    const response = await HttpClient.get(`${this.basePath}/folders/${folderId}/files`)
    return response.data
  }

  async getPublicUrl(fileId: string): Promise<string> {
    const response = await HttpClient.get(`${this.basePath}/files/${fileId}/public-url`)
    return response.data.url
  }
}

export const googleDriveService = new GoogleDriveService()