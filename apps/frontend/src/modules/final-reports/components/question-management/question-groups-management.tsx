'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { Badge } from '@una-gc/ui/components/badge'
import { Input } from '@una-gc/ui/components/input'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Label } from '@una-gc/ui/components/label'
import { Separator } from '@una-gc/ui/components/separator'
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
  Package,
  MessageSquare,
  Users,
  Eye,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

import {
  useQuestionGroupsByStep,
  useQuestionGroupsWithQuestionsByStep,
  useCreateQuestionGroup,
  useUpdateQuestionGroup,
  useDeleteQuestionGroup
} from '../../services/question-groups.service'
import {
  QuestionGroup,
  CreateQuestionGroupDto,
  UpdateQuestionGroupDto,
  REPORT_TYPES
} from '../../types/question-management.types'

interface QuestionGroupsManagementProps {
  stepNumber: number
  reportType?: string
}

const questionGroupSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  questionTitle: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  stepNumber: z.number().min(1),
  appliesTo: z.array(z.string()).min(1, 'Debe seleccionar al menos un tipo de informe'),
  order: z.coerce.number().min(0).default(0),
})

type QuestionGroupFormData = z.infer<typeof questionGroupSchema>

export function QuestionGroupsManagement({ stepNumber, reportType }: QuestionGroupsManagementProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<QuestionGroup | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'detailed'>('list')

  // Queries
  const { data: groupsData, isLoading, error } = useQuestionGroupsByStep(stepNumber, reportType)
  const { data: groupsWithQuestionsData } = useQuestionGroupsWithQuestionsByStep(stepNumber, reportType)

  // Mutations
  const createGroupMutation = useCreateQuestionGroup()
  const updateGroupMutation = useUpdateQuestionGroup()
  const deleteGroupMutation = useDeleteQuestionGroup()

  // Form
  const form = useForm<QuestionGroupFormData>({
    resolver: zodResolver(questionGroupSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      questionTitle: '',
      description: '',
      stepNumber,
      appliesTo: ['TODOS'],
      order: 0,
    }
  })

  const handleCreateGroup = () => {
    setEditingGroup(null)
    form.reset({
      name: '',
      questionTitle: '',
      description: '',
      stepNumber,
      appliesTo: ['TODOS'],
      order: 0,
    })
    setDialogOpen(true)
  }

  const handleEditGroup = (group: QuestionGroup) => {
    setEditingGroup(group)
    form.reset({
      name: group.name,
      questionTitle: group.questionTitle,
      description: group.description || '',
      stepNumber: group.stepNumber || stepNumber,
      appliesTo: group.appliesTo || ['TODOS'],
      order: group.order || 0,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (data: QuestionGroupFormData) => {
    try {
      console.log('🏗️ Iniciando creación/edición de grupo:', { editingGroup, data })

      if (editingGroup) {
        console.log('✏️ Editando grupo existente:', editingGroup.id)
        await updateGroupMutation.mutateAsync({
          id: editingGroup.id!,
          data
        })
        console.log('✅ Grupo editado exitosamente')
      } else {
        console.log('🆕 Creando nuevo grupo con datos:', data)
        const result = await createGroupMutation.mutateAsync(data)
        console.log('✅ Grupo creado exitosamente:', result)
      }
      setDialogOpen(false)
      setEditingGroup(null)
      form.reset()
    } catch (error) {
      console.error('❌ Error saving group:', error)
      console.error('❌ Error type:', typeof error)
      console.error('❌ Error details:', JSON.stringify(error, null, 2))
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    try {
      if (!groupId) {
        console.error('❌ Error: ID del grupo no válido:', groupId)
        toast.error('Error: ID del grupo no válido')
        return
      }

      // Verificar si el grupo tiene preguntas asociadas antes de hacer la petición
      const groupWithQuestions = groupsWithQuestionsData?.find(g => g.id === groupId)
      const questionCount = groupWithQuestions?.questions?.length || 0

      console.log('🔍 Debug - Verificando grupo:', {
        groupId,
        groupWithQuestions,
        questionCount,
        questions: groupWithQuestions?.questions,
        allGroupsData: groupsWithQuestionsData
      })

      if (questionCount > 0) {
        console.log('⚠️ Grupo tiene preguntas activas, bloqueando eliminación')
        toast.error(`No se puede eliminar el grupo porque tiene ${questionCount} pregunta${questionCount !== 1 ? 's' : ''} asociada${questionCount !== 1 ? 's' : ''}. Elimina primero todas las preguntas del grupo desde la pestaña "Preguntas Individuales".`)
        return
      }

      console.log('🗑️ Iniciando eliminación del grupo con ID:', groupId)
      console.log('🔄 Mutation function:', deleteGroupMutation)
      console.log('🔄 Mutation status:', deleteGroupMutation.status)
      console.log('🔄 About to call mutateAsync...')

      const result = await deleteGroupMutation.mutateAsync(groupId)
      console.log('✅ Grupo eliminado exitosamente:', result)
      toast.success('Grupo eliminado exitosamente')
    } catch (error) {
      console.error('❌ Error completo en delete mutation:', error)
      console.error('❌ Error type:', typeof error)
      console.error('❌ Error constructor:', error?.constructor?.name)
      console.error('❌ Error keys:', Object.keys(error || {}))

      // Extraer información específica del error
      if (error && typeof error === 'object') {
        if ('response' in error && error.response) {
          console.error('❌ Response error:', error.response)
          const response = error.response as any
          console.error('❌ Response data:', response?.data)
          console.error('❌ Response status:', response?.status)
        }
        if ('message' in error) {
          console.error('❌ Error message:', error.message)
        }
        if ('status' in error) {
          console.error('❌ Status:', error.status)
        }
        if ('request' in error) {
          console.error('❌ Request details:', error.request)
        }
      }

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
          errorMessage = 'No tienes permisos para eliminar este grupo'
        } else if (response.status === 404) {
          errorMessage = 'El grupo no fue encontrado'
        } else if (response.status === 400) {
          errorMessage = 'Datos inválidos para eliminar el grupo'
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      toast.error(`Error al eliminar el grupo: ${errorMessage}`)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando grupos de preguntas...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
            <p className="text-destructive">Error al cargar los grupos de preguntas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const groups = groupsData || []

  return (
    <div className="space-y-4 overflow-visible">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Grupos de Preguntas - Paso {stepNumber}</h3>
          <Badge variant="secondary">{groups.length} grupos</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'list' ? 'detailed' : 'list')}
          >
            <Eye className="h-4 w-4 mr-2" />
            {viewMode === 'list' ? 'Vista Detallada' : 'Vista Lista'}
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateGroup}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Grupo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingGroup ? 'Editar Grupo de Preguntas' : 'Crear Nuevo Grupo de Preguntas'}
                </DialogTitle>
                <DialogDescription>
                  {editingGroup
                    ? 'Modifique los datos del grupo de preguntas.'
                    : 'Complete la información para crear un nuevo grupo de preguntas.'
                  }
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Grupo</Label>
                    <Controller
                      name="name"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="name"
                          placeholder="Ej: Evaluación del Curso"
                          {...field}
                        />
                      )}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="questionTitle">Título de Sección</Label>
                    <Controller
                      name="questionTitle"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="questionTitle"
                          placeholder="Título que verán los usuarios"
                          {...field}
                        />
                      )}
                    />
                    {form.formState.errors.questionTitle && (
                      <p className="text-sm text-destructive">{form.formState.errors.questionTitle.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción (Opcional)</Label>
                  <Controller
                    name="description"
                    control={form.control}
                    render={({ field }) => (
                      <Textarea
                        id="description"
                        placeholder="Descripción adicional del grupo de preguntas"
                        rows={3}
                        {...field}
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipos de Informe</Label>
                    <div className="space-y-2">
                      {Object.entries(REPORT_TYPES).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`reportType-${value}`}
                            value={value}
                            {...form.register('appliesTo')}
                            className="rounded border-border"
                          />
                          <Label htmlFor={`reportType-${value}`} className="text-sm">
                            {value === 'TODOS' ? 'Todos los tipos' : value}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {form.formState.errors.appliesTo && (
                      <p className="text-sm text-destructive">{form.formState.errors.appliesTo.message}</p>
                    )}
                  </div>

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
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createGroupMutation.isPending || updateGroupMutation.isPending}
                  >
                    {(createGroupMutation.isPending || updateGroupMutation.isPending) && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    )}
                    {editingGroup ? 'Actualizar' : 'Crear'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Groups List */}
      <div className="space-y-4">
        {groups.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay grupos de preguntas</h3>
                <p className="text-muted-foreground mb-4">
                  Cree el primer grupo de preguntas para el paso {stepNumber}
                </p>
                <Button onClick={handleCreateGroup}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Grupo
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div
            className="overflow-y-auto overflow-x-visible pr-2 scroll-smooth"
            style={{
              height: '600px'
            }}
          >
            <div className="grid gap-2 pb-96 pt-2">
              {groups.map((group) => {
                const groupWithQuestions = groupsWithQuestionsData?.find(g => g.id === group.id)
                const questionCount = groupWithQuestions?.questions?.length || 0

                return (
                  <Card key={group.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2 pt-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{group.name}</CardTitle>
                          <CardDescription className="text-sm">{group.questionTitle}</CardDescription>
                          {group.description && (
                            <p className="text-xs text-muted-foreground mt-1">{group.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditGroup(group)}
                            className="h-6 w-6"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          {group.id && (
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
                                    Esta acción eliminará permanentemente el grupo "{group.name}".
                                    Esta acción no se puede deshacer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      if (group.id) {
                                        handleDeleteGroup(group.id)
                                      } else {
                                        toast.error('Error: No se pudo obtener el ID del grupo')
                                      }
                                    }}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">
                              {questionCount} pregunta{questionCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">
                              {group.appliesTo?.join(', ') || 'Todos los tipos'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant={group.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs px-1.5 py-0.5">
                            {group.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                          </Badge>
                          {group.order !== undefined && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5">Orden: {group.order}</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
