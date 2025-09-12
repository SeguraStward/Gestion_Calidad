'use client'

import { useQuery } from '@tanstack/react-query'
import { questionService } from '../services/questions.service'
import { questionGroupService } from '../services/question-groups.service'
import type { Question, QuestionGroup } from '../types/question-management.types'

export interface QuestionsByStepData {
  groups: QuestionGroup[]
  questions: Question[]
  groupedQuestions: Record<string, Question[]>
  flatQuestions: Array<{
    questionId: string
    question: string
    groupTitle?: string
    responseType: string
    options?: Array<{ category: string; label: string; value: string }>
    isRequired?: boolean
  }>
}

export function useQuestionsForForms(stepNumber: number, reportType: string = 'INFORME_FINAL_V1') {
  return useQuery({
    queryKey: ['questions-for-forms', stepNumber, reportType],
    queryFn: async (): Promise<QuestionsByStepData> => {
      // Obtener grupos y preguntas para el paso específico
      const [groups, questions] = await Promise.all([
        questionGroupService.getByStep(stepNumber),
        questionService.getByStep(stepNumber)
      ])

      // Filtrar por tipo de informe (simplificado para usar solo INFORME_FINAL_V1)
      const filteredGroups = groups.filter((group: QuestionGroup) =>
        !group.appliesTo || group.appliesTo.includes('INFORME_FINAL_V1') || group.appliesTo.includes('TODOS')
      )

      const filteredQuestions = questions.filter((question: Question) =>
        !question.appliesTo || question.appliesTo.includes('INFORME_FINAL_V1') || question.appliesTo.includes('TODOS')
      )

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

      // Crear lista plana de preguntas para compatibilidad con formularios existentes
      const flatQuestions = sortedGroups.flatMap(group => {
        const groupQuestions = groupedQuestions[group.id || ''] || []
        return groupQuestions.map(q => ({
          questionId: q.id || '',
          question: q.question,
          groupTitle: group.questionTitle,
          responseType: q.responseType,
          options: q.options,
          isRequired: q.isRequired
        }))
      })

      // Agregar preguntas sin grupo
      const ungroupedQuestions = groupedQuestions['ungrouped'] || []
      ungroupedQuestions.forEach(q => {
        flatQuestions.push({
          questionId: q.id || '',
          question: q.question,
          groupTitle: '',
          responseType: q.responseType,
          options: q.options,
          isRequired: q.isRequired
        })
      })

      return {
        groups: sortedGroups,
        questions: filteredQuestions,
        groupedQuestions,
        flatQuestions
      }
    },
    enabled: !!stepNumber
  })
}
