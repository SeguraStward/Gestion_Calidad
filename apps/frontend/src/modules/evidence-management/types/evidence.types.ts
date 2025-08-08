export type DimensionType = {
  id: string
  code: string
  name: string
  description?: string
  order: number
}

export type ComponentType = {
  id: string
  code: string
  name: string
  description?: string
  dimensionId: string
  order: number
}

export type CriterionType = {
  id: string
  code: string
  name: string
  description?: string
  componentId: string
  order: number
}

/**
 * Representa un estándar específico dentro de un criterio.
 * Ejemplo: "Estándar 5. El 100% del personal académico deberá poseer como mínimo el grado de Licenciatura."
 */
export type StandardType = {
  id: string
  code: string // e.g., "Estándar 5"
  description: string
  criterionId: string
}

/**
 * Representa un ítem de evidencia requerido o sugerido para un criterio.
 * Ejemplo: "15. Lista de convenios existentes con instituciones parauniversitarias."
 */
export type EvidencePromptType = {
  id: string
  code: string // e.g., "15"
  description: string
  criterionId: string
}

export type EvidenceStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE'

/**
 * Representa el vínculo entre un documento de evidencia y una evidencia sugerida específica.
 * Incluye notas contextuales para ese vínculo en particular.
 */
export type EvidencePromptLink = {
  evidencePromptId: string
  notes?: string
}

// Tipos de documento posibles
export type DocumentType = 'NORMATIVA' | 'INFORME' | 'ACTA' | 'PLAN' | 'CONVENIO' | 'OTRO'

export type EvidenceType = {
  id: string
  // Reemplazamos title por estos campos más específicos
  documentType: DocumentType
  documentCode: string
  // Mantener campos existentes que aún necesitamos
  description?: string
  fileType: string
  fileSize: number
  fileName: string
  driveFileId: string
  driveFileLink: string
  driveFolderId?: string // Nuevo campo para la carpeta específica
  year: number
  month: number
  keywords: string[]
  careerIds: string[]
  status: EvidenceStatus
  createdAt: string
  updatedAt: string
  evidencePromptLinks: EvidencePromptLink[]
}

export type EvidenceFormData = {
  documentType: DocumentType
  documentCode: string
  description?: string
  year: number
  month: number
  file?: File | null
  keywords: string
  careerIds: string[]
  evidencePromptIds: string[]
  // Eliminamos el campo notes
}

export type CareerType = {
  id: string
  name: string
  code: string
  degree?: string
}