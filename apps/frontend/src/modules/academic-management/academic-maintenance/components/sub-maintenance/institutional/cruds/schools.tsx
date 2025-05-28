'use client'

import { useCrud } from '@/modules/academic-management/academic-maintenance/hooks/useCrud'
import { CrudLayout } from '@/app/(components)/crud/crud-layout'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { FormLayout } from '@/app/(components)/form/form-layout'
import { FormField } from '@/app/(components)/form/field'
import { FormTextarea } from '@/app/(components)/form/textarea'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { FormSelect } from '@/app/(components)/form/select'
import { useEffect } from 'react'
import { School } from '@/modules/types/institutional/school'
import { Faculty } from '@/modules/types/institutional/faculty'

export default function EscuelaPage() {
  const { items: escuelas, add, update, remove, editandoId, setEditandoId, idAEliminar, setIdAEliminar } = useCrud<School>()

  const facultadesMock: Faculty[] = [
    { id: '1', nombre: 'Facultad de Ciencias Sociales', campusIds: ['1', '2'] },
    { id: '2', nombre: 'Facultad de Ingeniería', campusIds: ['1'] },
    { id: '3', nombre: 'Facultad de Ciencias Exactas', campusIds: ['2'] }
  ]

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<School>()

  useEffect(() => {
    if (editandoId) {
      const escuela = escuelas.find((e) => e.id === editandoId)
      if (escuela) {
        reset(escuela)
      }
    } else {
      reset()
    }
  }, [editandoId, escuelas, reset])

  const onSubmit = (data: School) => {
    if (editandoId) {
      update(editandoId, data)
      toast.success('¡Escuela actualizada!')
      setEditandoId(null)
    } else {
      add({ ...data, id: crypto.randomUUID() })
      toast.success('¡Escuela registrada!')
    }

    reset({
      nombre: '',
      descripcion: '',
      facultadId: ''
    })
  }

  return (
    <CrudLayout
      nombreEntidad="Escuela"
      items={escuelas}
      editandoId={editandoId}
      setEditandoId={setEditandoId}
      idAEliminar={idAEliminar}
      setIdAEliminar={setIdAEliminar}
      onDelete={remove}
      getItemName={(e) => e.nombre}
      renderForm={() => (
        <Card>
          <CardContent className="p-6">
            <FormLayout onSubmit={handleSubmit(onSubmit)} title={editandoId ? 'Editar Escuela' : 'Registrar Escuela'}>
              <FormField
                id="nombre"
                label="Nombre"
                control={control}
                name="nombre"
                required
                error={errors.nombre}
                placeholder="Ej: Escuela de Matemática"
                rules={{ required: 'El nombre es obligatorio' }}
              />

              <FormTextarea
                id="descripcion"
                label="Descripción"
                register={register('descripcion')}
                error={errors.descripcion}
                placeholder="Detalles adicionales..."
              />

              <div className="pt-4">
                <Controller
                  control={control}
                  name="facultadId"
                  rules={{ required: 'Debe seleccionar una facultad' }}
                  render={({ field }) => (
                    <FormSelect
                      label="Facultad"
                      value={field.value || null}
                      options={facultadesMock.map((f) => ({ id: f.id, name: f.nombre }))}
                      onChange={field.onChange}
                      placeholder="Seleccione una facultad"
                      error={errors.facultadId}
                    />
                  )}
                />
                {errors.facultadId && <p className="text-red-600 text-sm mt-1">{errors.facultadId.message}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-6">
                {editandoId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditandoId(null)
                      reset({
                        nombre: '',
                        descripcion: '',
                        facultadId: '' // o 'sedeId', 'campusId', etc. según el caso
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
      renderItem={(escuela, isEditing, onEdit, onDelete) => (
        <Card key={escuela.id} className={isEditing ? 'ring-2 ring-blue-400' : ''}>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold">{escuela.nombre}</h3>
              {isEditing && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Editando</span>}
            </div>
            <p className="text-sm text-muted-foreground">{escuela.descripcion}</p>
            <p className="text-sm text-muted-foreground font-semibold">
              Facultad: {facultadesMock.find((f) => f.id === escuela.facultadId)?.nombre || 'N/A'}
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
