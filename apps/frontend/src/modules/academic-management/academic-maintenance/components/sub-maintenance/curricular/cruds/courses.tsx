'use client'

import { useCrud } from '@/modules/academic-management/academic-maintenance/hooks/useCrud'
import { CrudLayout } from '@/app/(components)/crud/crud-layout'
import { Course } from '@/modules/types/curricular/course'
import { AcademicProgram } from '@/modules/types/curricular/academic-program'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { FormLayout } from '@/app/(components)/form/form-layout'
import { FormField } from '@/app/(components)/form/field'
import { FormTextarea } from '@/app/(components)/form/textarea'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { FormSelect } from '@/app/(components)/form/select'
import { useEffect } from 'react'

export default function CourseCrud() {
  const { items: courses, add, update, remove, editandoId, setEditandoId, idAEliminar, setIdAEliminar } = useCrud<Course>()

  // Mock programas académicos
  const programasMock: AcademicProgram[] = [
    { id: '1', nombre: 'Ciberseguridad', descripcion: '', carreraId: '1' },
    { id: '2', nombre: 'Literatura Comparada', descripcion: '', carreraId: '2' }
  ]

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<Course>()

  useEffect(() => {
    if (editandoId) {
      const curso = courses.find((c) => c.id === editandoId)
      if (curso) reset(curso)
    } else {
      reset()
    }
  }, [editandoId, courses, reset])

  const onSubmit = (data: Course) => {
    if (editandoId) {
      update(editandoId, data)
      toast.success('¡Curso actualizado!')
      setEditandoId(null)
    } else {
      add({ ...data, id: crypto.randomUUID() })
      toast.success('¡Curso registrado!')
    }
    reset({
      nombre: '',
      descripcion: '',
      codigo: '',
      nivel: '',
      creditos: 0,
      horasContacto: 0,
      programaId: ''
    })
  }

  return (
    <CrudLayout
      nombreEntidad="Curso"
      items={courses}
      editandoId={editandoId}
      setEditandoId={setEditandoId}
      idAEliminar={idAEliminar}
      setIdAEliminar={setIdAEliminar}
      onDelete={remove}
      getItemName={(c) => c.nombre}
      renderForm={() => (
        <Card>
          <CardContent className="p-6">
            <FormLayout onSubmit={handleSubmit(onSubmit)} title={editandoId ? 'Editar Curso' : 'Registrar Curso'}>
              <FormField
                id="nombre"
                label="Nombre"
                control={control}
                name="nombre"
                required
                error={errors.nombre}
                placeholder="Ej: Fundamentos de Redes"
                rules={{ required: 'El nombre es obligatorio' }}
              />

              <FormField
                id="codigo"
                label="Código"
                control={control}
                name="codigo"
                required
                error={errors.codigo}
                placeholder="Ej: INF-101"
                rules={{ required: 'El código es obligatorio' }}
              />

              <FormField
                id="nivel"
                label="Nivel"
                control={control}
                name="nivel"
                required
                type="number"
                min={0}
                step={1}
                error={errors.nivel}
                placeholder="Ej: 100"
                rules={{
                  required: 'El nivel es obligatorio',
                  min: { value: 1, message: 'El nivel debe ser al menos 1' },
                  pattern: {
                    value: /^[0-9]+$/,
                    message: 'El nivel debe ser un número'
                  }
                }}
              />

              <FormField
                id="credits"
                label="Créditos"
                control={control}
                name="creditos"
                type="number"
                min={0}
                step={1}
                required
                error={errors.creditos}
                placeholder="Ej: 3"
                rules={{
                  required: 'Los créditos son obligatorios',
                  min: { value: 1, message: 'Debe ser al menos 1 crédito' }
                }}
              />

              <FormField
                id="contactHours"
                label="Horas Totales"
                control={control}
                name="horasContacto"
                type="number"
                min={0}
                step={1}
                required
                error={errors.horasContacto}
                placeholder="Ej: 48"
                rules={{
                  required: 'Las horas totales son obligatorias',
                  min: { value: 1, message: 'Debe ser al menos 1 hora' }
                }}
              />

              <FormTextarea
                id="descripcion"
                label="Descripción"
                register={register('descripcion')}
                error={errors.descripcion}
                placeholder="Contenido general del curso..."
              />

              <div className="pt-4">
                <Controller
                  control={control}
                  name="programaId"
                  rules={{ required: 'El programa es obligatorio' }}
                  render={({ field }) => (
                    <FormSelect
                      label="Programa Académico"
                      value={field.value || null}
                      options={programasMock.map((p) => ({ id: p.id, name: p.nombre }))}
                      onChange={field.onChange}
                      placeholder="Seleccione un programa"
                      error={errors.programaId}
                    />
                  )}
                />
                {errors.programaId && <p className="text-red-600 text-sm mt-1">{errors.programaId.message}</p>}
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
                        codigo: '',
                        nivel: '',
                        creditos: 0,
                        horasContacto: 0,
                        programaId: ''
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
      renderItem={(curso, isEditing, onEdit, onDelete) => (
        <Card key={curso.id} className={isEditing ? 'ring-2 ring-blue-400' : ''}>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold">{curso.nombre}</h3>
              {isEditing && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Editando</span>}
            </div>
            <p className="text-sm text-muted-foreground">Código: {curso.codigo}</p>
            <p className="text-sm text-muted-foreground">Nivel: {curso.nivel}</p>
            <p className="text-sm text-muted-foreground">Créditos: {curso.creditos}</p>
            <p className="text-sm text-muted-foreground">Horas Totales: {curso.horasContacto}</p>
            <p className="text-sm text-muted-foreground">{curso.descripcion}</p>
            <p className="text-sm text-muted-foreground font-semibold">
              Programa: {programasMock.find((p) => p.id === curso.programaId)?.nombre || 'N/A'}
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
