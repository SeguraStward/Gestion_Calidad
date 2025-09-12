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
      if (editingGroup) {
        await updateGroupMutation.mutateAsync({
          id: editingGroup.id!,
          data
        })
      } else {
        await createGroupMutation.mutateAsync(data)
      }
      setDialogOpen(false)
      setEditingGroup(null)
      form.reset()
    } catch (error) {
      console.error('Error saving group:', error)
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await deleteGroupMutation.mutateAsync(groupId)
    } catch (error) {
      console.error('Error deleting group:', error)
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
    <div className="space-y-4">
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
          <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2">
            {groups.map((group) => {
              const groupWithQuestions = groupsWithQuestionsData?.find(g => g.id === group.id)
              const questionCount = groupWithQuestions?.questions?.length || 0

              return (
                <Card key={group.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <CardDescription>{group.questionTitle}</CardDescription>
                        {group.description && (
                          <p className="text-sm text-muted-foreground mt-2">{group.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditGroup(group)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará permanentemente el grupo "{group.name}" y todas sus preguntas asociadas.
                                Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteGroup(group.id!)}
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
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{questionCount} preguntas</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {group.appliesTo?.join(', ') || 'Todos los tipos'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={group.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {group.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                        </Badge>
                        {group.order !== undefined && (
                          <Badge variant="outline">Orden: {group.order}</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
