import { GenericService, createGenericHooks } from '@/services/base'
import { HttpClient } from '@/lib/http-client'
import { useQuery } from '@tanstack/react-query'
import type { PaginatedResponse } from '@/services/interfaces'
import type {
  QuestionGroup,
  QuestionGroupWithQuestions,
  CreateQuestionGroupDto,
  UpdateQuestionGroupDto
} from '../types/question-management.types'

const API_RESOURCE_PATH = 'question-groups'

class QuestionGroupService extends GenericService<QuestionGroup, CreateQuestionGroupDto, UpdateQuestionGroupDto> {
  constructor() {
    super(API_RESOURCE_PATH)
  }

  async getByStep(
    stepNumber: number,
    reportType?: string
  ): Promise<QuestionGroup[]> {
    const params = reportType ? { reportType } : undefined
    const response = await HttpClient.get<{ data: QuestionGroup[], meta: any }>(`/${this.resource}/step/${stepNumber}`, {
      params
    })
    return response.data.data // Extract the data array from the paginated response
  }

  async getWithQuestionsByStep(
    stepNumber: number,
    reportType?: string
  ): Promise<QuestionGroupWithQuestions[]> {
    const params = reportType ? { reportType } : undefined
    const response = await HttpClient.get<{ data: QuestionGroupWithQuestions[], meta: any }>(`/${this.resource}/step/${stepNumber}/with-questions`, {
      params
    })
    return response.data.data // Extract the data array from the paginated response
  }
}

// 1. Create an instance of the service
export const questionGroupService = new QuestionGroupService()

// 2. Generate generic hooks using the service instance
export const {
  useList: useQuestionGroups,
  useOne: useQuestionGroup,
  useCreate: useCreateQuestionGroup,
  useUpdate: useUpdateQuestionGroup,
  useRemove: useDeleteQuestionGroup
} = createGenericHooks<QuestionGroup, CreateQuestionGroupDto, UpdateQuestionGroupDto>(
  'question-groups',
  questionGroupService,
  {
    messages: {
      created: (group) => `Grupo de preguntas "${group.name}" creado exitosamente.`,
      updated: (group) => `Grupo de preguntas "${group.name}" actualizado correctamente.`,
      deleted: () => 'Grupo de preguntas eliminado.'
    }
  }
)

// 3. Default export the service instance
export default questionGroupService

// Custom hook for getting question groups by step
export function useQuestionGroupsByStep(
  stepNumber: number,
  reportType?: string,
  options?: { enabled?: boolean }
) {
  return useQuery<QuestionGroup[], Error>({
    queryKey: ['question-groups', 'step', stepNumber, reportType],
    queryFn: () => questionGroupService.getByStep(stepNumber, reportType),
    enabled: options?.enabled !== undefined ? options.enabled : !!stepNumber,
    staleTime: 60_000
  })
}

// Custom hook for getting question groups with questions by step
export function useQuestionGroupsWithQuestionsByStep(
  stepNumber: number,
  reportType?: string,
  options?: { enabled?: boolean }
) {
  return useQuery<QuestionGroupWithQuestions[], Error>({
    queryKey: ['question-groups-with-questions', 'step', stepNumber, reportType],
    queryFn: () => questionGroupService.getWithQuestionsByStep(stepNumber, reportType),
    enabled: options?.enabled !== undefined ? options.enabled : !!stepNumber,
    staleTime: 60_000
  })
}
