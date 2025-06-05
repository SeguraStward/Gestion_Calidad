'use client'

import { useEffect, useState, useMemo } from 'react' // Added useMemo
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { GraduationCap } from 'lucide-react'

import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { Badge } from '@una-gc/ui/components/badge'
import { CrudLayout } from '@/app/(components)/crud/crud-layout'
import { FormLayout } from '@/app/(components)/form/form-layout'
import { FormField } from '@/app/(components)/form/field'
import { FormTextarea } from '@/app/(components)/form/textarea' // Assuming this exists
import { FormSelectMultiple } from '@/app/(components)/form/select-multiple' // Assuming this exists

import {
  useListFaculties,
  useOneFaculty,
  useCreateFaculty,
  useUpdateFaculty,
  useRemoveFaculty
} from '@/modules/academic-management/academic-maintenance/hooks/institutional/useFaculty'
// Assuming a hook for listing schools exists, similar to useListCampuses
// import { useListSchools } from '@/modules/academic-management/academic-maintenance/hooks/institutional/useSchool'
import {
  CreateFacultyInput,
  FacultyWithRelations
} from '@/modules/academic-management/academic-maintenance/types/institutional/faculty'

// Mock school data and hook if useListSchools doesn't exist yet
const useListSchools = () => ({
  data: {
    data: [
      { id: 'school1', name: 'Escuela de Informática' },
      { id: 'school2', name: 'Escuela de Matemática' }
    ]
  },
  isLoading: false
})

