import { GenericService, createGenericHooks } from '@/services/base'
import type {
  FullAcademicLoad,
  CreateAcademicLoadDto,
  UpdateAcademicLoadDto,
  AcademicLoadFilters
} from '../types/academic-loads.types'
import type { PaginatedResponse } from '@/services/interfaces'
import { useQuery } from '@tanstack/react-query' // <--- ADD THIS IMPORT

const API_RESOURCE_PATH = 'academic-loads'

class AcademicLoadService extends GenericService<
  FullAcademicLoad,
  CreateAcademicLoadDto,
  UpdateAcademicLoadDto,
  AcademicLoadFilters
> {
  constructor() {
    super(API_RESOURCE_PATH)
  }

  /**
   * Get all academic loads for a specific professor.
   * Supports additional filtering, pagination, includes, and ordering.
   */
  async getByProfessorId(
    professorId: string,
    filters?: Omit<AcademicLoadFilters, 'professorId'>
  ): Promise<PaginatedResponse<FullAcademicLoad>> {
    const combinedFilters: AcademicLoadFilters = {
      ...filters,
      professorId
    }
    return this.list(combinedFilters)
  }
}

export const academicLoadService = new AcademicLoadService()

export const {
  useList: useAcademicLoadsList,
  useOne: useAcademicLoad,
  useCreate: useCreateAcademicLoad,
  useUpdate: useUpdateAcademicLoad,
  useRemove: useDeleteAcademicLoad
} = createGenericHooks<FullAcademicLoad, CreateAcademicLoadDto, UpdateAcademicLoadDto, AcademicLoadFilters>(
  'academicLoads',
  academicLoadService,
  {
    messages: {
      created: (load) => `Carga académica NRC ${load.nrc} creada.`,
      updated: (load) => `Carga académica NRC ${load.nrc} actualizada.`,
      deleted: () => 'Carga académica eliminada.'
    }
  }
)

export function useAcademicLoadsByProfessor(
  professorId: string | null | undefined,
  filters?: Omit<AcademicLoadFilters, 'professorId'>,
  options?: { enabled?: boolean }
) {
  return useQuery<PaginatedResponse<FullAcademicLoad>, Error>({
    queryKey: ['academicLoads', 'professor', professorId, filters],
    queryFn: () => {
      if (!professorId) {
        return Promise.reject(new Error('Professor ID is required.'))
      }
      return academicLoadService.getByProfessorId(professorId, filters)
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!professorId,
    staleTime: 60_000
  })
}

export default academicLoadService
