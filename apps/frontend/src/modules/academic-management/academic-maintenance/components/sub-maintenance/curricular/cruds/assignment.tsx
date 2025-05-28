'use client'

import { useCrud } from '@/modules/academic-management/academic-maintenance/hooks/useCrud'
import { CrudLayout } from '@/app/(components)/crud/crud-layout'
import { Assignment } from '@/modules/types/curricular/assignment'
import { Course } from '@/modules/types/curricular/course'
import { Professor } from '@/modules/types/curricular/professor'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { FormLayout } from '@/app/(components)/form/form-layout'
import { FormField } from '@/app/(components)/form/field'
import { FormTextarea } from '@/app/(components)/form/textarea'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { FormSelect } from '@/app/(components)/form/select'
import { useEffect } from 'react'

export default function AssignmentCrud() {
  const {
    items: assignments,
    add,
    update,
    remove,
    editandoId,
    setEditandoId,
    idAEliminar,
    setIdAEliminar
  } = useCrud<Assignment>()

  // Mock cursos
  const cursosMock: Course[] = [
    {
      id: '1',
      nombre: 'Fundamentos de Redes',
      codigo: 'INF-101',
      creditos: 3,
      descripcion: '',
      nivel: '100',
      programaId: '1',
      horasContacto: 60
    },
    {
      id: '2',
      nombre: 'Cálculo I',
      codigo: 'MAT-101',
      creditos: 4,
      descripcion: '',
      nivel: '100',
      programaId: '2',
      horasContacto: 60
    }
  ]

  // Mock profesores
  const profesoresMock: Professor[] = [
    { id: '1', nombre: 'Juan Pérez', apellido: 'Pérez', correo: 'juan.perez@example.com', departamento: 'Informática' },
    { id: '2', nombre: 'María López', apellido: 'López', correo: 'maria.lopez@example.com', departamento: 'Matemáticas' }
  ]

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<Assignment>()

  useEffect(() => {
    if (editandoId) {
      const asignacion = assignments.find((a) => a.id === editandoId)
      if (asignacion) reset(asignacion)
    } else {
      reset()
    }
  }, [editandoId, assignments, reset])

  const onSubmit = (data: Assignment) => {
    if (editandoId) {
      update(editandoId, data)
      toast.success('¡Asignación actualizada, mae!')
      setEditandoId(null)
    } else {
      add({ ...data, id: crypto.randomUUID() })
      toast.success('¡Asignación registrada, pura vida!')
    }

    reset({
      nombre: '',
      descripcion: '',
      cursoId: '',
      profesorId: ''
    })
  }

  return (
    <CrudLayout
      nombreEntidad="Asignación"
      items={assignments}
      editandoId={editandoId}
      setEditandoId={setEditandoId}
      idAEliminar={idAEliminar}
      setIdAEliminar={setIdAEliminar}
      onDelete={remove}
      getItemName={(a) => a.nombre}
      renderForm={() => (
        <Card>
          <CardContent className="p-6">
            <FormLayout onSubmit={handleSubmit(onSubmit)} title={editandoId ? 'Editar Asignación' : 'Registrar Asignación'}>
              <FormField
                id="nombre"
                label="Nombre"
                control={control}
                name="nombre"
                required
                error={errors.nombre}
                placeholder="Ej: Proyecto Final de Redes"
                rules={{ required: 'El nombre es obligatorio' }}
              />

              <FormTextarea
                id="descripcion"
                label="Descripción"
                register={register('descripcion')}
                error={errors.descripcion}
                placeholder="Detalles de la asignación..."
              />

              <div className="pt-4">
                <Controller
                  control={control}
                  name="cursoId"
                  rules={{ required: 'El curso es obligatorio' }}
                  render={({ field }) => (
                    <FormSelect
                      label="Curso"
                      value={field.value || null}
                      options={cursosMock.map((c) => ({ id: c.id, name: c.nombre }))}
                      onChange={field.onChange}
                      placeholder="Seleccione un curso"
                      error={errors.cursoId}
                    />
                  )}
                />
                {errors.cursoId && <p className="text-red-600 text-sm mt-1">{errors.cursoId.message}</p>}
              </div>

              <div className="pt-4">
                <Controller
                  control={control}
                  name="profesorId"
                  rules={{ required: 'El profesor es obligatorio' }}
                  render={({ field }) => (
                    <FormSelect
                      label="Profesor"
                      value={field.value || null}
                      options={profesoresMock.map((p) => ({ id: p.id, name: p.nombre }))}
                      onChange={field.onChange}
                      placeholder="Seleccione un profesor"
                      error={errors.profesorId}
                    />
                  )}
                />
                {errors.profesorId && <p className="text-red-600 text-sm mt-1">{errors.profesorId.message}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                {editandoId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditandoId(null)
                      reset({
                        nombre: '',
                        descripcion: '',
                        cursoId: '',
                        profesorId: ''
                      })
                    }}
                  >
                    Cancelar
                  </Button>
                )}
                <Button type="submit">{editandoId ? 'Actualizar' : 'Registrar'}</Button>
              </div>
            </FormLayout>
          </CardContent>
        </Card>
      )}
      renderItem={(asignacion, isEditing, onEdit, onDelete) => (
        <Card key={asignacion.id} className={isEditing ? 'ring-2 ring-blue-500' : ''}>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold">{asignacion.nombre}</h3>
              {isEditing && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Editando</span>}
            </div>
            <p className="text-sm text-muted-foreground">{asignacion.descripcion}</p>
            <p className="text-sm font-semibold">Curso: {cursosMock.find((c) => c.id === asignacion.cursoId)?.nombre || 'N/A'}</p>
            <p className="text-sm font-semibold">
              Profesor: {profesoresMock.find((p) => p.id === asignacion.profesorId)?.nombre || 'N/A'}
            </p>
            <div className="flex gap-2 border-t pt-2">
              <Button size="sm" variant="outline" onClick={onEdit}>
                Editar
              </Button>
              <Button size="sm" variant="destructive" onClick={onDelete} disabled={isEditing}>
                Eliminar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    />
  )
}
