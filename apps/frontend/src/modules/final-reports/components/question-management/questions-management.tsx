'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { Badge } from '@una-gc/ui/components/badge'
import { Input } from '@una-gc/ui/components/input'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Label } from '@una-gc/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@una-gc/ui/components/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@una-gc/ui/components/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@una-gc/ui/components/alert-dialog'
import {
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  List,
  ListChecks,
  AlertTriangle,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

import {
  useQuestionsByStep,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion
} from '../../services/questions.service'
import {
  useQuestionGroupsByStep
} from '../../services/question-groups.service'
import {
  Question,
  QuestionOption,
  CreateQuestionDto,
  UpdateQuestionDto,
  ResponseType,
  REPORT_TYPES
} from '../../types/question-management.types'

interface QuestionsManagementProps {
  stepNumber: number
  reportType?: string
}

const questionOptionSchema = z.object({
  category: z.string().min(1, 'La categoría es requerida'),
  label: z.string().min(1, 'La etiqueta es requerida'),
  value: z.string().min(1, 'El valor es requerido'),
})

const questionSchema = z.object({
  groupId: z.string().optional(),
  module: z.string().optional(),
  question: z.string().min(1, 'La pregunta es requerida'),
  options: z.array(z.object({
    category: z.string(),
    label: z.string(),
    value: z.string(),
  })).optional(),
  responseType: z.enum(['TEXT', 'NUMBER', 'DATE', 'SELECT', 'MULTISELECT', 'BOOLEAN']),
  questionVersion: z.string().optional(),
  stepNumber: z.number().min(1),
  appliesTo: z.array(z.string()).min(1, 'Debe seleccionar al menos un tipo de informe'),
  description: z.string().optional(),
  isRequired: z.boolean(),
  order: z.coerce.number().min(0).default(0),
})

type QuestionFormData = z.infer<typeof questionSchema>

const getResponseTypeIcon = (type: ResponseType) => {
  switch (type) {
    case 'TEXT':
      return <Type className="h-4 w-4" />
    case 'NUMBER':
      return <Hash className="h-4 w-4" />
    case 'DATE':
      return <Calendar className="h-4 w-4" />
    case 'BOOLEAN':
      return <CheckSquare className="h-4 w-4" />
    case 'SELECT':
      return <List className="h-4 w-4" />
    case 'MULTISELECT':
      return <ListChecks className="h-4 w-4" />
    default:
      return <MessageSquare className="h-4 w-4" />
  }
}

const getResponseTypeLabel = (type: ResponseType) => {
  switch (type) {
    case 'TEXT':
      return 'Texto'
    case 'NUMBER':
      return 'Número'
    case 'DATE':
      return 'Fecha'
    case 'BOOLEAN':
      return 'Sí/No'
    case 'SELECT':
      return 'Selección Única'
    case 'MULTISELECT':
      return 'Selección Múltiple'
    default:
      return type
  }
}

export function QuestionsManagement({ stepNumber, reportType }: QuestionsManagementProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Sin grupo'])) // Por defecto expandir "Sin grupo"

  // Queries
  const { data: questionsData, isLoading: questionsLoading, error: questionsError } = useQuestionsByStep(stepNumber, reportType)
  const { data: groupsData } = useQuestionGroupsByStep(stepNumber, reportType)

  // Mutations
  const createQuestionMutation = useCreateQuestion()
  const updateQuestionMutation = useUpdateQuestion()
  const deleteQuestionMutation = useDeleteQuestion()

  // Form
  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      groupId: 'none',
      stepNumber,
      appliesTo: ['TODOS'],
      responseType: stepNumber === 5 ? 'TEXT' : 'SELECT',
      isRequired: true,
      order: 0,
      options: [],
      question: '',
      description: '',
    }
  })

  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control: form.control,
    name: "options"
  })

  const watchResponseType = form.watch('responseType')

  // Reset options when response type changes (only if it's not a type that needs options)
  useEffect(() => {
    // Only clear options when changing to a type that definitely doesn't need them
    if (watchResponseType === 'TEXT' || watchResponseType === 'NUMBER' || watchResponseType === 'DATE' || watchResponseType === 'BOOLEAN') {
      const currentOptions = form.getValues('options') || []
      if (currentOptions.length > 0) {
        form.setValue('options', [])
      }
    }
  }, [watchResponseType, form])  // Prepare data (must be before any conditional returns)
  const questions = questionsData || []
  const groups = groupsData || []

  // Group questions by group ID for better organization
  const questionsByGroup = useMemo(() => {
    const grouped = questions.reduce((acc, question) => {
      const groupName = question.group?.name || 'Sin grupo'
      if (!acc[groupName]) {
        acc[groupName] = []
      }
      acc[groupName].push(question)
      return acc
    }, {} as Record<string, Question[]>)

    console.log('Questions grouped:', grouped)
    return grouped
  }, [questions])

  // Event handlers
  const toggleGroupExpansion = (groupKey: string) => {
    console.log('Toggling group:', groupKey, 'Current expanded:', expandedGroups)
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey)
        console.log('Collapsing group:', groupKey)
      } else {
        newSet.add(groupKey)
        console.log('Expanding group:', groupKey)
      }
      console.log('New expanded groups:', newSet)
      return newSet
    })
  }

  const handleCreateQuestion = () => {
    setEditingQuestion(null)

    // Determine default options based on step
    let defaultOptions: any[] = []
    const defaultResponseType = stepNumber === 5 ? 'TEXT' : 'SELECT'

    // For step 7 (SELECT by default), add default options
    if (stepNumber === 7 && defaultResponseType === 'SELECT') {
      defaultOptions = [
        { category: 'option', label: 'Opción 1', value: 'opcion_1' },
        { category: 'option', label: 'Opción 2', value: 'opcion_2' }
      ]
    }

    form.reset({
      groupId: 'none',
      stepNumber,
      appliesTo: ['TODOS'],
      responseType: defaultResponseType,
      isRequired: true,
      order: 0,
      options: defaultOptions,
      question: '',
      description: '',
    })
    setDialogOpen(true)
  }

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question)
    form.reset({
      groupId: question.groupId || 'none',
      module: question.module || '',
      question: question.question,
      options: question.options || [],
      responseType: question.responseType,
      questionVersion: question.questionVersion || '',
      stepNumber: question.stepNumber || stepNumber,
      appliesTo: question.appliesTo || ['TODOS'],
      description: question.description || '',
      isRequired: question.isRequired ?? true,
      order: question.order || 0,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (data: QuestionFormData) => {
    try {
      // Clean options if not needed for response type
      const shouldHaveOptions = ['SELECT', 'MULTISELECT'].includes(data.responseType)
      const questionData = {
        ...data,
        options: shouldHaveOptions ? data.options : [],
        groupId: data.groupId === 'none' ? undefined : data.groupId, // Convert 'none' to undefined
      }

      if (editingQuestion) {
        await updateQuestionMutation.mutateAsync({
          id: editingQuestion.id!,
          data: questionData
        })
      } else {
        await createQuestionMutation.mutateAsync(questionData)
      }
      setDialogOpen(false)
      setEditingQuestion(null)
      form.reset()
    } catch (error) {
      console.error('Error saving question:', error)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      if (!questionId) {
        console.error('❌ Error: ID de la pregunta no válido:', questionId)
        toast.error('Error: ID de la pregunta no válido')
        return
      }

      console.log('🗑️ Iniciando eliminación de la pregunta con ID:', questionId)

      const result = await deleteQuestionMutation.mutateAsync(questionId)
      console.log('✅ Pregunta eliminada exitosamente:', result)
      toast.success('Pregunta eliminada exitosamente')
    } catch (error) {
      console.error('❌ Error completo en delete mutation:', error)

      // Extraer información específica del error
      if (error && typeof error === 'object') {
        if ('response' in error && error.response) {
          console.error('❌ Response error:', error.response)
        }
        if ('message' in error) {
          console.error('❌ Error message:', error.message)
        }
        if ('status' in error) {
          console.error('❌ Status:', error.status)
        }
      }

      // Mostrar error más específico
      let errorMessage = 'Error desconocido'
      if (error && typeof error === 'object' && 'response' in error && error.response) {
        const response = error.response as any
        if (response.data?.message) {
          errorMessage = response.data.message
        } else if (response.status === 403) {
          errorMessage = 'No tienes permisos para eliminar esta pregunta'
        } else if (response.status === 404) {
          errorMessage = 'La pregunta no fue encontrada'
        } else if (response.status === 400) {
          errorMessage = 'Datos inválidos para eliminar la pregunta'
        } else if (response.status === 500) {
          errorMessage = 'Error interno del servidor al eliminar la pregunta'
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      toast.error(`Error al eliminar la pregunta: ${errorMessage}`)
    }
  }

  const addOption = useCallback(() => {
    const currentOptions = form.getValues('options') || []
    const nextNumber = currentOptions.length + 1
    appendOption({
      category: 'option',
      label: `Opción ${nextNumber}`,
      value: `opcion_${nextNumber}`
    })
  }, [form, appendOption])

  if (questionsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando preguntas...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (questionsError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
            <p className="text-destructive">Error al cargar las preguntas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Preguntas - Paso {stepNumber}</h3>
          <Badge variant="secondary">{questions.length} preguntas</Badge>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateQuestion}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Pregunta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingQuestion ? 'Editar Pregunta' : 'Crear Nueva Pregunta'}
              </DialogTitle>
              <DialogDescription>
                {editingQuestion
                  ? 'Modifique los datos de la pregunta.'
                  : 'Complete la información para crear una nueva pregunta.'
                }
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Información Básica</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="group">Grupo (Opcional)</Label>
                    <Select value={form.watch('groupId')} onValueChange={(value) => form.setValue('groupId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin grupo</SelectItem>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id!}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responseType">Tipo de Respuesta</Label>
                    <Select
                      value={form.watch('responseType')}
                      onValueChange={(value: ResponseType) => form.setValue('responseType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TEXT">
                          <div className="flex items-center gap-2">
                            <Type className="h-4 w-4" />
                            Texto
                          </div>
                        </SelectItem>
                        <SelectItem value="SELECT">
                          <div className="flex items-center gap-2">
                            <List className="h-4 w-4" />
                            Selección Única
                          </div>
                        </SelectItem>
                        <SelectItem value="MULTISELECT">
                          <div className="flex items-center gap-2">
                            <ListChecks className="h-4 w-4" />
                            Selección Múltiple
                          </div>
                        </SelectItem>
                        <SelectItem value="NUMBER">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4" />
                            Número
                          </div>
                        </SelectItem>
                        <SelectItem value="DATE">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Fecha
                          </div>
                        </SelectItem>
                        <SelectItem value="BOOLEAN">
                          <div className="flex items-center gap-2">
                            <CheckSquare className="h-4 w-4" />
                            Sí/No
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="question">Pregunta</Label>
                  <Textarea
                    id="question"
                    {...form.register('question')}
                    placeholder="Escriba la pregunta aquí..."
                    rows={3}
                  />
                  {form.formState.errors.question && (
                    <p className="text-sm text-destructive">{form.formState.errors.question.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción (Opcional)</Label>
                  <Textarea
                    id="description"
                    {...form.register('description')}
                    placeholder="Descripción adicional o instrucciones..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Options Section - Only for SELECT and MULTISELECT */}
              {['SELECT', 'MULTISELECT'].includes(watchResponseType) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-muted-foreground">Opciones de Respuesta</h4>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          form.setValue('options', [
                            { category: 'rating', label: 'Excelente', value: 'excelente' },
                            { category: 'rating', label: 'Bueno', value: 'bueno' },
                            { category: 'rating', label: 'Regular', value: 'regular' },
                            { category: 'rating', label: 'Malo', value: 'malo' }
                          ])
                        }}
                      >
                        Calificación
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          form.setValue('options', [
                            { category: 'boolean', label: 'Sí', value: 'si' },
                            { category: 'boolean', label: 'No', value: 'no' }
                          ])
                        }}
                      >
                        Sí/No
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => form.setValue('options', [])}
                      >
                        Limpiar
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={addOption}>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Opción
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {optionFields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2 p-3 border rounded-md">
                        <div className="grid grid-cols-3 gap-2 flex-1">
                          <Controller
                            name={`options.${index}.category`}
                            control={form.control}
                            render={({ field: fieldProps }) => (
                              <Input
                                {...fieldProps}
                                placeholder="Categoría"
                              />
                            )}
                          />
                          <Controller
                            name={`options.${index}.label`}
                            control={form.control}
                            render={({ field: fieldProps }) => (
                              <Input
                                {...fieldProps}
                                placeholder="Etiqueta"
                              />
                            )}
                          />
                          <Controller
                            name={`options.${index}.value`}
                            control={form.control}
                            render={({ field: fieldProps }) => (
                              <Input
                                {...fieldProps}
                                placeholder="Valor"
                              />
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Configuration */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Configuración</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipos de Informe</Label>
                    <div className="space-y-2">
                      {Object.entries(REPORT_TYPES).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`question-reportType-${value}`}
                            value={value}
                            {...form.register('appliesTo')}
                            className="rounded border-border"
                          />
                          <Label htmlFor={`question-reportType-${value}`} className="text-sm">
                            {value === 'TODOS' ? 'Todos los tipos' : value}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="order">Orden</Label>
                      <Controller
                        name="order"
                        control={form.control}
                        render={({ field: { value, onChange, ...field } }) => (
                          <Input
                            id="order"
                            type="number"
                            min="0"
                            placeholder="0"
                            value={value?.toString() || ''}
                            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                            {...field}
                          />
                        )}
                      />
                      {form.formState.errors.order && (
                        <p className="text-sm text-destructive">{form.formState.errors.order.message}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isRequired"
                        {...form.register('isRequired')}
                        className="rounded border-border"
                      />
                      <Label htmlFor="isRequired" className="text-sm">
                        Pregunta requerida
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending}
                >
                  {(createQuestionMutation.isPending || updateQuestionMutation.isPending) && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  )}
                  {editingQuestion ? 'Actualizar' : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Questions List */}
      <div className="overflow-y-auto pr-2" style={{ height: '600px' }}>
        <div className="pb-96 space-y-4">
          {questions.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay preguntas</h3>
                  <p className="text-muted-foreground mb-4">
                    Cree la primera pregunta para el paso {stepNumber}
                  </p>
                  <Button onClick={handleCreateQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Pregunta
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(questionsByGroup).map(([groupKey, groupQuestions]) => {
                const isExpanded = expandedGroups.has(groupKey)

                return (
                  <Card key={groupKey} className="border-2 border-muted/50">
                    <CardHeader className="pb-2">
                      {/* Group Header - Clickeable */}
                      <button
                        onClick={() => toggleGroupExpansion(groupKey)}
                        className="w-full flex items-center gap-3 py-2 hover:bg-muted/30 transition-colors rounded-lg px-2 -mx-2"
                      >
                        {/* Expand/Collapse Icon */}
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-primary flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                        <div className="h-1 w-8 bg-primary rounded-full flex-shrink-0" />
                        <h3 className="text-lg font-semibold text-foreground flex-1 text-left">
                          {groupKey === 'Sin grupo' ? 'Preguntas sin agrupar' : groupKey}
                        </h3>
                        <Badge variant="secondary" className="text-xs flex-shrink-0">
                          {groupQuestions.length} pregunta{groupQuestions.length !== 1 ? 's' : ''}
                        </Badge>
                      </button>
                    </CardHeader>

                    {/* Questions in this group - Solo se muestra si está expandido */}
                    {isExpanded && (
                      <CardContent className="pt-0 pb-12">
                        <div className="space-y-2 pl-4 border-l-2 border-primary/30 pb-8">
                          {groupQuestions.map((question) => (
                            <Card key={question.id} className="hover:shadow-sm transition-shadow bg-card/50">
                              <CardHeader className="pb-1 pt-2">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2">
                                      {getResponseTypeIcon(question.responseType)}
                                      <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                        {getResponseTypeLabel(question.responseType)}
                                      </Badge>
                                    </div>
                                    <CardTitle className="text-sm leading-tight">
                                      {question.question}
                                    </CardTitle>
                                    {question.description && (
                                      <CardDescription className="text-xs">{question.description}</CardDescription>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 ml-3">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleEditQuestion(question)}
                                      className="h-6 w-6"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-6 w-6">
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Esta acción eliminará permanentemente la pregunta.
                                            Esta acción no se puede deshacer.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => {
                                              if (question.id) {
                                                handleDeleteQuestion(question.id)
                                              } else {
                                                toast.error('Error: No se pudo obtener el ID de la pregunta')
                                              }
                                            }}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          >
                                            Eliminar
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0 pb-2">
                                {/* Options preview for SELECT/MULTISELECT */}
                                {['SELECT', 'MULTISELECT'].includes(question.responseType) && question.options && question.options.length > 0 && (
                                  <div className="mb-2">
                                    <p className="text-xs font-medium mb-1">Opciones:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {question.options.map((option, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs px-1.5 py-0.5">
                                          {option.label}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground text-xs">
                                      {question.appliesTo?.join(', ') || 'Todos los tipos'}
                                    </span>
                                    {question.isRequired && (
                                      <Badge variant="destructive" className="text-xs px-1.5 py-0.5">Requerida</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Badge variant={question.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs px-1.5 py-0.5">
                                      {question.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}
                                    </Badge>
                                    {question.order !== undefined && (
                                      <Badge variant="outline" className="text-xs px-1.5 py-0.5">Orden: {question.order}</Badge>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
