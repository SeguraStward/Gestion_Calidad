'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import type { InstitutionalProject, CreateInstitutionalProjectDto } from '../services/institutional-projects.service'

interface InstitutionalProjectFormProps {
  project?: InstitutionalProject | null
  campusAllocationId?: string
  directorId?: string
  onSubmit: (data: CreateInstitutionalProjectDto) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}

export default function InstitutionalProjectForm({
  project,
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
      campusAllocationId: project?.campusAllocationId || campusAllocationId || '',
      directorId: project?.directorId || directorId || ''
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
