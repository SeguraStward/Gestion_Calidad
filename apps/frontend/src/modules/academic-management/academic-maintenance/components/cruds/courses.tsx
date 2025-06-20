'use client'

import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { CrudModuleBase, ColumnUtilities } from '@/app/(components)/crud/crud-module-base'
import { CrudFormAdapter } from '@/app/(components)/crud/crud-form-adapter'
import {
  useCreateCourse,
  useUpdateCourse,
  useRemoveCourse,
  useOneCourse,
  useListCoursesPaginated
} from '@/shared/hooks/useCourses'
import { useListCareersFlat } from '@/modules/academic-management/academic-maintenance/hooks/useCareer'
import { CourseWithRelations, CreateCourseInput, StrictCreateCourseInput, StrictCreateCourseOutput } from '@/shared/types/course'
import { Status } from '@/shared/types/status'
import { Badge, Button } from '@una-gc/ui/components'
import { Hash, BookUser, GraduationCap, Pencil, Trash2, Loader2, CheckCircle2, XCircle } from 'lucide-react'

interface CourseItem extends CourseWithRelations {}

const STATUS_OPTIONS = [
  {
    id: Status.ACTIVE,
    name: 'Activo',
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />,
    description: 'El curso está operativo y visible en el sistema'
  },
  {
    id: Status.INACTIVE,
    name: 'Inactivo',
    icon: <XCircle className="h-4 w-4 text-red-500 mr-2" />,
    description: 'El curso no está operativo y permanecerá oculto'
  }
]

