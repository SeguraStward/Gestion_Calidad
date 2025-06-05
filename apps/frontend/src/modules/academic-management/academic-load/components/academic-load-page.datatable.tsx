'use client'

import { useState } from 'react'
import { CrudModuleBase, ColumnUtilities } from '@/app/(components)/crud/crud-module-base'
import { CrudFormAdapter, FormSection } from '@/app/(components)/crud/crud-form-adapter'
import {
  useAcademicLoadList,
  useCreateAcademicLoad,
  useUpdateAcademicLoad,
  useRemoveAcademicLoad,
  useAcademicLoadOne
} from '../hooks/useAcademicLoadCrud'
import { useAcademicLoadFormData } from '../hooks/useAcademicLoad'
import type { AcademicLoadWithRelations, CreateAcademicLoadInput, UpdateAcademicLoadInput } from '../types/academic-load'
import { Status } from '@una-gc/database/prisma/generated/client'
import { ColumnDef } from '@tanstack/react-table'
import {
  BookOpen,
  Users,
  Building,
  CalendarDays,
  UsersRound,
  Hash,
  Clock,
  DoorOpen,
  Pencil,
  Trash2,
  MoreHorizontal,
  Loader2
} from 'lucide-react'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Badge,
  Calendar
} from '@una-gc/ui/components'
import { UseFormReturn } from 'react-hook-form'

// Define the item base for CrudModuleBase
interface AcademicLoadItem extends AcademicLoadWithRelations {}

