'use client'

import { useEffect, useState, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { MapPin, BookOpen, Users } from 'lucide-react' // Assuming icons

import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { Badge } from '@una-gc/ui/components/badge'
import { CrudLayout } from '@/app/(components)/crud/crud-layout'
import { FormLayout } from '@/app/(components)/form/form-layout'
import { FormField } from '@/app/(components)/form/field'
import { FormTextarea } from '@/app/(components)/form/textarea'
import { FormSelect } from '@/app/(components)/form/select' // For single select (RegionalCenter)
import { FormSelectMultiple } from '@/app/(components)/form/select-multiple' // For Classrooms and AcademicLoads

import {
  useListCampuses, // The new flat list hook
  useOneCampus,
  useCreateCampus,
  useUpdateCampus,
  useRemoveCampus
} from '@/modules/academic-management/academic-maintenance/hooks/institutional/useCampus'
import { useListRegionalCenters } from '@/modules/academic-management/academic-maintenance/hooks/institutional/useRegionalCenter'
// Mocks for related entities - replace with actual hooks when available
// import { useListClassrooms } from '@/modules/academic-management/academic-maintenance/hooks/infrastructure/useClassroom'
// import { useListAcademicLoads } from '@/modules/academic-management/academic-load/hooks/useAcademicLoad'
import { CreateCampusInput, CampusWithRelations } from '@/modules/academic-management/academic-maintenance/types/institutional/campus'
import { Status } from '@una-gc/database/prisma/generated/client' // Assuming Status enum is available

// Mock data and hooks if related entity hooks don't exist yet
const useListClassrooms = () => ({ data: { data: [{ id: 'classroom1', name: 'Aula 101' }] }, isLoading: false })
const useListAcademicLoads = () => ({ data: { data: [{ id: 'load1', name: 'Carga Académica 2025-1' }] }, isLoading: false })

const defaultValues: CreateCampusInput = {
  code: '',
  name: '',
  description: '',
  status: Status.ACTIVE,
  regionalCenter: { connect: { id: '' } },
  classrooms: { connect: [] },
  academicLoads: { connect: [] },
  // createdBy and updatedBy are typically handled by the backend or a global context
};

export default function CampusCrud() {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null)

  const { data: campuses, refetch, isLoading: isLoadingList } = useListCampuses()

  const processedCampuses = useMemo(() => 
    campuses
      ? campuses.map(campus => ({
          ...campus,
          id: campus.id || (campus as any)._id, // Handle both id formats
          regionalCenter: campus.regionalCenter || null,
          classrooms: campus.classrooms || [],
          academicLoads: campus.academicLoads || []
        }))
      : [], [campuses])

  useEffect(() => {
    console.log('Campuses data:', campuses);
    console.log('Processed Campuses data:', processedCampuses);
  }, [campuses, processedCampuses]);

  const { mutate: createCampus, isLoading: isCreating, error: createError } = useCreateCampus({
    onSuccess: async () => {
      toast.success('Campus creado exitosamente');
      await refetch();
      reset(defaultValues);
    },
    onError: (error: any) => {
      console.error('Error al crear campus:', error);
      toast.error(`Error al crear: ${error.message || 'Error desconocido'}`);
    }
  });

  const { mutate: updateCampus, isLoading: isUpdating, error: updateError } = useUpdateCampus({
    onSuccess: async () => {
      toast.success('Campus actualizado exitosamente');
      setEditingId(null);
      await refetch();
      reset(defaultValues);
    },
    onError: (error: any) => {
      console.error('Error al actualizar campus:', error);
      toast.error(`Error al actualizar: ${error.message || 'Error desconocido'}`);
    }
  });

  const { mutate: removeCampus, isLoading: isRemoving } = useRemoveCampus({
    onSuccess: async () => {
      toast.success('Campus eliminado exitosamente');
      await refetch();
    },
    onError: (error: any) => {
      console.error('Error al eliminar campus:', error);
      toast.error(`Error al eliminar: ${error.message || 'Error desconocido'}`);
    }
  });

  const { data: editingItem } = useOneCampus(editingId || '', undefined, {
    enabled: !!editingId
  });

  const { data: regionalCentersResponse, isLoading: loadingRegionalCenters } = useListRegionalCenters();
  const regionalCentersData = useMemo(() => regionalCentersResponse || [], [regionalCentersResponse]);
  
  // Mocks - replace with actual hooks
  const { data: classroomsResponse, isLoading: loadingClassrooms } = useListClassrooms();
  const classroomsData = useMemo(() => classroomsResponse?.data || [], [classroomsResponse]);

  const { data: academicLoadsResponse, isLoading: loadingAcademicLoads } = useListAcademicLoads();
  const academicLoadsData = useMemo(() => academicLoadsResponse?.data || [], [academicLoadsResponse]);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateCampusInput>({
    defaultValues
  });

  useEffect(() => {
    if (editingId && editingItem) {
      reset({
        code: editingItem.code,
        name: editingItem.name || '',
        description: editingItem.description || '',
        status: editingItem.status || Status.ACTIVE,
        regionalCenter: { 
          connect: { id: editingItem.regionalCenter?.id || '' } 
        },
        classrooms: {
          connect: editingItem.classrooms?.map((c) => ({ id: c.id })) || []
        },
        academicLoads: {
          connect: editingItem.academicLoads?.map((al) => ({ id: al.id })) || []
        }
      });
    } else if (!editingId) {
      reset(defaultValues);
    }
  }, [editingId, editingItem, reset]);

  const onSubmit = (data: CreateCampusInput) => {
    try {
      const payload: CreateCampusInput = {
        ...data,
        regionalCenter: data.regionalCenter?.connect?.id ? { connect: { id: data.regionalCenter.connect.id } } : { connect: { id: ''} }, // Ensure correct format
        classrooms: {
          connect: (data.classrooms?.connect || []).filter(c => c && c.id)
        },
        academicLoads: {
          connect: (data.academicLoads?.connect || []).filter(al => al && al.id)
        }
      };
      // Remove status if not explicitly set or if it's meant to be default on backend
      if (payload.status === defaultValues.status && !editingId) {
        // delete payload.status; // Or handle as per backend logic
      }

      if (editingId) {
        updateCampus({ id: editingId, data: payload });
      } else {
        createCampus(payload);
      }
    } catch (error) {
      console.error('Error en formulario:', error);
      toast.error('Error al procesar el formulario');
    }
  };
  
  useEffect(() => {
    if (createError) console.error('Create error details:', createError);
    if (updateError) console.error('Update error details:', updateError);
  }, [createError, updateError]);

  return (
    <CrudLayout
      nombreEntidad="Campus"
      items={processedCampuses}
      editandoId={editingId}
      idAEliminar={idAEliminar}
      isLoading={isLoadingList}
      setEditandoId={setEditingId}
      setIdAEliminar={setIdAEliminar}
      onDelete={(id) => {
        const validId = id?.toString();
        if (validId) removeCampus(validId);
        else toast.error('ID inválido para eliminación');
        setIdAEliminar(null);
      }}
      getItemName={(campus) => campus.name || 'Campus sin nombre'}
      renderForm={() => (
        <Card>
          <CardContent className="p-6">
            <FormLayout title={editingId ? 'Editar Campus' : 'Registrar Campus'} onSubmit={handleSubmit(onSubmit)}>
              <FormField
                id="code"
                name="code"
                control={control}
                label="Código"
                placeholder="Ej: CAM001"
                required
                rules={{ required: 'El código es obligatorio' }}
                error={errors.code}
              />
              <FormField
                id="name"
                name="name"
                control={control}
                label="Nombre"
                placeholder="Ej: Campus Omar Dengo"
                required
                rules={{ required: 'El nombre es obligatorio' }}
                error={errors.name}
              />
              <FormTextarea
                id="description"
                name="description"
                control={control}
                label="Descripción"
                placeholder="Detalles del campus..."
                error={errors.description}
              />
              <Controller
                control={control}
                name="regionalCenter.connect.id" // Path to the ID for connect
                rules={{ required: 'La sede regional es obligatoria' }}
                render={({ field }) => (
                  <FormSelect
                    label="Sede Regional"
                    value={field.value || ''}
                    options={regionalCentersData.map((rc) => ({ value: rc.id, label: rc.name }))}
                    onChange={(value) => field.onChange(value)}
                    placeholder={loadingRegionalCenters ? 'Cargando sedes...' : 'Seleccione una sede'}
                    disabled={loadingRegionalCenters}
                    error={errors.regionalCenter?.connect?.id as any}
                  />
                )}
              />
              <Controller
                control={control}
                name="classrooms.connect"
                defaultValue={[]}
                render={({ field }) => (
                  <FormSelectMultiple
                    label="Aulas asignadas"
                    value={field.value || []}
                    options={classroomsData.map((c: any) => ({ id: c.id, name: c.name }))}
                    onChange={(newValue) => field.onChange(newValue || [])}
                    placeholder={loadingClassrooms ? 'Cargando aulas...' : 'Seleccione una o más'}
                    disabled={loadingClassrooms}
                    error={errors.classrooms?.connect as any}
                  />
                )}
              />
              <Controller
                control={control}
                name="academicLoads.connect"
                defaultValue={[]}
                render={({ field }) => (
                  <FormSelectMultiple
                    label="Cargas Académicas asignadas"
                    value={field.value || []}
                    options={academicLoadsData.map((al: any) => ({ id: al.id, name: al.name }))} // Assuming name property
                    onChange={(newValue) => field.onChange(newValue || [])}
                    placeholder={loadingAcademicLoads ? 'Cargando cargas...' : 'Seleccione una o más'}
                    disabled={loadingAcademicLoads}
                    error={errors.academicLoads?.connect as any}
                  />
                )}
              />
               <Controller
                name="status"
                control={control}
                defaultValue={Status.ACTIVE}
                render={({ field }) => (
                  <FormSelect
                    label="Estado"
                    value={field.value}
                    onChange={field.onChange}
                    options={Object.values(Status).map(s => ({ value: s, label: s }))}
                    placeholder="Seleccione un estado"
                  />
                )}
              />
              <div className="flex justify-end gap-2 pt-6">
                {editingId && (
                  <Button type="button" variant="outline" onClick={() => { setEditingId(null); reset(defaultValues); }}>
                    Cancelar
                  </Button>
                )}
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? 'Procesando...' : (editingId ? 'Actualizar' : 'Registrar')}
                </Button>
              </div>
            </FormLayout>
          </CardContent>
        </Card>
      )}
      renderItem={(campus, isEditing, onEdit, onDelete) => (
        <Card key={campus.id} className={`${isEditing ? 'ring-2 ring-blue-500' : ''} overflow-hidden`}>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{campus.name || 'Campus sin nombre'}</h3>
                <p className="text-sm text-muted-foreground font-mono">Código: {campus.code}</p>
                {campus.regionalCenter && (
                  <p className="text-xs text-muted-foreground">Sede: {campus.regionalCenter.name}</p>
                )}
              </div>
              {isEditing && (
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full shrink-0">Editando</span>
              )}
            </div>
            {campus.description && <p className="text-sm text-muted-foreground">{campus.description}</p>}
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4 text-primary" />
                <span>Aulas:</span> 
                {campus.classrooms && campus.classrooms.length > 0 ? (
                  campus.classrooms.map(c => <Badge key={c.id} variant="secondary">{c.name}</Badge>)
                ) : <Badge variant="outline">Ninguna</Badge>}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>Cargas Académicas:</span>
                {campus.academicLoads && campus.academicLoads.length > 0 ? (
                  campus.academicLoads.map(al => <Badge key={al.id} variant="secondary">{al.name}</Badge>) // Assuming name property
                ) : <Badge variant="outline">Ninguna</Badge>}
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t mt-3">
                <Badge variant={campus.status === Status.ACTIVE ? 'default' : 'destructive'}>{campus.status}</Badge>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(campus.id)}>Editar</Button>
                    <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => onDelete(campus.id)} 
                        disabled={isEditing || (campus.classrooms && campus.classrooms.length > 0) || (campus.academicLoads && campus.academicLoads.length > 0)}
                    >
                        Eliminar
                    </Button>
                </div>
            </div>
          </CardContent>
        </Card>
      )}
    />
  )
}