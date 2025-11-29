'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import type { InstitutionalProject, CreateInstitutionalProjectDto } from '../services/institutional-projects.service'

interface CampusAllocation {
  id: string
  campusName: string
  cycleName: string
  careerName?: string
}

interface Director {
  id: string
  name: string
  email: string
}

interface InstitutionalProjectFormProps {
  project?: InstitutionalProject | null
  campusAllocations: CampusAllocation[]
  directors: Director[]
  campusAllocationId?: string
  directorId?: string
  onSubmit: (data: CreateInstitutionalProjectDto) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

export default function InstitutionalProjectForm({
  project,
  campusAllocations,
  directors,
  campusAllocationId,
  directorId,
  onSubmit,
  onCancel,
  loading
}: InstitutionalProjectFormProps) {
  const form = useForm<CreateInstitutionalProjectDto>({
    defaultValues: {
      code: project?.code || '',
      title: project?.title || '',
      description: project?.description || '',
      objectives: project?.objectives || '',
      projectType: project?.projectType || 'INSTITUTIONAL',
      requiredJourneyTime: project?.requiredJourneyTime || 0,
      assignedJourneyTime: project?.assignedJourneyTime || 0,
      startDate: project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project?.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      campusAllocationId: project?.campusAllocationId || campusAllocationId || campusAllocations[0]?.id || '',
      directorId: project?.directorId || directorId || directors[0]?.id || ''
    }
  })

  useEffect(() => {
    if (project) {
      form.reset({
        code: project.code,
        title: project.title,
        description: project.description || '',
        objectives: project.objectives || '',
        projectType: project.projectType,
        requiredJourneyTime: project.requiredJourneyTime,
        assignedJourneyTime: project.assignedJourneyTime,
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        campusAllocationId: project.campusAllocationId,
        directorId: project.directorId
      })
    }
  }, [project, form])

  const handleSubmit = async (data: CreateInstitutionalProjectDto) => {
    try {
      await onSubmit(data)
      if (!project) {
        form.reset()
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Código */}
        <FormField
          control={form.control}
          name="code"
          rules={{
            required: 'El código es obligatorio',
            pattern: {
              value: /^[A-Z0-9-]+$/,
              message: 'El código debe contener solo letras mayúsculas, números y guiones'
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código del Proyecto *</FormLabel>
              <FormControl>
                <Input placeholder="PROJ-2025-001" {...field} className="font-mono" disabled={!!project} />
              </FormControl>
              <FormDescription>
                {project
                  ? 'El código no puede modificarse después de crear el proyecto'
                  : 'Código único del proyecto (ej: PROJ-2025-001)'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Título */}
        <FormField
          control={form.control}
          name="title"
          rules={{ required: 'El título es obligatorio' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título del Proyecto *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Mejora de Infraestructura Tecnológica" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descripción */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Descripción general del proyecto..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Objetivos */}
        <FormField
          control={form.control}
          name="objectives"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objetivos</FormLabel>
              <FormControl>
                <Textarea placeholder="Objetivos principales del proyecto..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Asignación de Campus */}
        <FormField
          control={form.control}
          name="campusAllocationId"
          rules={{ required: 'La asignación de campus es obligatoria' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asignación de Campus *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la asignación de campus" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {campusAllocations.length > 0 ? (
                    campusAllocations.map((allocation) => (
                      <SelectItem key={allocation.id} value={allocation.id}>
                        {allocation.campusName} - {allocation.cycleName}
                        {allocation.careerName && ` - ${allocation.careerName}`}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No hay asignaciones disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>Campus y ciclo donde se ejecutará el proyecto</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Director */}
        <FormField
          control={form.control}
          name="directorId"
          rules={{ required: 'El director es obligatorio' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Director del Proyecto *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el director" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {directors.length > 0 ? (
                    directors.map((director) => (
                      <SelectItem key={director.id} value={director.id}>
                        {director.name || director.email} {director.name && `(${director.email})`}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No hay directores disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription>Coordinador o responsable del proyecto</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tipo de Proyecto */}
        <FormField
          control={form.control}
          name="projectType"
          rules={{ required: 'El tipo es obligatorio' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Proyecto *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="INSTITUTIONAL">Institucional</SelectItem>
                  <SelectItem value="RESEARCH">Investigación</SelectItem>
                  <SelectItem value="EXTENSION">Extensión</SelectItem>
                  <SelectItem value="OTHER">Otro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Horas Requeridas y Asignadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="requiredJourneyTime"
            rules={{
              required: 'Las horas requeridas son obligatorias',
              min: { value: 0, message: 'Debe ser mayor o igual a 0' }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horas Requeridas *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="120"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Horas totales necesarias para el proyecto</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assignedJourneyTime"
            rules={{
              min: { value: 0, message: 'Debe ser mayor o igual a 0' }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horas Asignadas</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Horas ya asignadas al proyecto</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            rules={{ required: 'La fecha de inicio es obligatoria' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Inicio *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            rules={{ required: 'La fecha de fin es obligatoria' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Fin *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Hidden IDs */}
        <input type="hidden" {...form.register('campusAllocationId')} />
        <input type="hidden" {...form.register('directorId')} />

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : project ? 'Actualizar' : 'Crear Proyecto'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
