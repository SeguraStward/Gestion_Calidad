'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Input } from '@una-gc/ui/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { Textarea } from '@una-gc/ui/components/textarea'

import type { CreateInstitutionalProjectDto, InstitutionalProject } from '../services/institutional-projects.service'

interface CampusAllocation {
  id: string
  campusName: string
  cycleName: string
  careerName?: string
}

interface Director {
  id: string
  name?: string
  email?: string
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
    form.reset({
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
    })
  }, [project, campusAllocationId, directorId, campusAllocations, directors, form])

  const handleSubmit = async (data: CreateInstitutionalProjectDto) => {
    const sanitizedData: CreateInstitutionalProjectDto = {
      ...data,
      description: data.description?.trim() || undefined,
      objectives: data.objectives?.trim() || undefined,
      startDate: data.startDate,
      endDate: data.endDate,
      requiredJourneyTime: Number(data.requiredJourneyTime),
      assignedJourneyTime: Number(data.assignedJourneyTime || 0)
    }

    try {
      await onSubmit(sanitizedData)
      if (!project) {
        form.reset()
      }
    } catch (error) {
      console.error('Error submitting project form:', error)
    }
  }

  const hasCampusAllocations = campusAllocations.length > 0
  const hasDirectors = directors.length > 0

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="code"
          rules={{
            required: 'El codigo es obligatorio',
            pattern: {
              value: /^[A-Z0-9-]+$/,
              message: 'El codigo debe contener solo letras mayusculas, numeros y guiones'
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Codigo del Proyecto *</FormLabel>
              <FormControl>
                <Input placeholder="PROJ-2026-001" {...field} className="font-mono" disabled={Boolean(project)} />
              </FormControl>
              <FormDescription>
                {project ? 'El codigo no puede modificarse despues de crear el proyecto' : 'Codigo unico del proyecto'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          rules={{ required: 'El titulo es obligatorio' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titulo del Proyecto *</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Mejora de Infraestructura Tecnologica" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripcion</FormLabel>
              <FormControl>
                <Textarea placeholder="Descripcion general del proyecto..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <FormField
          control={form.control}
          name="campusAllocationId"
          rules={{ required: 'La asignacion de campus es obligatoria' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asignacion de Campus *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!hasCampusAllocations}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={hasCampusAllocations ? 'Selecciona la asignacion de campus' : 'No hay asignaciones disponibles'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {campusAllocations.map((allocation) => (
                    <SelectItem key={allocation.id} value={allocation.id}>
                      {allocation.campusName} - {allocation.cycleName}
                      {allocation.careerName ? ` - ${allocation.careerName}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Campus y ciclo donde se ejecutara el proyecto</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="directorId"
          rules={{ required: 'El director es obligatorio' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Director del Proyecto *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!hasDirectors}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={hasDirectors ? 'Selecciona el director' : 'No hay directores disponibles'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {directors.map((director) => (
                    <SelectItem key={director.id} value={director.id}>
                      {director.name || director.email || director.id}
                      {director.name && director.email ? ` (${director.email})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Coordinador o responsable del proyecto</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="projectType"
          rules={{ required: 'El tipo es obligatorio' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Proyecto *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="INSTITUTIONAL">Institucional</SelectItem>
                  <SelectItem value="ACADEMIC">Academico</SelectItem>
                  <SelectItem value="RESEARCH">Investigacion</SelectItem>
                  <SelectItem value="EXTENSION">Extension</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
                    onChange={(event) => field.onChange(Number(event.target.value))}
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
            rules={{ min: { value: 0, message: 'Debe ser mayor o igual a 0' } }}
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
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
                </FormControl>
                <FormDescription>Horas ya asignadas al proyecto</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <input type="hidden" {...form.register('campusAllocationId')} />
        <input type="hidden" {...form.register('directorId')} />

        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={loading || !hasCampusAllocations || !hasDirectors}>
            {loading ? 'Guardando...' : project ? 'Actualizar' : 'Crear Proyecto'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
