import { GenericService } from '@/services/base/generic.service'
import { createGenericHooks } from '@/services/base/generic.hooks'
import { googleDriveService } from './google-drive.service'
import { careerProofDocumentService } from './career-proof-documents.service'

export interface ProofDocumentWithUpload {
  name: string
  description?: string
  evidenceId: string
  proofDocumentTypeId: string
  careerIds: string[]
  file: File
  // Metadatos para estructura de carpetas
  dimensionId: string
  componentId?: string
  criterionId?: string
  standardId?: string
}

export interface ProofDocument {
  id: string
  code: string
  name: string
  description?: string
  fileUrl: string
  fileName: string
  fileType: string
  fileSize?: number
  evidenceId: string
  proofDocumentTypeId: string
  googleDriveFileId?: string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
}

class ProofDocumentService extends GenericService<ProofDocument, ProofDocumentWithUpload> {
  constructor() {
    super('proof-documents')
  }

  async createWithFile(data: ProofDocumentWithUpload & {
    dimension: { code: string; name: string }
    component: { code: string; name: string }
    criterion: { code: string; name: string }
    standard: { code: string; name: string }
    evidence: { code: string; name: string }
    career: { code: string; name: string }
  }): Promise<ProofDocument> {
    try {
      // 1. Crear estructura de carpetas en Google Drive
      const folderStructure = await googleDriveService.createFolderStructure({
        dimensionCode: data.dimension.code,
        dimensionName: data.dimension.name,
        componentCode: data.component.code,
        componentName: data.component.name,
        criterionCode: data.criterion.code,
        criterionName: data.criterion.name,
        standardCode: data.standard.code,
        standardName: data.standard.name,
        evidenceCode: data.evidence.code,
        evidenceName: data.evidence.name,
        careerCode: data.career.code,
        careerName: data.career.name
      })

      // 2. Subir archivo a Google Drive
      const uploadedFile = await googleDriveService.uploadFile(data.file, folderStructure.id)

      // 3. Crear documento en BD con metadatos
      const proofDocument = await this.create({
        name: data.name,
        description: data.description,
        evidenceId: data.evidenceId,
        proofDocumentTypeId: data.proofDocumentTypeId,
        fileUrl: uploadedFile.url,
        fileName: uploadedFile.name,
        fileType: data.file.type,
        fileSize: data.file.size,
        googleDriveFileId: uploadedFile.id,
        googleDriveFolderId: folderStructure.id
      } as any)

      // 4. Asociar con carreras
      for (const careerId of data.careerIds) {
        await careerProofDocumentService.create({
          careerId,
          proofDocumentId: proofDocument.id
        })
      }

      return proofDocument
    } catch (error) {
      console.error('Error creating proof document:', error)
      throw error
    }
  }

  async deleteWithFile(id: string): Promise<void> {
    try {
      // 1. Obtener documento (TODO: implementar método)
      // const document = await this.findOne(id)

      // 2. Eliminar archivo de Google Drive (TODO: implementar)
      // if (document.googleDriveFileId) {
      //   await googleDriveService.deleteFile(document.googleDriveFileId)
      // }

      // 3. Eliminar asociaciones con carreras
      // TODO: Implementar endpoint para eliminar por documentId

      // 4. Eliminar documento de BD
      await this.remove(id)
    } catch (error) {
      console.error('Error deleting proof document:', error)
      throw error
    }
  }
}

export const proofDocumentService = new ProofDocumentService()

export const {
  useList: useProofDocuments,
  useOne: useProofDocument,
  useCreate: useCreateProofDocument,
  useUpdate: useUpdateProofDocument,
  useRemove: useDeleteProofDocument
} = createGenericHooks('proof-documents', proofDocumentService, {
  messages: {
    created: () => 'Documento probatorio creado con éxito',
    updated: () => 'Documento probatorio actualizado con éxito',
    deleted: () => 'Documento probatorio eliminado con éxito'
  }
})