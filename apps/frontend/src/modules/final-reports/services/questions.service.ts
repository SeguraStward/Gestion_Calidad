import { GenericService, createGenericHooks } from '@/services/base'
import { HttpClient } from '@/lib/http-client'
import { useQuery } from '@tanstack/react-query'
import type { PaginatedResponse } from '@/services/interfaces'
import type {
  Question,
  CreateQuestionDto,
  UpdateQuestionDto
} from '../types/question-management.types'

const API_RESOURCE_PATH = 'questions'

class QuestionService extends GenericService<Question, CreateQuestionDto, UpdateQuestionDto> {
  constructor() {
    super(API_RESOURCE_PATH)
  }

  async getByStep(
    stepNumber: number,
    reportType?: string
  ): Promise<Question[]> {
    const params = reportType ? { reportType } : undefined
    const response = await HttpClient.get<{ data: Question[], meta: any }>(`/${this.resource}/step/${stepNumber}`, {
      params
    })
    return response.data.data // Extract the data array from the paginated response
  }
}

// 1. Create an instance of the service
export const questionService = new QuestionService()

// 2. Generate generic hooks using the service instance
export const {
  useList: useQuestions,
  useOne: useQuestion,
  useCreate: useCreateQuestion,
  useUpdate: useUpdateQuestion,
  useRemove: useDeleteQuestion
} = createGenericHooks<Question, CreateQuestionDto, UpdateQuestionDto>(
  'questions',
  questionService,
  {
    messages: {
      created: (question) => `Pregunta "${question.question}" creada exitosamente.`,
      updated: (question) => `Pregunta "${question.question}" actualizada correctamente.`,
      deleted: () => 'Pregunta eliminada.'
    },
    // Delete toasts are shown by questions-management (custom messages); silence
    // the hook's remove toast so only one appears.
    silent: { remove: { success: true, error: true } }
  }
)

// 3. Default export the service instance
export default questionService

// Custom hook for getting questions by step
export function useQuestionsByStep(
  stepNumber: number,
  reportType?: string,
  options?: { enabled?: boolean }
) {
  return useQuery<Question[], Error>({
    queryKey: ['questions', 'step', stepNumber, reportType],
    queryFn: () => questionService.getByStep(stepNumber, reportType),
    enabled: options?.enabled !== undefined ? options.enabled : !!stepNumber,
    staleTime: 60_000
  })
}

// Hook for questions for forms (used in step 5 and 7 forms)
export function useQuestionsForForms(stepNumber: number, reportType: string = 'INFORME_FINAL_V1') {
  return useQuery<Question[], Error>({
    queryKey: ['questions-for-forms', stepNumber, reportType],
    queryFn: () => questionService.getByStep(stepNumber, reportType),
    staleTime: 10 * 60 * 1000, // 10 minutes for form data
  })
}