export default function CourseCrud() {
  // Careers for select
  const { data: careers, isLoading: isLoadingCareers } = useListCareersFlat()

  // Table columns
  const renderColumns = useMemo(
    () =>
      (utils: ColumnUtilities<CourseItem>): ColumnDef<CourseItem>[] => [
        {
          accessorKey: 'code',
          header: 'Código',
          size: 80,
          cell: ({ row }) => (
            <div className="flex items-center min-w-[60px] max-w-[90px]">
              <Hash className="h-4 w-4 text-primary mr-2" />
              <span>{row.original.code}</span>
            </div>
          )
        },
        {
          accessorKey: 'name',
          header: 'Nombre',
          size: 180,
          cell: ({ row }) => (
            <div className="flex items-center min-w-[120px] max-w-[200px] truncate whitespace-nowrap">
              <BookUser className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
              <span className="font-medium">{row.original.name}</span>
            </div>
          )
        },
        {
          accessorKey: 'career.name',
          header: 'Carrera',
          size: 140,
          cell: ({ row }) => {
            const name = row.original.career?.name || 'Sin asignar'
            return (
              <div className="flex items-center min-w-[80px] max-w-[140px] truncate whitespace-nowrap">
                <GraduationCap className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                <span>{name}</span>
              </div>
            )
          }
        },
        {
          accessorKey: 'credits',
          header: 'Créditos',
          size: 70,
          cell: ({ row }) => (
            <div className="flex items-center justify-center min-w-[30px] max-w-[50px]">
              <span className="font-semibold text-center w-full">{row.original.credits}</span>
            </div>
          )
        },
        {
          accessorKey: 'level',
          header: 'Nivel',
          size: 70,
          cell: ({ row }) => (
            <div className="flex items-center justify-center min-w-[30px] max-w-[50px]">
              <span className="font-semibold text-center w-full">{row.original.level}</span>
            </div>
          )
        },
        {
          accessorKey: 'contactHours',
          header: 'Horas Contacto',
          size: 90,
          cell: ({ row }) => (
            <div className="flex items-center justify-center min-w-[30px] max-w-[60px]">
              <span className="font-semibold text-center w-full">{row.original.contactHours}</span>
            </div>
          )
        },
        {
          accessorKey: 'independentHours',
          header: 'Horas Independientes',
          size: 110,
          cell: ({ row }) => (
            <div className="flex items-center justify-center min-w-[30px] max-w-[70px]">
              <span className="font-semibold text-center w-full">{row.original.independentHours ?? 0}</span>
            </div>
          )
        },
        {
          accessorKey: 'academicLoads',
          header: 'Cargas Académicas',
          size: 100,
          cell: ({ row }) => (
            <div className="flex items-center justify-center min-w-[30px] max-w-[60px]">
              <span className="font-semibold text-center w-full">
                {Array.isArray(row.original.academicLoads) ? row.original.academicLoads.length : 0}
              </span>
            </div>
          )
        },
        {
          accessorKey: 'status',
          header: 'Estado',
          size: 80,
          cell: ({ row }) => {
            const status = row.original.status
            let badgeClasses = ''
            let statusText = ''
            if (status === Status.ACTIVE) {
              badgeClasses =
                'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              statusText = 'Activo'
            } else {
              badgeClasses = 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-800'
              statusText = 'Inactivo'
            }
            return (
              <Badge variant="outline" className={badgeClasses}>
                {statusText}
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
              <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => utils.onEdit(row.original.id)} title="Editar">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
                title="Eliminar"
                onClick={() => utils.onDelete(row.original.id)}
                disabled={utils.isProcessing}
              >
                {utils.isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          )
        }
      ],
    []
  )

  // Form sections for create/edit
  const renderForm = useMemo(() => {
    function CourseCrudForm({ control, errors, editingItem, isUpdate, handleSubmitForm, handleCancel, isProcessing }: any) {
      return (
        <CrudFormAdapter
          control={control}
          errors={errors}
          editingItem={editingItem}
          isUpdate={isUpdate}
          isProcessing={isProcessing}
          handleSubmitForm={handleSubmitForm}
          handleCancel={handleCancel}
          title={isUpdate ? 'Editar Curso' : 'Crear Nuevo Curso'}
          description={isUpdate ? 'Actualice los datos del curso' : 'Complete los datos para registrar un nuevo curso'}
          sections={() => [
            {
              title: 'Datos del Curso',
              description: 'Información principal del curso',
              fields: [           
               { 
                  type: 'text',
                  name: 'code',
                  label: 'Código',
                  required: true,
                  placeholder: 'Ej: CS101',
                  helperText: 'Código único del curso',
                  rules: {
                    required: { value: true, message: 'El código es requerido' },
                    minLength: { value: 2, message: 'El código debe tener al menos 2 caracteres' },
                    maxLength: { value: 20, message: 'El código no puede exceder 20 caracteres' },
                    pattern: { value: /^[A-Za-z0-9\-_]+$/, message: 'Solo letras, números, guiones y guiones bajos' }
                  },
                  disabled: isUpdate
                },
                {
                  type: 'text',
                  name: 'name',
                  label: 'Nombre',
                  required: true,
                  placeholder: 'Ej: Programación I',
                  helperText: 'Nombre completo del curso',
                  rules: {
                    required: { value: true, message: 'El nombre es requerido' },
                    minLength: { value: 3, message: 'El nombre debe tener al menos 3 caracteres' },
                    maxLength: { value: 100, message: 'El nombre no puede exceder 100 caracteres' }
                  }
                },
                {
                  type: 'text',
                  name: 'description',
                  label: 'Descripción',
                  required: false,
                  placeholder: 'Descripción del curso',
                  helperText: 'Breve descripción del curso (opcional)',
                  rules: {
                    minLength: { value: 3, message: 'La descripción debe tener al menos 3 caracteres' },
                    maxLength: { value: 500, message: 'La descripción no puede exceder 500 caracteres' }
                  }
                },
                {
                  type: 'number',
                  name: 'credits',
                  label: 'Créditos',
                  required: true,
                  placeholder: 'Ej: 4',
                  min: 1,
                  step: 1,
                  valueAsNumber: true,
                  helperText: 'Cantidad de créditos del curso',
                  rules: {
                    required: { value: true, message: 'Los créditos son requeridos' },
                    min: { value: 1, message: 'Los créditos deben ser 1 o mayor' },
                    max: { value: 20, message: 'Los créditos no pueden exceder 20' }
                  }
                },
                {
                  type: 'number',
                  name: 'level',
                  label: 'Nivel',
                  required: true,
                  placeholder: 'Ej: 1',
                  min: 1,
                  step: 1,
                  valueAsNumber: true,
                  helperText: 'Nivel académico del curso',
                  rules: {
                    required: { value: true, message: 'El nivel es requerido' },
                    min: { value: 1, message: 'El nivel mínimo es 1' },
                    max: { value: 10, message: 'El nivel máximo es 10' }
                  }
                },
                {
                  type: 'number',
                  name: 'contactHours',
                  label: 'Horas Contacto',
                  required: true,
                  placeholder: 'Ej: 32',
                  min: 1,
                  step: 1,
                  valueAsNumber: true,
                  helperText: 'Horas de contacto con el profesor',
                  rules: {
                    required: { value: true, message: 'Las horas de contacto son requeridas' },
                    min: { value: 1, message: 'Las horas de contacto deben ser 1 o mayor' },
                    max: { value: 200, message: 'Las horas de contacto no pueden exceder 200' }
                  }
                },
                {
                  type: 'number',
                  name: 'independentHours',
                  label: 'Horas Independientes',
                  required: false,
                  placeholder: 'Ej: 16',
                  min: 0,
                  step: 1,
                  valueAsNumber: true,
                  helperText: 'Horas de trabajo independiente del estudiante (opcional)',
                  rules: {
                    min: { value: 0, message: 'Las horas independientes no pueden ser negativas' },
                    max: { value: 200, message: 'Las horas independientes no pueden exceder 200' }
                  }
                },                {
                  type: 'select',
                  name: 'careerId',
                  label: 'Carrera',
                  required: true,
                  options: (careers || []).map((c: any) => ({ id: c.id, name: c.name || '', status: c.status })),
                  isLoading: isLoadingCareers,
                  placeholder: isLoadingCareers ? 'Cargando carreras...' : 'Seleccionar carrera',
                  helperText: 'Seleccione la carrera a la que pertenece este curso (opcional)',
                  rules: {
                    required: { value: true, message: 'La carrera es requerida' },
                  },
                  renderOption: (option: any) => (
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${option.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`}
                      ></span>
                      <span>{option.name}</span>
                      <span className={`ml-2 text-xs ${option.status === 'ACTIVE' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {option.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  )
                  
                },
                {
                  type: 'select',
                  name: 'status',
                  label: 'Estado',
                  required: true,
                  options: STATUS_OPTIONS,
                  helperText: 'Estado actual del curso',
                  rules: {
                    required: { value: true, message: 'El estado es requerido' }
                  },
                  renderOption: (option: any) => (
                    <div className="flex items-center">
                      {option.icon}
                      <span>{option.name}</span>
                    </div>
                  )
                }
              ]
            }
          ]}
        />
      )
    }
    CourseCrudForm.displayName = 'CourseCrudForm'
    return CourseCrudForm
  }, [careers, isLoadingCareers])

  const crudConfig = useMemo(
    () => ({
      entityName: 'Curso',
      entityNamePlural: 'Cursos',
      searchPlaceholder: 'Buscar por código, nombre o carrera...',
      usePaginatedQuery: useListCoursesPaginated,
      useCreateMutation: useCreateCourse,
      useUpdateMutation: useUpdateCourse,
      useDeleteMutation: useRemoveCourse,
      useOneQuery: (id: string, options?: any) => useOneCourse(id, undefined, options),
      defaultFormValues: {
        code: '',
        name: '',
        description: '',
        credits: 0,
        level: 0,
        contactHours: 0,
        independentHours: 0,
        careerId: '',
        status: Status.ACTIVE
      },
      renderForm,
      renderColumns,
      processItemForEditing: (item: CourseItem) => ({
        code: item.code || '',
        name: item.name || '',
        description: item.description || '',
        credits: typeof item.credits === 'number' ? item.credits : Number(item.credits) || 0,
        level: typeof item.level === 'number' ? item.level : Number(item.level) || 1,
        contactHours: typeof item.contactHours === 'number' ? item.contactHours : Number(item.contactHours) || 0,
        independentHours: typeof item.independentHours === 'number' ? item.independentHours : Number(item.independentHours) || 0,
        careerId: item.career?.id || '',
        status: item.status || Status.ACTIVE
      }),
      processFormValues: (
        values: CreateCourseInput | Partial<CreateCourseInput>
      ): CreateCourseInput | Partial<CreateCourseInput> => {
        const processed = {
          ...values,
          credits: Number(values.credits),
          level: Number(values.level),
          contactHours: Number(values.contactHours),
          independentHours: values.independentHours ? Number(values.independentHours) : undefined
        }
        // Log para depuración
        console.log('🟢 processFormValues (course) salida:', processed, {
          creditsType: typeof processed.credits,
          levelType: typeof processed.level,
          contactHoursType: typeof processed.contactHours,
          independentHoursType: typeof processed.independentHours
        })
        return processed
      },
      preDeleteCheck: (item: CourseItem) => {
        // Si tiene cargas académicas asociadas, advertir
        if (item.academicLoads && item.academicLoads.length > 0) {
          return 'No se puede eliminar un curso con cargas académicas asociadas.'
        }
        return null
      }
    }),
    [renderForm, renderColumns]
  )

  return <CrudModuleBase {...crudConfig} />
}
