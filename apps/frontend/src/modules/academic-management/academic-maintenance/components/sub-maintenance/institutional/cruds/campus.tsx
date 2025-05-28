'use client'

import { useCrud } from '@/modules/academic-management/academic-maintenance/hooks/useCrud'
import { CrudLayout } from '@/app/(components)/crud/crud-layout'
import { Campus } from '@/modules/types/institutional/campus'
import { Headquarter } from '@/modules/types/institutional/headquarter'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { FormLayout } from '@/app/(components)/form/form-layout'
import { FormField } from '@/app/(components)/form/field'
import { FormTextarea } from '@/app/(components)/form/textarea'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { FormSelect } from '@/app/(components)/form/select' // ruta donde está tu combobox
import { useEffect } from 'react'

export default function CampusCrud() {
  const { items: campuses, add, update, remove, editandoId, setEditandoId, idAEliminar, setIdAEliminar } = useCrud<Campus>()

  // Mock sedes (o cargar de API real)
  const sedesMock: Headquarter[] = [
    { id: '1', nombre: 'Sede Central', descripcion: 'La jefa', codigo: 'SJC' },
    { id: '2', nombre: 'Sede Alajuela', descripcion: 'La pura vida', codigo: 'SAJ' }
  ]

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<Campus>()

  useEffect(() => {
    if (editandoId) {
      const campusAEditar = campuses.find((c) => c.id === editandoId)
      if (campusAEditar) {
        reset(campusAEditar) // ← esto se vuelve a ejecutar cuando cambia `editandoId`
      }
    } else {
      reset()
    }
  }, [editandoId, campuses, reset])

  const onSubmit = (data: Campus) => {
    if (editandoId) {
      update(editandoId, data)
      toast.success('¡Campus actualizado!')
      setEditandoId(null)
    } else {
      add({ ...data, id: crypto.randomUUID() })
      toast.success('¡Campus registrado!')
    }

    // Limpiar full
    reset({
      nombre: '',
      descripcion: '',
      sedeId: ''
    })
  }

  return (
    <CrudLayout
      nombreEntidad="Campus"
      items={campuses}
      editandoId={editandoId}
      setEditandoId={setEditandoId}
      idAEliminar={idAEliminar}
      setIdAEliminar={setIdAEliminar}
      onDelete={remove}
      getItemName={(c) => c.nombre}
      renderForm={() => (
        <Card>
          <CardContent className="p-6">
            <FormLayout onSubmit={handleSubmit(onSubmit)} title={editandoId ? 'Editar Campus' : 'Registrar Campus'}>
              <FormField
                id="nombre"
                label="Nombre"
                control={control}
                name="nombre"
                required
                error={errors.nombre}
                placeholder="Ej: Campus San José"
                rules={{ required: 'El nombre es obligatorio' }}
              />

              <FormTextarea
                id="descripcion"
                label="Descripción"
                register={register('descripcion')}
                error={errors.descripcion}
                placeholder="Detalles adicionales..."
              />

              {/* Aquí va tu FormSelect con Controller para RHF */}
              <div className="pt-4">
                <Controller
                  control={control}
                  name="sedeId"
                  rules={{ required: 'La sede es obligatoria' }}
                  render={({ field }) => (
                    <FormSelect
                      label="Sede"
                      value={field.value || null}
                      options={sedesMock.map((s) => ({ id: s.id, name: s.nombre }))}
                      onChange={field.onChange}
                      placeholder="Seleccione una sede"
                      error={errors.sedeId}
                    />
                  )}
                />
                {errors.sedeId && <p className="text-red-600 text-sm mt-1">{errors.sedeId.message}</p>}
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
                        sedeId: '' // o 'sedeId', 'campusId', etc. según el caso
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
      renderItem={(campus, isEditing, onEdit, onDelete) => (
        <Card key={campus.id} className={isEditing ? 'ring-2 ring-blue-400' : ''}>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold">{campus.nombre}</h3>
              {isEditing && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Editando</span>}
            </div>
            <p className="text-sm text-muted-foreground">{campus.descripcion}</p>
            <p className="text-sm text-muted-foreground font-semibold">
              Sede: {sedesMock.find((s) => s.id === campus.sedeId)?.nombre || 'N/A'}
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
