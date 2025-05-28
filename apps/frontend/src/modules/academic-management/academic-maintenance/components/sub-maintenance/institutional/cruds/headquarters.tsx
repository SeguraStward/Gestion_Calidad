'use client'

import { useCrud } from '@/modules/academic-management/academic-maintenance/hooks/useCrud'
import { CrudLayout } from '@/app/(components)/crud/crud-layout'
import { Headquarter } from '@/modules/types/institutional/headquarter'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { FormLayout } from '@/app/(components)/form/form-layout'
import { FormField } from '@/app/(components)/form/field'
import { FormTextarea } from '@/app/(components)/form/textarea'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { useEffect } from 'react'

export default function HeadquartersCrud() {
  const { items: sedes, add, update, remove, editandoId, setEditandoId, idAEliminar, setIdAEliminar } = useCrud<Headquarter>()

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors }
  } = useForm<Headquarter>()

  useEffect(() => {
    if (editandoId) {
      const sedeAEditar = sedes.find((s) => s.id === editandoId)
      if (sedeAEditar) {
        reset(sedeAEditar)
      }
    } else {
      reset()
    }
  }, [editandoId, sedes, reset])

  const onSubmit = (data: Headquarter) => {
    if (editandoId) {
      update(editandoId, data)
      toast.success('¡Sede actualizada!')
      setEditandoId(null)
    } else {
      add({ ...data, id: crypto.randomUUID() })
      toast.success('¡Sede registrada!')
    }
    reset({
      codigo: '',
      nombre: '',
      descripcion: ''
    })
  }

  return (
    <CrudLayout
      nombreEntidad="Sedes"
      items={sedes}
      editandoId={editandoId}
      setEditandoId={setEditandoId}
      idAEliminar={idAEliminar}
      setIdAEliminar={setIdAEliminar}
      onDelete={remove}
      getItemName={(s) => s.nombre}
      renderForm={() => (
        <Card>
          <CardContent className="p-6">
            <FormLayout onSubmit={handleSubmit(onSubmit)} title={editandoId ? 'Editar Sede' : 'Registrar Sede'}>
              <FormField
                id="codigo"
                label="Código"
                control={control}
                name="codigo"
                type="text"
                required
                error={errors.codigo}
                placeholder="Ej: 43F34"
                rules={{ required: 'El código es obligatorio' }}
              />
              <FormField
                id="nombre"
                label="Nombre"
                control={control}
                name="nombre"
                type="text"
                required
                error={errors.nombre}
                placeholder="Ej: Sede Heredia"
                rules={{ required: 'El nombre es obligatorio' }}
              />
              <FormTextarea
                id="descripcion"
                label="Descripción"
                register={register('descripcion')}
                error={errors.descripcion}
                placeholder="Detalles adicionales..."
              />
              <div className="flex justify-end gap-2 pt-4">
                {editandoId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditandoId(null)
                      reset({
                        nombre: '',
                        descripcion: ''
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
      renderItem={(sede, isEditing, onEdit, onDelete) => (
        <Card key={sede.id} className={isEditing ? 'ring-2 ring-blue-400' : ''}>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold">{sede.nombre}</h3>
              {isEditing && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Editando</span>}
            </div>
            <p className="text-sm text-muted-foreground">{sede.descripcion}</p>
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
