import { create } from 'zustand'
import type { QualityEvidence } from '../types/quality-evidences.types'
import type { Dimension } from '../types/dimensions.types'
import type { Component } from '../types/components.types'
import type { Criterion } from '../types/criteria.types'
import type { Standard } from '../types/standards.types'

export interface SelectedEvidenceWithHierarchy {
  evidence: QualityEvidence
  dimension: Dimension
  component: Component
  criterion: Criterion
  standard?: Standard
  hierarchyPath: string // ej: "1.1.1.A"
}

interface DocumentAssignmentState {
  selectedEvidences: SelectedEvidenceWithHierarchy[]
  selectedCareerIds: string[]
  selectedDocumentTypeId: string | null
  uploadedFiles: File[]
  isUploading: boolean
  lastUploadResult?: any
}

interface DocumentAssignmentActions {
  addEvidence: (evidence: SelectedEvidenceWithHierarchy) => void
  removeEvidence: (evidenceId: string) => void
  toggleEvidence: (evidence: SelectedEvidenceWithHierarchy) => void
  setCareerIds: (careerIds: string[]) => void
  setSelectedDocumentTypeId: (documentTypeId: string | null) => void
  addFiles: (files: File[]) => void
  removeFile: (fileName: string) => void
  setIsUploading: (isUploading: boolean) => void
  setUploadResult: (result: any) => void
  reset: () => void

  // Computed properties
  isEvidenceSelected: (evidenceId: string) => boolean
  canSubmit: () => boolean
}

const initialState: DocumentAssignmentState = {
  selectedEvidences: [],
  selectedCareerIds: [],
  selectedDocumentTypeId: null,
  uploadedFiles: [],
  isUploading: false,
  lastUploadResult: undefined
}

export const useDocumentAssignment = create<DocumentAssignmentState & DocumentAssignmentActions>()((set, get) => ({
  ...initialState,

  addEvidence: (evidence) =>
    set((state) => ({
      selectedEvidences: [...state.selectedEvidences, evidence]
    })),

  removeEvidence: (evidenceId) =>
    set((state) => ({
      selectedEvidences: state.selectedEvidences.filter(e => e.evidence.id !== evidenceId)
    })),

  toggleEvidence: (evidence) => {
    const state = get()
    const isSelected = state.selectedEvidences.some(e => e.evidence.id === evidence.evidence.id)

    if (isSelected) {
      get().removeEvidence(evidence.evidence.id)
    } else {
      get().addEvidence(evidence)
    }
  },

  setCareerIds: (careerIds) => set({ selectedCareerIds: careerIds }),

  setSelectedDocumentTypeId: (documentTypeId) => set({ selectedDocumentTypeId: documentTypeId }),

  addFiles: (files) =>
    set((state) => ({
      uploadedFiles: [...state.uploadedFiles, ...files]
    })),

  removeFile: (fileName) =>
    set((state) => ({
      uploadedFiles: state.uploadedFiles.filter(f => f.name !== fileName)
    })),

  setIsUploading: (isUploading) => set({ isUploading }),

  setUploadResult: (result) => set({ lastUploadResult: result }),

  reset: () => set(initialState),

  // Computed properties
  isEvidenceSelected: (evidenceId) => {
    const state = get()
    return state.selectedEvidences.some(e => e.evidence.id === evidenceId)
  },

  canSubmit: () => {
    const state = get()
    return (
      state.selectedEvidences.length > 0 &&
      state.uploadedFiles.length > 0 &&
      state.selectedCareerIds.length > 0 &&
      state.selectedDocumentTypeId !== null &&
      !state.isUploading
    )
  }
}))