export default function FacultyCrud() {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null)

  const { data: faculties, refetch, isLoading: isLoadingList } = useListFaculties()

  const processedFaculties = useMemo(() => {
    return faculties
      ? faculties.map((faculty) => ({
          ...faculty,
          id: faculty.id || (faculty as any)._id, // Handle both id formats
          schools: faculty.schools || []
        }))
      : []
  }, [faculties])

  useEffect(() => {
    console.log('Faculties data:', faculties)
    console.log('Processed faculties data:', processedFaculties)
  }, [faculties, processedFaculties])

  const {
    mutate: createFaculty,
    isLoading: isCreating,
    error: createError
  } = useCreateFaculty({
    onSuccess: async () => {
      toast.success('Facultad creada exitosamente')
      await refetch()
      reset({
        code: '',
        name: '',
        description: '',
        schools: { connect: [] }
      })
    },
    onError: (error: any) => {
      console.error('Error al crear facultad:', error)
      toast.error(`Error al crear: ${error.message || 'Error desconocido'}`)
    }
  })

  const {
    mutate: updateFaculty,
    isLoading: isUpdating,
    error: updateError
  } = useUpdateFaculty({
    onSuccess: async () => {
      toast.success('Facultad actualizada exitosamente')
      setEditingId(null)
      await refetch()
      reset({
        code: '',
        name: '',
        description: '',
        schools: { connect: [] }
      })
    },
    onError: (error: any) => {
      console.error('Error al actualizar facultad:', error)
      toast.error(`Error al actualizar: ${error.message || 'Error desconocido'}`)
    }
  })

  const { mutate: removeFaculty, isLoading: isRemoving } = useRemoveFaculty({
    onSuccess: async () => {
      toast.success('Facultad eliminada exitosamente')
      await refetch()
    },
    onError: (error: any) => {
      console.error('Error al eliminar facultad:', error)
      toast.error(`Error al eliminar: ${error.message || 'Error desconocido'}`)
    }
  })

  const { data: editingItem } = useOneFaculty(editingId || '', undefined, {
    enabled: !!editingId
  })

  // Replace with actual useListSchools when available
  const { data: schoolsResponse, isLoading: loadingSchools } = useListSchools()
  const schoolsData = schoolsResponse?.data || []

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    register,
    formState: { errors }
  } = useForm<CreateFacultyInput>({
    defaultValues: {
      code: '',
      name: '',
      description: '',
      schools: { connect: [] }
    }
  })

  useEffect(() => {
    if (editingId && editingItem) {
      reset({
        code: editingItem.code,
        name: editingItem.name || '', // Ensure name is not undefined
        description: editingItem.description || '', // Ensure description is not undefined
        schools: {
          connect: editingItem.schools && editingItem.schools.length > 0 ? editingItem.schools.map((s) => ({ id: s.id })) : []
        }
      })
    } else if (!editingId) {
      reset({
        code: '',
        name: '',
        description: '',
        schools: { connect: [] }
      })
    }
  }, [editingId, editingItem, reset])

  const onSubmit = (data: CreateFacultyInput) => {
    try {
      const connectSchools = data.schools?.connect || []
      const payload = {
        ...data,
        schools: {
          connect: connectSchools.filter((s) => s && s.id)
        }
      }

      if (editingId) {
        updateFaculty({
          id: editingId,
          data: payload
        })
      } else {
        createFaculty(payload)
      }
    } catch (error) {
      console.error('Error en formulario:', error)
      toast.error('Error al procesar el formulario')
    }
  }

  useEffect(() => {
    if (createError) {
      console.error('Create error details:', createError)
    }
    if (updateError) {
      console.error('Update error details:', updateError)
    }
  }, [createError, updateError])

  return (
    <CrudLayout
      nombreEntidad="Facultad"
      items={processedFaculties}
      editandoId={editingId}
      idAEliminar={idAEliminar}
      isLoading={isLoadingList}
      setEditandoId={setEditingId}
      setIdAEliminar={setIdAEliminar}
      onDelete={(id) => {
        const validId = id?.toString()
        if (validId) {
          removeFaculty(validId)
        } else {
          toast.error('ID inválido para eliminación')
        }
        setIdAEliminar(null)
      }}
      getItemName={(f) => f.name || 'Facultad sin nombre'}
      renderForm={() => (
        <Card>
          <CardContent className="p-6">
            <FormLayout title={editingId ? 'Editar Facultad' : 'Registrar Facultad'} onSubmit={handleSubmit(onSubmit)}>
              <FormField
                id="code"
                name="code"
                control={control}
                label="Código"
                placeholder="Ej: FAC001"
                required
                rules={{
                  required: 'El código es obligatorio',
                  pattern: {
                    value: /^[A-Za-z0-9-]+$/,
                    message: 'El código solo puede contener letras, números y guiones'
                  }
                }}
                error={errors.code}
              />

              <FormField
                id="name"
                name="name"
                control={control}
                label="Nombre"
                placeholder="Ej: Facultad de Ciencias Exactas"
                required
                rules={{ required: 'El nombre es obligatorio' }}
                error={errors.name}
              />

              <FormTextarea
                id="description"
                label="Descripción"
                control={control} // Pass control for Controller-based FormTextarea
                name="description" // Pass name for Controller-based FormTextarea
                // register={register('description')} // Use this if FormTextarea is not Controller-based
                error={errors.description}
                placeholder="Detalles de la facultad..."
              />

              <Controller
                control={control}
                name="schools.connect"
                defaultValue={[]}
                // Add rules if schools are required, e.g.
                // rules={{ required: 'Debe seleccionar al menos una escuela' }}
                render={({ field }) => (
                  <FormSelectMultiple
                    label="Escuelas asignadas"
                    value={field.value || []}
                    options={schoolsData.map((s: any) => ({ id: s.id, name: s.name }))}
                    onChange={(newValue) => {
                      field.onChange(newValue || [])
                    }}
                    placeholder={loadingSchools ? 'Cargando escuelas...' : 'Seleccione una o más'}
                    disabled={loadingSchools}
                    error={errors?.schools?.connect as any} // Adjust error display as needed
                  />
                )}
              />

              <div className="flex justify-end gap-2 pt-6">
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null)
                      reset()
                    }}
                  >
                    Cancelar
                  </Button>
                )}
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? 'Procesando...' : editingId ? 'Actualizar' : 'Registrar'}
                </Button>
              </div>
            </FormLayout>
          </CardContent>
        </Card>
      )}
      renderItem={(faculty, isEditing, onEdit, onDelete) => (
        <Card key={faculty.id} className={`${isEditing ? 'ring-2 ring-blue-500' : ''} overflow-hidden`}>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{faculty.name || 'Facultad sin nombre'}</h3>
                <p className="text-sm text-muted-foreground font-mono">Código: {faculty.code}</p>
              </div>
              {isEditing && <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full shrink-0">Editando</span>}
            </div>

            {faculty.description && <p className="text-sm text-muted-foreground">{faculty.description}</p>}

            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span>Escuelas:</span>
              </div>
              {faculty.schools && faculty.schools.length > 0 ? (
                faculty.schools.map((school) => (
                  <Badge key={school.id} variant="secondary" className="font-normal">
                    {school.name || 'Escuela sin nombre'}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="font-normal">
                  Ninguna
                </Badge>
              )}
            </div>
            <div className="flex gap-2 border-t pt-3 mt-3">
              <Button size="sm" variant="outline" onClick={() => onEdit(faculty.id)}>
                Editar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(faculty.id)}
                disabled={isEditing || (faculty.schools && faculty.schools.length > 0)}
              >
                Eliminar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    />
  )
}
