'use client'

import { useCrud } from '@/modules/academic-management/academic-maintenance/hooks/useCrud'
import { CrudLayout } from '@/app/(components)/crud/crud-layout'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { FormLayout } from '@/app/(components)/form/form-layout'
import { FormField } from '@/app/(components)/form/field'
import { FormTextarea } from '@/app/(components)/form/textarea'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { useEffect } from 'react'
import { Classroom } from '@/modules/types/institutional/classroom'

export default function ClassroomsCrud() {
  const { items: classrooms, add, update, remove, editandoId, setEditandoId, idAEliminar, setIdAEliminar } = useCrud<Classroom>()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<Classroom>()

  useEffect(() => {
    if (editandoId) {
      const classroom = classrooms.find((a) => a.id === editandoId)
      if (classroom) {
        reset(classroom)
      }
    } else {
      reset()
    }
  }, [editandoId, classrooms, reset])

  const onSubmit = (data: Classroom) => {
    if (editandoId) {
      update(editandoId, data)
      toast.success('¡Aula actualizada!')
      setEditandoId(null)
    } else {
      add({ ...data, id: crypto.randomUUID() })
      toast.success('¡Aula registrada!')
    }

    reset({
      nombre: '',
      descripcion: '',
      capacidad: 0
    })
  }

  return (
    <CrudLayout
      nombreEntidad="Aula"
      items={classrooms}
      editandoId={editandoId}
      setEditandoId={setEditandoId}
      idAEliminar={idAEliminar}
      setIdAEliminar={setIdAEliminar}
      onDelete={remove}
      getItemName={(a) => a.nombre}
      renderForm={() => (
        <Card>
          <CardContent className="p-6">
            <FormLayout onSubmit={handleSubmit(onSubmit)} title={editandoId ? 'Editar Aula' : 'Registrar Aula'}>
              <FormField
                id="nombre"
                label="Nombre"
                control={control}
                name="nombre"
                required
                error={errors.nombre}
                placeholder="Ej: Aula 101"
                rules={{ required: 'El nombre es obligatorio' }}
              />

              <FormTextarea
                id="descripcion"
                label="Descripción"
                register={register('descripcion')}
                error={errors.descripcion}
                placeholder="Detalles del aula..."
              />

              <FormField
                id="capacidad"
                label="Capacidad"
                type="number"
                control={control}
                name="capacidad"
                required
                error={errors.capacidad}
                placeholder="Ej: 35"
                rules={{
                  required: 'La capacidad es obligatoria',
                  min: { value: 1, message: 'Debe ser al menos 1' }
                }}
              />

              <div className="flex justify-end gap-2 pt-6">
                {editandoId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditandoId(null)
                      reset({ nombre: '', descripcion: '', capacidad: 0 })
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
      renderItem={(aula, isEditing, onEdit, onDelete) => (
        <Card key={aula.id} className={isEditing ? 'ring-2 ring-blue-400' : ''}>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold">{aula.nombre}</h3>
              {isEditing && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Editando</span>}
            </div>
            <p className="text-sm text-muted-foreground">{aula.descripcion}</p>
            <p className="text-sm text-muted-foreground font-semibold">Capacidad: {aula.capacidad}</p>
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
