import { GenericService, createGenericHooks } from '@/services/base' // Assuming base is directly in services
import type {
  FullFinalReport, // Main entity type for single and list items
  CreateFinalReportDto, // DTO for creating
  UpdateFinalReportDto, // DTO for updating
  FinalReportFilters // Type for filtering the list
} from '../types/final-report.types' // Adjust path if your types are elsewhere
import type { PaginatedResponse } from '@/services/interfaces' // Adjust path if needed

const API_RESOURCE_PATH = 'final-reports' // The API endpoint for final reports

/**
 * Service class for managing Final Reports.
 * It extends the GenericService to provide common CRUD operations.
 */
class FinalReportService extends GenericService<
  FullFinalReport, // T: Type for a single item (get by ID) and list items
  CreateFinalReportDto, // CreateDTO: Type for creating an item
  UpdateFinalReportDto, // UpdateDTO: Type for updating an item
  FinalReportFilters // Filters: Type for list filters
> {
  constructor() {
    super(API_RESOURCE_PATH) // Pass the resource path to the base class
  }

  // --- Specific methods for FinalReportService can be added here if needed ---

  /**
   * Example: Get all final reports for a specific professor.
   * This assumes your backend supports filtering by 'professorId' via the list endpoint.
   */
  async getByProfessorId(professorId: string, filters?: Omit<FinalReportFilters, 'professorId'>): Promise<FullFinalReport[]> {
    // The list method from GenericService returns PaginatedResponse<FullFinalReport>
    const response = await this.list({ ...filters, professorId })
    return response.data // Return just the data array
  }

  /**
   * Example: Get a final report by its associated AcademicLoad ID.
   * This assumes your backend supports fetching/filtering by 'academicLoadId'.
   */
  async getByAcademicLoadId(academicLoadId: string): Promise<FullFinalReport | null> {
    const response = await this.list({ academicLoadId, limit: 1 } as FinalReportFilters)
    return response.data.length > 0 ? response.data[0] : null
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
