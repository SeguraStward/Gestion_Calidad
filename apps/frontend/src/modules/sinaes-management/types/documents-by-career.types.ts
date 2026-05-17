/**
 * Frontend mirror of the backend DTOs in
 * `apps/backend/src/modules/sinaes-reports/dtos/documents-by-career.dto.ts`.
 * Counts only — no compliance percentages or status semantics.
 */

export interface CareerDocumentRef {
  id: string
  code: string
  name: string
  fileUrl?: string
  fileName?: string
  createdAt?: string
}

export interface EvidenceInventory {
  id: string
  code: string
  name: string
  documentCount: number
  documents: CareerDocumentRef[]
}

export interface StandardInventory {
  id: string
  code: string
  name: string
  documentCount: number
  evidences: EvidenceInventory[]
}

export interface CriterionInventory {
  id: string
  code: string
  name: string
  documentCount: number
  directEvidences: EvidenceInventory[]
  standards: StandardInventory[]
}

export interface ComponentInventory {
  id: string
  code: string
  name: string
  documentCount: number
  criteria: CriterionInventory[]
}

export interface DimensionInventory {
  id: string
  code: string
  name: string
  documentCount: number
  components: ComponentInventory[]
}

export interface CareerGap {
  dimensionCode: string
  dimensionName: string
  componentCode: string
  componentName: string
  criterionCode: string
  criterionName: string
  standardCode?: string
  standardName?: string
  evidenceId: string
  evidenceCode: string
  evidenceName: string
}

export interface CareerInventory {
  id: string
  code: string
  name: string
  totalDocuments: number
  evidencesCovered: number
  evidencesUncovered: number
  dimensions: DimensionInventory[]
  gaps: CareerGap[]
}

export interface DocumentsByCareerSummary {
  totalCareers: number
  totalDocuments: number
  careersWithDocuments: number
  careersWithoutDocuments: number
  totalEvidences: number
}

export interface DocumentsByCareerReport {
  generatedAt: string
  generatedBy?: string
  summary: DocumentsByCareerSummary
  careers: CareerInventory[]
  filters: {
    careerIds?: string[]
    dimensionId?: string
    componentId?: string
    criterionId?: string
  }
}

export interface DocumentsByCareerFilters {
  careerIds?: string[]
  dimensionId?: string
  componentId?: string
  criterionId?: string
}
