'use client'

import { useCrud } from '@/modules/academic-management/academic-maintenance/hooks/useCrud'
import { CrudLayout } from '@/app/(components)/crud/crud-layout'
import { AcademicProgram } from '@/modules/types/curricular/academic-program'
import { Career } from '@/modules/types/curricular/career'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { FormLayout } from '@/app/(components)/form/form-layout'
import { FormField } from '@/app/(components)/form/field'
import { FormTextarea } from '@/app/(components)/form/textarea'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { FormSelect } from '@/app/(components)/form/select'
import { useEffect } from 'react'

export default function AcademicProgramCrud() {
  const {
    items: programas,
    add,
    update,
    remove,
    editandoId,
    setEditandoId,
    idAEliminar,
    setIdAEliminar
  } = useCrud<AcademicProgram>()

  // Mock carreras
  const carrerasMock: Career[] = [
    { id: '1', nombre: 'Ing. Informática', descripcion: '', escuelaId: '1' },
    { id: '2', nombre: 'Historia del Arte', descripcion: '', escuelaId: '3' }
  ]

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<AcademicProgram>()

  useEffect(() => {
    if (editandoId) {
      const programa = programas.find((p) => p.id === editandoId)
      if (programa) reset(programa)
    } else {
      reset()
    }
  }, [editandoId, programas, reset])

  const onSubmit = (data: AcademicProgram) => {
    if (editandoId) {
      update(editandoId, data)
      toast.success('¡Programa actualizado!')
      setEditandoId(null)
    } else {
      add({ ...data, id: crypto.randomUUID() })
      toast.success('¡Programa registrado!')
    }

    reset({
      nombre: '',
      descripcion: '',
      carreraId: ''
    })
  }

  return (
    <CrudLayout
      nombreEntidad="Programa Académico"
      items={programas}
      editandoId={editandoId}
      setEditandoId={setEditandoId}
      idAEliminar={idAEliminar}
      setIdAEliminar={setIdAEliminar}
      onDelete={remove}
      getItemName={(p) => p.nombre}
      renderForm={() => (
        <Card>
          <CardContent className="p-6">
            <FormLayout onSubmit={handleSubmit(onSubmit)} title={editandoId ? 'Editar Programa' : 'Registrar Programa'}>
              <FormField
                id="nombre"
                label="Nombre"
                control={control}
                name="nombre"
                required
                error={errors.nombre}
                placeholder="Ej: Programa de Ciberseguridad"
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
                  name="carreraId"
                  rules={{ required: 'La carrera es obligatoria' }}
                  render={({ field }) => (
                    <FormSelect
                      label="Carrera"
                      value={field.value || null}
                      options={carrerasMock.map((c) => ({ id: c.id, name: c.nombre }))}
                      onChange={field.onChange}
                      placeholder="Seleccione una carrera"
                      error={errors.carreraId}
                    />
                  )}
                />
                {errors.carreraId && <p className="text-red-600 text-sm mt-1">{errors.carreraId.message}</p>}
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
                        carreraId: ''
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
      renderItem={(programa, isEditing, onEdit, onDelete) => (
        <Card key={programa.id} className={isEditing ? 'ring-2 ring-blue-400' : ''}>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold">{programa.nombre}</h3>
              {isEditing && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Editando</span>}
            </div>
            <p className="text-sm text-muted-foreground">{programa.descripcion}</p>
            <p className="text-sm text-muted-foreground font-semibold">
              Carrera: {carrerasMock.find((c) => c.id === programa.carreraId)?.nombre || 'N/A'}
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
