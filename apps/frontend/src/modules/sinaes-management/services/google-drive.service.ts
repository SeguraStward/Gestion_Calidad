import { HttpClient } from '@/lib/http-client'

export interface DriveFolder {
  id: string
  name: string
  path: string
  level: number
  entityType: string
  parentId?: string
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
  dimensionId: string
  componentId?: string
  criterionId?: string
  standardId?: string
  evidenceId?: string
  careerCode: string
}

class GoogleDriveService {
  private basePath = '/google-drive'

  async createFolderStructure(structure: FolderStructure): Promise<DriveFolder> {
    const response = await HttpClient.post(`${this.basePath}/create-structure`, structure)
    return response.data
  }

  async uploadFile(file: File, folderId: string): Promise<DriveFile> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folderId', folderId)

    const response = await HttpClient.post(`${this.basePath}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
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