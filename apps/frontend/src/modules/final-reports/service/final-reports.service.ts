import { GenericService, createGenericHooks } from '@/services/base' // Assuming base is directly in services
import { HttpClient } from '@/lib/http-client'
import { useQuery } from '@tanstack/react-query'
import type { PaginatedResponse } from '@/services/interfaces'
import type {
  FullFinalReport,
  FinalReportFilters,
  CreateFinalReportDto,
  UpdateFinalReportDto
} from '../types/final-reports.types'
const API_RESOURCE_PATH = 'final-reports'

class FinalReportService extends GenericService<FullFinalReport, CreateFinalReportDto, UpdateFinalReportDto, FinalReportFilters> {
  constructor() {
    super(API_RESOURCE_PATH)
  }

  async getByProfessorId(
    professorId: string,
    filters?: Omit<FinalReportFilters, 'professorId'>
  ): Promise<PaginatedResponse<FullFinalReport>> {
    // Use the specific professor endpoint to get the search functionality
    const response = await HttpClient.get<PaginatedResponse<FullFinalReport>>(
      `/${this.resource}/professor/${professorId}`,
      { params: filters }
    )
    return response.data
  }

  /**
   * Example: Get a final report by its associated AcademicLoad ID.
   * This assumes your backend supports fetching/filtering by 'academicLoadId'.
   */
  async getByAcademicLoadId(academicLoadId: string): Promise<FullFinalReport | null> {
    const response = await this.list({ academicLoadId, limit: 1 } as FinalReportFilters)
    // response is PaginatedResponse<FullFinalReport>
    if (response.data && response.data.length > 0) {
      const report = response.data[0]
      return report === undefined ? null : report
    }
    return null
  }

  // If you had a specific endpoint for "form data" as discussed before:
  // async getFormDataForEdit(id: string): Promise<FinalReportFormData> { // Assuming FinalReportFormData type exists
  //   const response = await HttpClient.get(`/${this.resource}/${id}/form-data`);
  //   return this.extractData(response.data) as FinalReportFormData;
  // }
}

// 1. Create an instance of the service
export const finalReportService = new FinalReportService()

// 2. Generate generic hooks using the service instance
// The first argument to createGenericHooks is the query key prefix.
// The useList hook will return PaginatedResponse<FullFinalReport>.
export const {
  useList: useFinalReports, // Hook to get a paginated list of final reports
  useOne: useFinalReport, // Hook to get a single final report by ID
  useCreate: useCreateFinalReport, // Hook to create a new final report
  useUpdate: useUpdateFinalReport, // Hook to update an existing final report
  useRemove: useDeleteFinalReport // Hook to delete a final report
} = createGenericHooks<
  FullFinalReport, // T (type for single item and list items from GenericService)
  CreateFinalReportDto,
  UpdateFinalReportDto,
  FinalReportFilters
>(
  'finalReports', // Query key prefix (e.g., 'finalReports' or 'final-reports')
  finalReportService,
  {
    messages: {
      // Optional custom messages for toast notifications
      created: (report) => `Informe final para NRC ${report.academicLoad?.nrc || ''} creado exitosamente.`,
      updated: (report) => `Informe final para NRC ${report.academicLoad?.nrc || ''} actualizado correctamente.`,
      deleted: () => 'Informe final eliminado.'
    }
  }
)

// 3. Default export the service instance (matching the pattern)
export default finalReportService

export function useFinalReportsByProfessor(
  professorId: string | null | undefined,
  filters?: Omit<FinalReportFilters, 'professorId'>,
  options?: { enabled?: boolean }
) {
  return useQuery<PaginatedResponse<FullFinalReport>, Error>({
    // This type now matches the queryFn's return
    queryKey: ['finalReports', 'professor', professorId, filters],
    queryFn: () => {
      if (!professorId) {
        return Promise.reject(new Error('Professor ID is required.'))
      }
      // finalReportService.getByProfessorId now returns Promise<PaginatedResponse<FullFinalReport>>
      return finalReportService.getByProfessorId(professorId, filters)
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!professorId,
    staleTime: 60_000
  })
}
