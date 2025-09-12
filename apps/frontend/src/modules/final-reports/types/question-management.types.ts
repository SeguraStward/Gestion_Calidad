export type ResponseType = 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'SELECT' | 'MULTISELECT'
export type Status = 'ACTIVE' | 'INACTIVE'

export interface QuestionOption {
  category: string
  label: string
  value: string
}

export interface Question {
  id?: string
  groupId?: string
  module?: string
  question: string
  options?: QuestionOption[]
  responseType: ResponseType
  questionVersion?: string
  stepNumber?: number
  appliesTo?: string[]
  description?: string
  isRequired?: boolean
  order?: number
  status?: Status
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  group?: QuestionGroup
}

export interface QuestionGroup {
  id?: string
  name: string
  questionTitle: string
  description?: string
  stepNumber?: number
  appliesTo?: string[]
  order?: number
  status?: Status
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  questions?: Question[]
}

export interface CreateQuestionDto {
  groupId?: string
  module?: string
  question: string
  options?: QuestionOption[]
  responseType: ResponseType
  questionVersion?: string
  stepNumber?: number
  appliesTo?: string[]
  description?: string
  isRequired?: boolean
  order?: number
  status?: Status
}

export interface UpdateQuestionDto extends Partial<CreateQuestionDto> { }

export interface CreateQuestionGroupDto {
  name: string
  questionTitle: string
  description?: string
  stepNumber?: number
  appliesTo?: string[]
  order?: number
  status?: Status
}

export interface UpdateQuestionGroupDto extends Partial<CreateQuestionGroupDto> { }

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface QuestionGroupWithQuestions extends QuestionGroup {
  questions: Question[]
}

// Constants for report types
export const REPORT_TYPES = {
  INFORME_FINAL_V1: 'INFORME_FINAL_V1',
  INFORME_FINAL_V2: 'INFORME_FINAL_V2',
  TODOS: 'TODOS'
} as const

export type ReportType = keyof typeof REPORT_TYPES

// Constants for steps
export const FINAL_REPORT_STEPS = {
  STEP_5: 5,
  STEP_7: 7
} as const

export type FinalReportStep = typeof FINAL_REPORT_STEPS[keyof typeof FINAL_REPORT_STEPS]
