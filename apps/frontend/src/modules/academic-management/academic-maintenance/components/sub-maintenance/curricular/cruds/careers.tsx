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
import { Career } from '@/modules/types/curricular/career'
import { School } from '@/modules/types/institutional/school'

export default function CareerCrud() {
  const { items: careers, add, update, remove, editandoId, setEditandoId, idAEliminar, setIdAEliminar } = useCrud<Career>()

  const escuelasMock: School[] = [
    { id: '1', nombre: 'Escuela de Informática', descripcion: '', facultadId: '1' },
    { id: '2', nombre: 'Escuela de Matemática', descripcion: '', facultadId: '1' },
    { id: '3', nombre: 'Escuela de Historia', descripcion: '', facultadId: '2' }
  ]

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<Career>()

  useEffect(() => {
    if (editandoId) {
      const career = careers.find((c) => c.id === editandoId)
      if (career) reset(career)
    } else {
      reset()
    }
  }, [editandoId, careers, reset])

  const onSubmit = (data: Career) => {
    if (editandoId) {
      update(editandoId, data)
      toast.success('¡Carrera actualizada!')
      setEditandoId(null)
    } else {
      add({ ...data, id: crypto.randomUUID() })
      toast.success('¡Carrera registrada!')
    }

    reset({
      nombre: '',
      descripcion: '',
      escuelaId: ''
    })
  }

  return (
    <CrudLayout
      nombreEntidad="Carrera"
      items={careers}
      editandoId={editandoId}
      setEditandoId={setEditandoId}
      idAEliminar={idAEliminar}
      setIdAEliminar={setIdAEliminar}
      onDelete={remove}
      getItemName={(c) => c.nombre}
      renderForm={() => (
        <Card>
          <CardContent className="p-6">
            <FormLayout onSubmit={handleSubmit(onSubmit)} title={editandoId ? 'Editar Carrera' : 'Registrar Carrera'}>
              <FormField
                id="nombre"
                label="Nombre"
                control={control}
                name="nombre"
                required
                error={errors.nombre}
                placeholder="Ej: Ingeniería Informática"
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
                  name="escuelaId"
                  rules={{ required: 'La escuela es obligatoria' }}
                  render={({ field }) => (
                    <FormSelect
                      label="Escuela"
                      value={field.value || null}
                      options={escuelasMock.map((e) => ({ id: e.id, name: e.nombre }))}
                      onChange={field.onChange}
                      placeholder="Seleccione una escuela"
                      error={errors.escuelaId}
                    />
                  )}
                />
                {errors.escuelaId && <p className="text-red-600 text-sm mt-1">{errors.escuelaId.message}</p>}
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
                        escuelaId: ''
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
      renderItem={(career, isEditing, onEdit, onDelete) => (
        <Card key={career.id} className={isEditing ? 'ring-2 ring-blue-400' : ''}>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold">{career.nombre}</h3>
              {isEditing && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Editando</span>}
            </div>
            <p className="text-sm text-muted-foreground">{career.descripcion}</p>
            <p className="text-sm text-muted-foreground font-semibold">
              Escuela: {escuelasMock.find((e) => e.id === career.escuelaId)?.nombre || 'N/A'}
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
