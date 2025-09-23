import { create } from 'zustand'
import type { Dimension } from '../types/dimensions.types'
import type { Component } from '../types/components.types'
import type { Criterion } from '../types/criteria.types'
import type { Standard } from '../types/standards.types'
import type { QualityEvidence } from '../types/quality-evidences.types'

interface SinaesNavigationState {
  selectedDimension: Dimension | null
  selectedComponent: Component | null
  selectedCriterion: Criterion | null
  selectedStandard: Standard | null
  selectedQualityEvidence: QualityEvidence | null
}

interface SinaesNavigationActions {
  selectDimension: (dimension: Dimension | null) => void
  selectComponent: (component: Component | null) => void
  selectCriterion: (criterion: Criterion | null) => void
  selectStandard: (standard: Standard | null) => void
  selectQualityEvidence: (evidence: QualityEvidence | null) => void
  reset: () => void
}

const initialState: SinaesNavigationState = {
  selectedDimension: null,
  selectedComponent: null,
  selectedCriterion: null,
  selectedStandard: null,
  selectedQualityEvidence: null
}

export const useSinaesNavigation = create<SinaesNavigationState & SinaesNavigationActions>()((set) => ({
  ...initialState,
  selectDimension: (dimension) =>
    set({
      selectedDimension: dimension,
      selectedComponent: null,
      selectedCriterion: null,
      selectedStandard: null,
      selectedQualityEvidence: null
    }),
  selectComponent: (component) =>
    set((state) => ({
      ...state,
      selectedComponent: component,
      selectedCriterion: null,
      selectedStandard: null,
      selectedQualityEvidence: null
    })),
  selectCriterion: (criterion) =>
    set((state) => ({
      ...state,
      selectedCriterion: criterion,
      selectedStandard: null,
      selectedQualityEvidence: null
    })),
  selectStandard: (standard) =>
    set((state) => ({
      ...state,
      selectedStandard: standard,
      selectedQualityEvidence: null
    })),
  selectQualityEvidence: (evidence) =>
    set((state) => ({
      ...state,
      selectedQualityEvidence: evidence
    })),
  reset: () => set(initialState)
}))
