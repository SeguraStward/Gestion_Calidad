/* eslint-disable react/display-name */
'use client'

import { ColumnUtilities, CrudModuleBase } from '@/app/(components)/crud'
import { CrudFormAdapter } from '@/app/(components)/crud/crud-form-adapter'
import { ColumnDef } from '@tanstack/react-table'
import { Status } from '@una-gc/database/prisma/generated/client'
import { Badge, Button, Card, CardContent, Progress } from '@una-gc/ui/components'
import {
  BookOpen,
  Building,
  CalendarDays,
  Clock,
  DoorOpen,
  GraduationCap,
  Hash,
  Loader2,
  Pencil,
  Trash2,
  Users,
  UsersRound
} from 'lucide-react'
import { useMemo } from 'react'
import {
  useAcademicLoadList,
  useAcademicLoadOne,
  useCreateAcademicLoad,
  useRemoveAcademicLoad,
  useUpdateAcademicLoad
} from '../hooks'
import { useAcademicLoadFormData } from '../hooks/useAcademicLoadFormData'
import type { AcademicLoadWithRelations, UpdateAcademicLoadInput } from '../types/academic-load'

// Define the item base for CrudModuleBase
interface AcademicLoadItem extends AcademicLoadWithRelations {}

const AcademicLoadPage = () => {
  // Usar el hook correcto para datos de formulario
  const formDataProps = useAcademicLoadFormData()

  // Definición de columnas para la tabla de cargas académicas
  const renderColumns = useMemo(
    () =>
      (utils: ColumnUtilities): ColumnDef<AcademicLoadItem>[] => [
        {
          accessorKey: 'nrc',
          header: 'NRC',
          size: 100,
          cell: ({ row }) => (
            <div className="flex items-center">
              <Hash className="h-4 w-4 text-primary mr-2" />
              <span>{row.original.nrc}</span>
            </div>
          )
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
          accessorKey: 'group.number',
          header: 'Grupo',
          size: 80,
          cell: ({ row }) => (
            <div className="flex items-center">
              <UsersRound className="h-4 w-4 text-primary mr-2" />
              <span>{row.original.group?.number || 'Sin grupo'}</span>
            </div>
          )
        },
        {
          accessorKey: 'enrolledCapacity',
          header: 'Cupos',
          size: 100,
          cell: ({ row }) => {
            const max = row.original.maximumCapacity || 0
            const enrolled = row.original.enrolledCapacity || 0
            const available = max - enrolled
            const fillPercentage = max > 0 ? (enrolled / max) * 100 : 0
            let textColorClass = 'text-emerald-600 dark:text-emerald-400'
            let progressColorClass = ''

            if (fillPercentage >= 90) {
              textColorClass = 'text-red-600 dark:text-red-400'
              progressColorClass = 'bg-red-500'
            } else if (fillPercentage >= 75) {
              textColorClass = 'text-amber-600 dark:text-amber-400'
              progressColorClass = 'bg-amber-500'
            } else {
              progressColorClass = 'bg-emerald-500'
            }

            return (
              <div className="flex flex-col">
                <span className={textColorClass}>
                  {enrolled}/{max} <span className="text-xs">({available} disp.)</span>
                </span>
                <Progress value={fillPercentage} className={`h-1.5 mt-1 ${progressColorClass}`} />
              </div>
            )
          }
        },
        {
          accessorKey: 'classroom.roomNumber',
          header: 'Aula',
          size: 120,
          cell: ({ row }) => (
            <div className="flex items-center">
              <DoorOpen className="h-4 w-4 text-primary mr-2" />
              <span>{row.original.classroom?.roomNumber || 'Sin aula'}</span>
            </div>
          )
        },
        {
          accessorKey: 'schedule.day',
          header: 'Horario',
          size: 120,
          cell: ({ row }) => {
            const schedule = row.original.schedule
            return (
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-primary mr-2" />
                <span>{schedule ? `${schedule.day || ''} ${schedule.startTime}-${schedule.endTime}` : 'Sin horario'}</span>
              </div>
            )
          }
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
          size: 90,
          cell: ({ row }) => (
            <div className="text-right flex gap-1 justify-end min-w-[80px]">
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => utils.onEdit(row.original.id)}
                title="Editar"
                disabled={utils.isProcessing}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
                title="Eliminar"
                disabled={
                  utils.isProcessing || (utils.deleteOperation.isPending && utils.deleteOperation.variables === row.original.id)
                }
                onClick={() => utils.onDelete(row.original.id)}
              >
                {utils.isProcessing ||
                (utils.deleteOperation.isPending && utils.deleteOperation.variables === row.original.id) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          )
        }
      ],
    []
  ) // Función para renderizar el formulario de creación/edición
  const renderForm = useMemo(() => {
    return ({ control, errors, editingItem, isUpdate, handleSubmitForm, handleCancel, isProcessing }: any) => {
      const formData = formDataProps
      // Aquí defines las secciones y campos del formulario usando CrudFormAdapter
      return (
        <CrudFormAdapter
          control={control}
          errors={errors}
          editingItem={editingItem}
          isUpdate={isUpdate}
          isProcessing={isProcessing}
          handleSubmitForm={handleSubmitForm}
          handleCancel={handleCancel}
          title={isUpdate ? 'Editar Carga Académica' : 'Crear Nueva Carga Académica'}
          description={
            isUpdate ? 'Actualice los datos de la carga académica' : 'Complete los datos para registrar una nueva carga académica'
          }
          sections={() => [
            {
              title: 'Datos Generales',
              fields: [
                {
                  type: 'text',
                  name: 'nrc',
                  label: 'NRC',
                  required: true,
                  placeholder: 'Ej: 12345',
                  helperText: 'Número de referencia del curso'
                },
                {
                  type: 'select',
                  name: 'courseId',
                  label: 'Curso',
                  required: true,
                  options: formData.courses.map((c: any) => ({ id: c.id, name: c.name })),
                  isLoading: formData.isLoadingCourses,
                  placeholder: formData.isLoadingCourses ? 'Cargando cursos...' : 'Seleccionar curso',
                  helperText: 'Curso asociado a la carga académica'
                },
                {
                  type: 'select',
                  name: 'professorId',
                  label: 'Profesor',
                  required: true,
                  options: formData.professors.map((p: any) => ({ id: p.id, name: p.name })),
                  isLoading: formData.isLoadingProfessors,
                  placeholder: formData.isLoadingProfessors ? 'Cargando profesores...' : 'Seleccionar profesor',
                  helperText: 'Profesor asignado'
                },
                {
                  type: 'select',
                  name: 'academicCycleId',
                  label: 'Ciclo Académico',
                  required: true,
                  options: formData.academicCycles.map((ac: any) => ({ id: ac.id, name: ac.name })),
                  isLoading: formData.isLoadingAcademicCycles,
                  placeholder: formData.isLoadingAcademicCycles ? 'Cargando ciclos...' : 'Seleccionar ciclo académico',
                  helperText: 'Ciclo académico'
                },
                {
                  type: 'select',
                  name: 'campusId',
                  label: 'Campus',
                  required: true,
                  options: formData.campuses.map((c: any) => ({ id: c.id, name: c.name })),
                  isLoading: formData.isLoadingCampuses,
                  placeholder: formData.isLoadingCampuses ? 'Cargando campus...' : 'Seleccionar campus',
                  helperText: 'Campus donde se imparte'
                },
                {
                  type: 'select',
                  name: 'groupId',
                  label: 'Grupo',
                  required: true,
                  options: formData.groups.map((g: any) => ({ id: g.id, name: g.name || g.number })),
                  isLoading: formData.isLoadingGroups,
                  placeholder: formData.isLoadingGroups ? 'Cargando grupos...' : 'Seleccionar grupo',
                  helperText: 'Grupo asignado'
                },
                {
                  type: 'select',
                  name: 'classroomId',
                  label: 'Aula',
                  options: formData.classrooms,
                  isLoading: formData.isLoadingClassrooms,
                  placeholder: formData.isLoadingClassrooms ? 'Cargando aulas...' : 'Seleccionar aula',
                  helperText: 'Aula física (opcional)'
                },
                {
                  type: 'select',
                  name: 'scheduleId',
                  label: 'Horario',
                  options: formData.schedules.map((s: any) => ({
                    id: s.id,
                    name: `${s.day || s.dayOfWeek || ''} ${s.startTime}-${s.endTime}`
                  })),
                  isLoading: formData.isLoadingSchedules,
                  placeholder: formData.isLoadingSchedules ? 'Cargando horarios...' : 'Seleccionar horario',
                  helperText: 'Horario asignado (opcional)'
                },
                {
                  type: 'number',
                  name: 'maximumCapacity',
                  label: 'Cupo Máximo',
                  required: true,
                  min: 1,
                  helperText: 'Cantidad máxima de estudiantes'
                },
                {
                  type: 'number',
                  name: 'enrolledCapacity',
                  label: 'Cupo Inscrito',
                  required: true,
                  min: 0,
                  helperText: 'Cantidad de estudiantes inscritos'
                },
                {
                  type: 'select',
                  name: 'status',
                  label: 'Estado',
                  required: true,
                  options: [
                    { id: Status.ACTIVE, name: 'Activo' },
                    { id: Status.INACTIVE, name: 'Inactivo' }
                  ],
                  helperText: 'Estado de la carga académica'
                },
                {
                  type: 'date',
                  name: 'date',
                  label: 'Fecha',
                  required: true,
                  helperText: 'Fecha de inicio'
                }
              ]
            }
          ]}
        />
      )
    }
  }, [formDataProps])
  // Configuración del componente CrudModuleBase
  const crudConfig = useMemo(
    () => ({
      entityName: 'Carga Académica',
      entityNamePlural: 'Cargas Académicas',
      searchPlaceholder: 'Buscar por curso, profesor, NRC...',
      usePaginatedQuery: useAcademicLoadList,
      useCreateMutation: useCreateAcademicLoad,
      useUpdateMutation: useUpdateAcademicLoad,
      useDeleteMutation: useRemoveAcademicLoad,
      useOneQuery: useAcademicLoadOne,
      filterConfig: [
        {
          key: 'academicCycleId',
          label: 'Ciclo Académico',
          type: 'select' as const,
          placeholder: 'Todos los ciclos',
          options: [
            { value: 'ALL', label: 'Todos' },
            ...formDataProps.academicCycles.map((c: any) => ({ value: c.id, label: c.name }))
          ]
        },
        {
          key: 'courseId',
          label: 'Curso',
          type: 'select' as const,
          placeholder: 'Todos los cursos',
          options: [
            { value: 'ALL', label: 'Todos' },
            ...formDataProps.courses.map((c: any) => ({ value: c.id, label: `${c.code ?? ''} – ${c.name}` }))
          ]
        },
        {
          key: 'professorId',
          label: 'Profesor',
          type: 'select' as const,
          placeholder: 'Todos los profesores',
          options: [
            { value: 'ALL', label: 'Todos' },
            ...formDataProps.professors.map((p: any) => ({
              value: p.id,
              label: p.name ?? `${p.fullName ?? ''} ${p.fullLastName ?? ''}`.trim()
            }))
          ]
        },
        {
          key: 'status',
          label: 'Estado',
          type: 'select' as const,
          placeholder: 'Todos',
          options: [
            { value: 'ALL', label: 'Todos' },
            { value: 'ACTIVE', label: 'Activo' },
            { value: 'INACTIVE', label: 'Inactivo' }
          ]
        }
      ],
      defaultFormValues: {
        nrc: '',
        maximumCapacity: 30,
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
      },
      renderForm,
      renderColumns,
      // Procesar los items para la edición, asegurando que las fechas y relaciones estén correctas
      processItemForEditing: (item: AcademicLoadItem) => {
        console.log('Processing item for editing:', item) // Debug log

        let processedDate = new Date()
        if (item.date) {
          try {
            processedDate = typeof item.date === 'string' ? new Date(item.date) : item.date
            // Verificar si la fecha es válida
            if (isNaN(processedDate.getTime())) {
              processedDate = new Date()
            }
          } catch (error) {
            console.warn('Error processing date:', error)
            processedDate = new Date()
          }
        }

        return {
          ...item,
          date: processedDate,
          academicCycleId: item.academicCycleId || item.academicCycle?.id || '',
          campusId: item.campusId || item.campus?.id || '',
          courseId: item.courseId || item.course?.id || '',
          classroomId: item.classroomId || item.classroom?.id || null,
          groupId: item.groupId || item.group?.id || '',
          scheduleId: item.scheduleId || item.schedule?.id || null,
          professorId: item.professorId || item.professor?.id || ''
        } as unknown as UpdateAcademicLoadInput
      }, // Procesar el item para su visualización en la tabla
      processItem: (item: AcademicLoadItem) => {
        return {
          ...item,
          // Calcular campos adicionales o formatear datos si es necesario
          availableSeats: item.maximumCapacity - item.enrolledCapacity
        }
      },
      // Validación pre-eliminación
      preDeleteCheck: () => {
        // Por ahora, permitir eliminar todas las cargas académicas
        // En el futuro, aquí podrías verificar si hay estudiantes realmente matriculados
        // consultando una tabla de matrículas o inscripciones

        // Ejemplo de validaciones que podrías implementar:
        // - Verificar si la carga tiene calificaciones registradas
        // - Verificar si hay reportes finales
        // - Verificar fechas (no eliminar cargas del periodo actual, etc.)

        return null // Permitir eliminación
      }
    }),
    [renderForm, renderColumns, formDataProps]
  )

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 rounded-full bg-primary/10 mr-4 icon-bounce">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Gestión de Cargas Académicas
            </h1>
            <div className="flex items-center justify-center mt-2">
              <Badge variant="secondary" className="text-xs">
                Administrar Asignaciones
              </Badge>
            </div>
          </div>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Administre y configure las cargas académicas, asignaciones de profesores, cursos y horarios.
        </p>
      </div>

      {/* Content Card */}
      <Card className="border-0 shadow-sm glass-effect">
        <CardContent className="p-6">
          <CrudModuleBase {...crudConfig} />
        </CardContent>
      </Card>
    </div>
  )
}

export { AcademicLoadPage }
