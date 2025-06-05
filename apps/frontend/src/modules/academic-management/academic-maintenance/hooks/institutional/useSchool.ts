import { useQuery } from '@tanstack/react-query'
import { createGenericHooks } from '../../../../../services/base/generic.hooks'
import { schoolService } from '../../services/institutional/school.service'
import { SchoolWithRelations, CreateSchoolInput } from '../../types/institutional/school'

export interface SchoolFilters {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

const baseHooks = createGenericHooks<SchoolWithRelations, CreateSchoolInput, Partial<CreateSchoolInput>, SchoolFilters>(
  'schools',
  schoolService,
  {
    messages: {
      created: () => 'Escuela creada exitosamente',
      updated: () => 'Escuela actualizada exitosamente',
      deleted: () => 'Escuela eliminada exitosamente'
    }
  }
)

export const useListSchoolsPaginated = baseHooks.useList
export const useOneSchool = baseHooks.useOne
export const useCreateSchool = baseHooks.useCreate
export const useUpdateSchool = baseHooks.useUpdate
export const useRemoveSchool = baseHooks.useRemove

// Hook para obtener todas las escuelas (lista plana)
export const useListSchools = (filters?: Omit<SchoolFilters, 'page' | 'limit'>) => {
  return useQuery<SchoolWithRelations[], Error>({
    queryKey: ['schools', 'list', filters],
    queryFn: async () => {
      const response = await schoolService.list(filters)
      console.log('[useListSchools] Raw response from schoolService.list:', response) // Log the raw response

      // Case 1: response is directly the array of schools
      if (Array.isArray(response)) {
        console.log('[useListSchools] Extracted schools directly from response array.')
        return response
      }

      // Case 2: response is an object containing a 'data' property with the array
      // Ensure response is not null and is an object before checking hasOwnProperty
      if (response && typeof response === 'object' && response.hasOwnProperty('data') && Array.isArray(response.data)) {
        console.log('[useListSchools] Extracted schools from response.data.')
        return response.data
      }

      // Case 3: response is an object containing an 'items' property with the array
      // Ensure response is not null and is an object before checking hasOwnProperty
      if (
        response &&
        typeof response === 'object' &&
        response.hasOwnProperty('items') &&
        Array.isArray((response as any).items)
      ) {
        console.log('[useListSchools] Extracted schools from response.items.')
        return (response as any).items
      }

      // If none of the above, the structure is unexpected or data is not in a recognized format
      console.warn(
        '❌ [useListSchools] Could not extract school list from response. Unexpected structure or empty response:',
        response
      )
      return [] // Return empty array if data cannot be extracted
    },
    select: (data) => {
      if (!Array.isArray(data)) {
        console.warn('[useListSchools] select: input data is not an array:', data)
        return []
      }
      console.log('[useListSchools] select: Processing raw data for select:', JSON.parse(JSON.stringify(data))) // Log data before mapping
      return data.map((school, index) => {
        // Log each school object being processed, specifically its name
        console.log(`[useListSchools] select: School[${index}] raw:`, JSON.parse(JSON.stringify(school)), `Name: ${school.name}`)
        return {
          ...school,
          id: school.id || (school as any)._id, // Handle _id
          faculty: school.faculty || null, // Ensure faculty object or null
          courses: school.courses || [], // Ensure courses array
          career: school.career || [] // Ensure career array
        }
      })
    },
    staleTime: 60_000
  })
}
