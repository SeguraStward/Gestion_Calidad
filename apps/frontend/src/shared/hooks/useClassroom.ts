import { createGenericHooks } from '@/services/base/generic.hooks'
import { classroomService } from '@/modules/academic-management/academic-maintenance/services/classroom.service'
import { ClassroomWithRelations, CreateClassroomInput } from '@/shared/types/classroom'
import { GenericService } from '@/services/base/generic.service'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'

export interface ClassroomFilters {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  capacity?: number
}

export const {
  useList: useListClassroomsPaginated,
  useOne: useOneClassroom,
  useCreate: useCreateClassroom,
  useUpdate: useUpdateClassroom,
  useRemove: useRemoveClassroom
} = createGenericHooks<ClassroomWithRelations, CreateClassroomInput, Partial<CreateClassroomInput>, ClassroomFilters>(
  'classrooms',
  classroomService as GenericService<
    ClassroomWithRelations,
    CreateClassroomInput,
    Partial<CreateClassroomInput>,
    ClassroomFilters
  >,
  {
    messages: {
      created: () => 'Aula creada exitosamente',
      updated: () => 'Aula actualizada exitosamente',
      deleted: () => 'Aula eliminada exitosamente'
    }
  }
)

// Hook personalizado que siempre devuelve un array plano de aulas
export function useListClassroomsFlat(
  filters?: Omit<ClassroomFilters, 'page' | 'limit'>,
  options?: Omit<UseQueryOptions<ClassroomWithRelations[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ClassroomWithRelations[], Error, ClassroomWithRelations[]>({
    queryKey: ['classrooms-flat', filters],
    queryFn: async () => {
      const response = await classroomService.list({ ...filters, limit: 1000 })
      const data = response as any
      if (Array.isArray(data)) {
        return data
      }
      if (data && Array.isArray(data.items)) {
        return data.items
      }
      if (data && Array.isArray(data.data)) {
        return data.data
      }
      console.warn('❌ No se pudo extraer la lista de aulas (flat):', data)
      return []
    },
    select: (data: any) => {
      if (!Array.isArray(data)) {
        console.warn('useListClassroomsFlat (flat): data no es un array', data)
        return []
      }
      return data.map((classroom: any) => ({
        ...classroom,
        id: classroom.id || (classroom as any)._id,
        campus: classroom.campus || null
      }))
    },
    staleTime: 60_000,
    ...options
  })
}

export function useClassroom() {
  return useQuery({
    queryKey: ['classrooms', { status: 'ACTIVE', limit: 1000 }],
    queryFn: () => classroomService.list({ status: 'ACTIVE', limit: 1000 }).then((res) => res.data),
    staleTime: 600_000, // 10 minutos
    select: (data) => {
      console.log('AULAS DESDE API:', data)
      return data
        .filter((classroom) => classroom && classroom.id && classroom.roomNumber)
        .map((classroom) => ({
          id: String(classroom.id),
          name: classroom.roomNumber
        }))
    }
  })
}
