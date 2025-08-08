'use client'

import { useQuery, useMutation, UseQueryOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import { EvidenceType, EvidenceFormData } from '../types/evidence.types'
import { dimensionsMock } from '../mocks/dimensions'
import { componentsMock } from '../mocks/components'
import { criteriaMock } from '../mocks/criteria'
import { evidencesMock } from '../mocks/evidences'
import { careersMock } from '../mocks/careers'

// Simulate API calls with mock data
const fetchEvidences = async (): Promise<EvidenceType[]> => {
  // Simulating network delay
  await new Promise(resolve => setTimeout(resolve, 500))
  return evidencesMock
}

const fetchEvidenceById = async (id: string): Promise<EvidenceType | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 300))
  return evidencesMock.find(ev => ev.id === id)
}

const fetchDimensions = async () => {
  await new Promise(resolve => setTimeout(resolve, 200))
  return dimensionsMock
}

const fetchComponents = async (dimensionId?: string) => {
  await new Promise(resolve => setTimeout(resolve, 200))
  if (dimensionId) {
    return componentsMock.filter(comp => comp.dimensionId === dimensionId)
  }
  return componentsMock
}

const fetchCriteria = async (componentId?: string) => {
  await new Promise(resolve => setTimeout(resolve, 200))
  if (componentId) {
    return criteriaMock.filter(crit => crit.componentId === componentId)
  }
  return criteriaMock
}

const fetchCareers = async () => {
  await new Promise(resolve => setTimeout(resolve, 200))
  return careersMock
}

// Simulated file upload
const uploadEvidence = async (data: EvidenceFormData): Promise<EvidenceType> => {
  // Simulating network delay and file upload
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Create a new mock evidence
  const newEvidence: EvidenceType = {
    id: `ev${Math.floor(Math.random() * 10000)}`,
    title: data.title,
    description: data.description,
    fileType: data.file?.type || 'application/pdf',
    fileSize: data.file?.size || 1000000,
    fileName: data.file?.name || 'documento.pdf',
    driveFileId: `drive-${Math.floor(Math.random() * 1000000)}`,
    driveFileLink: `https://drive.google.com/file/d/${Math.floor(Math.random() * 1000000)}/view`,
    year: data.year,
    month: data.month,
    keywords: data.keywords.split(',').map(k => k.trim()),
    careerIds: data.careerIds,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    criteria: data.criteriaIds.map(criterionId => ({
      criterionId,
      notes: data.notes
    }))
  }
  
  return newEvidence
}

const updateEvidence = async (id: string, data: EvidenceFormData): Promise<EvidenceType> => {
  // Simulating network delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const existingEvidence = evidencesMock.find(ev => ev.id === id)
  if (!existingEvidence) {
    throw new Error('Evidencia no encontrada')
  }
  
  // Update the evidence
  const updatedEvidence: EvidenceType = {
    ...existingEvidence,
    title: data.title,
    description: data.description,
    year: data.year,
    month: data.month,
    keywords: data.keywords.split(',').map(k => k.trim()),
    careerIds: data.careerIds,
    updatedAt: new Date().toISOString(),
    criteria: data.criteriaIds.map(criterionId => {
      const existingCriterion = existingEvidence.criteria.find(c => c.criterionId === criterionId)
      return {
        criterionId,
        notes: data.notes || existingCriterion?.notes
      }
    })
  }
  
  // If a new file was uploaded, update file-related fields
  if (data.file) {
    updatedEvidence.fileType = data.file.type
    updatedEvidence.fileSize = data.file.size
    updatedEvidence.fileName = data.file.name
    updatedEvidence.driveFileId = `drive-${Math.floor(Math.random() * 1000000)}`
    updatedEvidence.driveFileLink = `https://drive.google.com/file/d/${Math.floor(Math.random() * 1000000)}/view`
  }
  
  return updatedEvidence
}

const deleteEvidence = async (id: string): Promise<void> => {
  // Simulating network delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const evidenceIndex = evidencesMock.findIndex(ev => ev.id === id)
  if (evidenceIndex === -1) {
    throw new Error('Evidencia no encontrada')
  }
  
  // In a real application, you would delete from the server
  // Here we'll just return success
}

// React Query hooks
export function useEvidences(options?: UseQueryOptions<EvidenceType[]>) {
  return useQuery({
    queryKey: ['evidences'],
    queryFn: fetchEvidences,
    ...options
  })
}

export function useEvidence(id: string, options?: UseQueryOptions<EvidenceType | undefined>) {
  return useQuery({
    queryKey: ['evidence', id],
    queryFn: () => fetchEvidenceById(id),
    ...options
  })
}

export function useDimensions(options?: UseQueryOptions<typeof dimensionsMock>) {
  return useQuery({
    queryKey: ['dimensions'],
    queryFn: fetchDimensions,
    ...options
  })
}

export function useComponents(dimensionId?: string, options?: UseQueryOptions<typeof componentsMock>) {
  return useQuery({
    queryKey: ['components', dimensionId],
    queryFn: () => fetchComponents(dimensionId),
    ...options
  })
}

export function useCriteria(componentId?: string, options?: UseQueryOptions<typeof criteriaMock>) {
  return useQuery({
    queryKey: ['criteria', componentId],
    queryFn: () => fetchCriteria(componentId),
    ...options
  })
}

export function useCareers(options?: UseQueryOptions<typeof careersMock>) {
  return useQuery({
    queryKey: ['careers'],
    queryFn: fetchCareers,
    ...options
  })
}

export function useUploadEvidence() {
  return useMutation({
    mutationFn: uploadEvidence,
    onSuccess: () => {
      toast.success('Evidencia subida exitosamente')
    },
    onError: (error) => {
      toast.error(`Error al subir evidencia: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  })
}

export function useUpdateEvidence() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EvidenceFormData }) => updateEvidence(id, data),
    onSuccess: () => {
      toast.success('Evidencia actualizada exitosamente')
    },
    onError: (error) => {
      toast.error(`Error al actualizar evidencia: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  })
}

export function useDeleteEvidence() {
  return useMutation({
    mutationFn: deleteEvidence,
    onSuccess: () => {
      toast.success('Evidencia eliminada exitosamente')
    },
    onError: (error) => {
      toast.error(`Error al eliminar evidencia: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  })
}