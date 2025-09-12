'use client'

import { useQuery } from '@tanstack/react-query'
import { questionService, questionGroupService } from '../services'
import type { Question, QuestionGroup } from '../types/question-management.types'

export interface QuestionsByStepData {
  groups: QuestionGroup[]
  questions: Question[]
  groupedQuestions: Record<string, Question[]>
}

export function useQuestionsByStep(stepNumber: number, reportType?: string) {
  return useQuery({
    queryKey: ['questions-by-step', stepNumber, reportType],
    queryFn: async (): Promise<QuestionsByStepData> => {
      // Obtener grupos y preguntas para el paso específico
      const [groups, questions] = await Promise.all([
        questionGroupService.getQuestionGroupsByStep(stepNumber),
        questionService.getQuestionsByStep(stepNumber)
      ])

      // Filtrar por tipo de informe si se especifica
      const filteredGroups = reportType && reportType !== 'TODOS'
        ? groups.filter((group: QuestionGroup) =>
          group.appliesTo?.includes(reportType) || group.appliesTo?.includes('TODOS')
        )
        : groups

      const filteredQuestions = reportType && reportType !== 'TODOS'
        ? questions.filter((question: Question) =>
          question.appliesTo?.includes(reportType) || question.appliesTo?.includes('TODOS')
        )
        : questions

      // Agrupar preguntas por grupo
      const groupedQuestions: Record<string, Question[]> = {}

      // Inicializar grupos vacíos
      filteredGroups.forEach((group: QuestionGroup) => {
        if (group.id) {
          groupedQuestions[group.id] = []
        }
      })

      // Agregar preguntas sin grupo
      groupedQuestions['ungrouped'] = []

      // Distribuir preguntas en grupos
      filteredQuestions.forEach((question: Question) => {
        if (question.groupId && groupedQuestions[question.groupId]) {
          groupedQuestions[question.groupId]?.push(question)
        } else {
          groupedQuestions['ungrouped']?.push(question)
        }
      })

      // Ordenar grupos y preguntas por el campo order
      const sortedGroups = filteredGroups.sort((a: QuestionGroup, b: QuestionGroup) => (a.order || 0) - (b.order || 0))

      Object.keys(groupedQuestions).forEach(groupId => {
        if (groupedQuestions[groupId]) {
          groupedQuestions[groupId].sort((a: Question, b: Question) => (a.order || 0) - (b.order || 0))
        }
      })

      return {
        groups: sortedGroups,
        questions: filteredQuestions,
        groupedQuestions
      }
    },
    enabled: !!stepNumber
  })
}

export function useAllQuestionsByStep() {
  const step5Data = useQuestionsByStep(5)
  const step7Data = useQuestionsByStep(7)

  return {
    step5: step5Data,
    step7: step7Data,
    isLoading: step5Data.isLoading || step7Data.isLoading,
    error: step5Data.error || step7Data.error
  }
}
