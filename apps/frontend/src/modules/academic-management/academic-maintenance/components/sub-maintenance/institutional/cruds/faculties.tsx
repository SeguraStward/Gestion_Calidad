'use client'

import { useCrud } from '@/modules/academic-management/academic-maintenance/hooks/useCrud'
import { CrudLayout } from '@/app/(components)/crud/crud-layout'
import { useForm, Controller } from 'react-hook-form'
import { Faculty } from '@/modules/types/institutional/faculty'
import { Campus } from '@/modules/types/institutional/campus'
import { toast } from 'sonner'
import { FormLayout } from '@/app/(components)/form/form-layout'
import { FormField } from '@/app/(components)/form/field'
import { FormTextarea } from '@/app/(components)/form/textarea'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { useEffect, useState } from 'react'
import { FormSelect } from '@/app/(components)/form/select' // creá este a partir del FormSelect

export default function FacultadCruds() {
  const { items: facultades, add, update, remove, editandoId, setEditandoId, idAEliminar, setIdAEliminar } = useCrud<Faculty>()

  const campusMock: Campus[] = [
    {
      id: '1',
      nombre: 'Campus San José',
      sedeId: '1',
      descripcion: 'Campus principal en San José',
      status: 'ACTIVE',
      classrooms: []
    },
    { id: '2', nombre: 'Campus Heredia', sedeId: '2', descripcion: 'Campus en Heredia', status: 'ACTIVE', classrooms: [] },
    { id: '3', nombre: 'Campus Liberia', sedeId: '3', descripcion: 'Campus en Liberia', status: 'ACTIVE', classrooms: [] }
  ]

  const [campusIds, setCampusIds] = useState<string[]>([])
  const [selectedCampusId, setSelectedCampusId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors }
  } = useForm<Faculty>()

  useEffect(() => {
    if (editandoId) {
      const facultad = facultades.find((f) => f.id === editandoId)
      if (facultad) {
        reset(facultad)
        setCampusIds(facultad.campusIds)
      }
    } else {
      reset()
      setCampusIds([])
    }
  }, [editandoId, facultades, reset])

  const onSubmit = (data: Faculty) => {
    const facultadFinal = { ...data, campusIds }

    if (editandoId) {
      update(editandoId, facultadFinal)
      toast.success('¡Facultad actualizada!')
      setEditandoId(null)
    } else {
      add({ ...facultadFinal, id: crypto.randomUUID() })
      toast.success('¡Facultad registrada!')
    }

    reset({ nombre: '', descripcion: '', campusIds: [] })
    setCampusIds([])
    setSelectedCampusId(null)
  }

  const handleAgregarCampus = () => {
    if (selectedCampusId && !campusIds.includes(selectedCampusId)) {
      setCampusIds((prev) => [...prev, selectedCampusId])
      setSelectedCampusId(null)
    }
  }

  const handleQuitarCampus = (id: string) => {
    setCampusIds((prev) => prev.filter((c) => c !== id))
  }

  return (
    <CrudLayout
      nombreEntidad="Facultades"
      items={facultades}
      editandoId={editandoId}
      setEditandoId={setEditandoId}
      idAEliminar={idAEliminar}
      setIdAEliminar={setIdAEliminar}
      onDelete={remove}
      getItemName={(f) => f.nombre}
      renderForm={() => (
        <Card>
          <CardContent className="p-6">
            <FormLayout onSubmit={handleSubmit(onSubmit)} title={editandoId ? 'Editar Facultad' : 'Registrar Facultad'}>
              <FormField
                id="nombre"
                label="Nombre"
                control={control}
                name="nombre"
                required
                error={errors.nombre}
                placeholder="Ej: Facultad de Ciencias"
                rules={{ required: 'El nombre es obligatorio' }}
              />

              <FormTextarea
                id="descripcion"
                label="Descripción"
                register={register('descripcion')}
                error={errors.descripcion}
                placeholder="Detalles adicionales..."
              />

              <div className="pt-4 space-y-2">
                <FormSelect
                  label="Agregar Campus"
                  value={selectedCampusId}
                  options={campusMock.filter((c) => !campusIds.includes(c.id)).map((c) => ({ id: c.id, name: c.nombre }))}
                  onChange={setSelectedCampusId}
                  placeholder="Seleccione un campus"
                />

                <Button type="button" onClick={handleAgregarCampus}>
                  Agregar Campus
                </Button>

                {campusIds.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {campusIds.map((id) => {
                      const campus = campusMock.find((c) => c.id === id)
                      return (
                        <li key={id} className="flex justify-between items-center border p-2 rounded">
                          <span>{campus?.nombre}</span>
                          <Button type="button" variant="destructive" size="sm" onClick={() => handleQuitarCampus(id)}>
                            Quitar
                          </Button>
                        </li>
                      )
                    })}
                  </ul>
                )}
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
                        campusIds: [] // o 'sedeId', 'campusId', etc. según el caso
                      })
                      setCampusIds([])
                      setSelectedCampusId(null)
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
      renderItem={(facultad, isEditing, onEdit, onDelete) => (
        <Card key={facultad.id} className={isEditing ? 'ring-2 ring-blue-400' : ''}>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold">{facultad.nombre}</h3>
              {isEditing && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Editando</span>}
            </div>
            <p className="text-sm text-muted-foreground">{facultad.descripcion}</p>
            <div>
              <p className="text-sm font-medium">Campus asignados:</p>
              <ul className="list-disc ml-5 text-sm text-muted-foreground">
                {facultad.campusIds.map((cid) => {
                  const campus = campusMock.find((c) => c.id === cid)
                  return <li key={cid}>{campus?.nombre || 'Desconocido'}</li>
                })}
              </ul>
            </div>
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