export const AcademicLoadPage = () => {
  const formDataProps = useAcademicLoadFormData()

  // Sample column definition
  const renderColumns = (utils: ColumnUtilities<AcademicLoadItem>): ColumnDef<AcademicLoadItem>[] => [
    {
      accessorKey: 'nrc',
      header: 'NRC',
      size: 100
    },
    {
      accessorKey: 'course.name',
      header: 'Curso',
      size: 200,
      cell: ({ row }) => (
        <div className="flex items-center">
          <BookOpen className="h-4 w-4 text-primary mr-2" />
          <span className="truncate">{row.original.course?.name || 'Sin curso'}</span>
        </div>
      )
    },
    {
      accessorKey: 'professor.fullName',
      header: 'Profesor',
      size: 180,
      cell: ({ row }) => (
        <div className="flex items-center">
          <Users className="h-4 w-4 text-primary mr-2" />
          <span className="truncate">{row.original.professor?.fullName || 'Sin profesor'}</span>
        </div>
      )
    },
    {
      accessorKey: 'academicCycle.name',
      header: 'Ciclo',
      size: 120,
      cell: ({ row }) => (
        <div className="flex items-center">
          <CalendarDays className="h-4 w-4 text-primary mr-2" />
          <span>{row.original.academicCycle?.name || 'Sin ciclo'}</span>
        </div>
      )
    },
    {
      accessorKey: 'campus.name',
      header: 'Campus',
      size: 120,
      cell: ({ row }) => (
        <div className="flex items-center">
          <Building className="h-4 w-4 text-primary mr-2" />
          <span>{row.original.campus?.name || 'Sin campus'}</span>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      size: 100,
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge
            variant={status === Status.ACTIVE ? 'outline' : 'secondary'}
            className={
              status === Status.ACTIVE
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : ''
            }
          >
            {status === Status.ACTIVE ? 'Activo' : 'Inactivo'}
          </Badge>
        )
      }
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Acciones</div>,
      size: 80,
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  utils.onEdit(row.original.id)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  utils.onDelete(row.original.id)
                }}
                className="text-red-600 hover:!text-red-600 hover:!bg-red-100 dark:hover:!bg-red-900/50"
                disabled={utils.deleteOperation.isPending && utils.deleteOperation.variables === row.original.id}
              >
                {utils.deleteOperation.isPending && utils.deleteOperation.variables === row.original.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  const renderForm = (props: any) => {
    const formData = formDataProps

    // Define las secciones del formulario
    const getSections = ({
      control,
      errors,
      editingItem,
      isUpdate
    }: any): FormSection<CreateAcademicLoadInput | UpdateAcademicLoadInput>[] => [
      {
        title: 'Información Básica',
        fields: [
          {
            type: 'text',
            name: 'nrc',
            label: 'NRC',
            required: true,
            placeholder: 'Ingrese el NRC'
          },
          {
            type: 'number',
            name: 'maximumCapacity',
            label: 'Capacidad Máxima',
            required: true,
            min: 0,
            className: 'col-span-1'
          },
          {
            type: 'number',
            name: 'enrolledCapacity',
            label: 'Matriculados',
            required: true,
            min: 0,
            className: 'col-span-1'
          },
          {
            type: 'number',
            name: 'availableSeats',
            label: 'Cupos Disponibles',
            disabled: true,
            className: 'col-span-1'
          }
        ]
      },
      {
        title: 'Asignaciones Principales',
        fields: [
          {
            type: 'select',
            name: 'courseId',
            label: 'Curso',
            required: true,
            options: formData.courses.map((c) => ({ id: c.id, name: c.name })),
            isLoading: formData.isLoadingCourses,
            placeholder: formData.isLoadingCourses ? 'Cargando cursos...' : 'Seleccionar curso'
          },
          {
            type: 'select',
            name: 'professorId',
            label: 'Profesor',
            required: true,
            options: formData.professors.map((p) => ({ id: p.id, name: p.name })),
            isLoading: formData.isLoadingProfessors,
            placeholder: formData.isLoadingProfessors ? 'Cargando profesores...' : 'Seleccionar profesor'
          }
        ]
      },
      {
        title: 'Ubicación y Periodo',
        fields: [
          {
            type: 'select',
            name: 'academicCycleId',
            label: 'Ciclo Académico',
            required: true,
            options: formData.academicCycles.map((ac) => ({ id: ac.id, name: ac.name })),
            isLoading: formData.isLoadingAcademicCycles,
            placeholder: formData.isLoadingAcademicCycles ? 'Cargando ciclos...' : 'Seleccionar ciclo académico'
          },
          {
            type: 'select',
            name: 'campusId',
            label: 'Campus',
            required: true,
            options: formData.campuses.map((c) => ({ id: c.id, name: c.name })),
            isLoading: formData.isLoadingCampuses,
            placeholder: formData.isLoadingCampuses ? 'Cargando campus...' : 'Seleccionar campus'
          }
        ]
      },
      {
        title: 'Detalles de Grupo y Aula',
        fields: [
          {
            type: 'select',
            name: 'groupId',
            label: 'Grupo',
            required: true,
            options: formData.groups.map((g) => ({ id: g.id, name: g.name })),
            isLoading: formData.isLoadingGroups,
            placeholder: formData.isLoadingGroups ? 'Cargando grupos...' : 'Seleccionar grupo'
          },
          {
            type: 'select',
            name: 'classroomId',
            label: 'Aula (Opcional)',
            options: formData.classrooms.map((cl) => ({ id: cl.id, name: cl.name })),
            isLoading: formData.isLoadingClassrooms,
            placeholder: formData.isLoadingClassrooms ? 'Cargando aulas...' : 'Seleccionar aula'
          }
        ]
      },
      {
        title: 'Horario y Estado',
        fields: [
          {
            type: 'select',
            name: 'scheduleId',
            label: 'Horario (Opcional)',
            options: formData.schedules.map((s) => ({ id: s.id, name: s.name })),
            isLoading: formData.isLoadingSchedules,
            placeholder: formData.isLoadingSchedules ? 'Cargando horarios...' : 'Seleccionar horario'
          },
          {
            type: 'select',
            name: 'status',
            label: 'Estado',
            required: true,
            options: Object.values(Status).map((s) => ({ id: s, name: s === Status.ACTIVE ? 'Activo' : 'Inactivo' }))
          }
        ]
      },
      {
        title: 'Fecha de Inicio',
        fields: [
          {
            type: 'custom',
            name: 'date',
            label: 'Seleccione la fecha de inicio (Opcional)',
            render: ({ field }) => (
              <div className="border rounded-md p-3 mt-2 max-w-md mx-auto">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => field.onChange(date)}
                  disabled={(date) => date < new Date('2000-01-01')}
                  initialFocus
                  className="rounded-md border"
                />
              </div>
            )
          }
        ]
      }
    ]

    // Usar el adaptador de formularios
    return (
      <CrudFormAdapter
        {...props}
        title={props.isUpdate ? 'Editar Carga Académica' : 'Crear Nueva Carga Académica'}
        description={
          props.isUpdate
            ? 'Actualice los datos de la carga académica'
            : 'Complete los datos para registrar una nueva carga académica'
        }
        sections={getSections}
      />
    )
  }

  const crudConfig = {
    entityName: 'Carga Académica',
    entityNamePlural: 'Cargas Académicas',
    searchPlaceholder: 'Buscar por curso, profesor, NRC...',
    usePaginatedQuery: useAcademicLoadList,
    useCreateMutation: useCreateAcademicLoad,
    useUpdateMutation: useUpdateAcademicLoad,
    useDeleteMutation: useRemoveAcademicLoad,
    useOneQuery: useAcademicLoadOne,
    defaultFormValues: {
      nrc: '',
      maximumCapacity: 0,
      enrolledCapacity: 0,
      date: new Date(),
      status: Status.ACTIVE,
      academicCycleId: '',
      campusId: '',
      courseId: '',
      classroomId: null,
      groupId: '',
      scheduleId: null,
      professorId: ''
    } as CreateAcademicLoadInput,
    renderForm,
    renderColumns,
    processItemForEditing: (item) => {
      return {
        ...item,
        date: item.date ? new Date(item.date) : new Date(),
        academicCycleId: item.academicCycleId,
        campusId: item.campusId,
        courseId: item.courseId,
        classroomId: item.classroomId,
        groupId: item.groupId,
        scheduleId: item.scheduleId,
        professorId: item.professorId
      } as UpdateAcademicLoadInput
    }
  }

  return <CrudModuleBase {...crudConfig} />
}
