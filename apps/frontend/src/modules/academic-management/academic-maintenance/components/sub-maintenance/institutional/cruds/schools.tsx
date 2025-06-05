// 'use client'

// import { useEffect, useState, useMemo, useRef } from 'react'
// import { useForm, Controller } from 'react-hook-form'
// import { toast } from 'sonner'
// import { School as SchoolIcon, BookUser, Award } from 'lucide-react' // Assuming icons

// import { Button } from '@una-gc/ui/components/button'
// import { Card, CardContent } from '@una-gc/ui/components/card'
// import { Badge } from '@una-gc/ui/components/badge'
// import { CrudLayout } from '@/app/(components)/crud/crud-layout'
// import { FormLayout } from '@/app/(components)/form/form-layout'
// import { FormField } from '@/app/(components)/form/field'
// import { FormTextarea } from '@/app/(components)/form/textarea'
// import { FormSelect } from '@/app/(components)/form/select' // For Faculty
// import { FormSelectMultiple } from '@/app/(components)/form/select-multiple' // For Courses and Careers

// import {
//   useListSchools, // The new flat list hook
//   useOneSchool,
//   useCreateSchool,
//   useUpdateSchool,
//   useRemoveSchool
// } from '@/modules/academic-management/academic-maintenance/hooks/institutional/useSchool'
// import { useListFaculties } from '@/modules/academic-management/academic-maintenance/hooks/institutional/useFaculty'
// // Mocks for related entities - replace with actual hooks when available
// // import { useListCourses } from '@/modules/academic-management/curriculum/hooks/useCourse'
// // import { useListCareers } from '@/modules/academic-management/curriculum/hooks/useCareer'
// import { CreateSchoolInput, SchoolWithRelations } from '@/modules/academic-management/academic-maintenance/types/institutional/school'
// import { Status } from '@una-gc/database/prisma/generated/client'

// // Mock data and hooks if related entity hooks don't exist yet
// const useListCourses = () => ({ data: { data: [{ id: 'course1', name: 'Cálculo I' }] }, isLoading: false })
// const useListCareers = () => ({ data: { data: [{ id: 'career1', name: 'Ingeniería en Sistemas' }] }, isLoading: false })

// const defaultValues: CreateSchoolInput = {
//   code: '',
//   name: '',
//   description: '',
//   status: Status.ACTIVE,
//   faculty: { connect: { id: '' } },
//   courses: { connect: [] },
//   career: { connect: [] }, // Assuming career is an array of connections based on CreateSchoolInput
// };

// export default function SchoolCrud() {
//   const [editingId, setEditingId] = useState<string | null>(null)
//   const [idAEliminar, setIdAEliminar] = useState<string | null>(null)
//   const prevIdRef = useRef<string | null>(null);

//   const { data: schools, refetch, isLoading: isLoadingList } = useListSchools()

//   const processedSchools = useMemo(() =>
//     schools
//       ? schools.map(school => ({
//           ...school,
//           id: school.id || (school as any)._id, // Handle both id formats
//           faculty: school.faculty || null,
//           courses: school.courses || [],
//           career: school.career || [] // Ensure career is an array
//         }))
//       : [], [schools])

//   useEffect(() => {
//     console.log('Schools data:', schools);
//     console.log('Processed Schools data:', processedSchools);
//   }, [schools, processedSchools]);

//   const { mutate: createSchool, isLoading: isCreating, error: createError } = useCreateSchool({
//     onSuccess: async () => {
//       toast.success('Escuela creada exitosamente');
//       await refetch();
//       reset(defaultValues);
//     },
//     onError: (error: any) => {
//       console.error('Error al crear escuela:', error);
//       toast.error(`Error al crear: ${error.message || 'Error desconocido'}`);
//     }
//   });

//   const { mutate: updateSchool, isLoading: isUpdating, error: updateError } = useUpdateSchool({
//     onSuccess: async () => {
//       toast.success('Escuela actualizada exitosamente');
//       setEditingId(null);
//       await refetch();
//       reset(defaultValues);
//     },
//     onError: (error: any) => {
//       console.error('Error al actualizar escuela:', error);
//       toast.error(`Error al actualizar: ${error.message || 'Error desconocido'}`);
//     }
//   });

//   const { mutate: removeSchool, isLoading: isRemoving } = useRemoveSchool({
//     onSuccess: async () => {
//       toast.success('Escuela eliminada exitosamente');
//       await refetch();
//     },
//     onError: (error: any) => {
//       console.error('Error al eliminar escuela:', error);
//       toast.error(`Error al eliminar: ${error.message || 'Error desconocido'}`);
//     }
//   });

//   const { data: editingItem } = useOneSchool(editingId || '', undefined, {
//     enabled: !!editingId
//   });

//   const { data: facultiesResponse, isLoading: loadingFaculties } = useListFaculties();
//   const facultiesData = useMemo(() => facultiesResponse || [], [facultiesResponse]);

//   // Mocks - replace with actual hooks
//   const { data: coursesResponse, isLoading: loadingCourses } = useListCourses();
//   const coursesData = useMemo(() => coursesResponse?.data || [], [coursesResponse]);

//   const { data: careersResponse, isLoading: loadingCareers } = useListCareers();
//   const careersData = useMemo(() => careersResponse?.data || [], [careersResponse]);

//   const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateSchoolInput>({
//     defaultValues
//   });

//   useEffect(() => {
//     if (editingId !== prevIdRef.current) {
//         prevIdRef.current = editingId;
//         if (editingId && editingItem) {
//             reset({
//                 code: editingItem.code,
//                 name: editingItem.name || '',
//                 description: editingItem.description || '',
//                 status: editingItem.status || Status.ACTIVE,
//                 faculty: {
//                 connect: { id: editingItem.faculty?.id || '' }
//                 },
//                 courses: {
//                 connect: editingItem.courses?.map((c) => ({ id: c.id })) || []
//                 },
//                 career: {
//                 connect: editingItem.career?.map((cr) => ({ id: cr.id })) || []
//                 }
//             });
//         } else if (!editingId) {
//             reset(defaultValues);
//         }
//     }
//   }, [editingId, editingItem, reset]);

//   const onSubmit = (data: CreateSchoolInput) => {
//     try {
//       const payload: CreateSchoolInput = {
//         ...data,
//         faculty: data.faculty?.connect?.id ? { connect: { id: data.faculty.connect.id } } : { connect: {id: ''} },
//         courses: {
//           connect: (data.courses?.connect || []).filter(c => c && c.id)
//         },
//         career: {
//           connect: (data.career?.connect || []).filter(cr => cr && cr.id)
//         }
//       };

//       if (editingId) {
//         updateSchool({ id: editingId, data: payload });
//       } else {
//         createSchool(payload);
//       }
//     } catch (error) {
//       console.error('Error en formulario:', error);
//       toast.error('Error al procesar el formulario');
//     }
//   };

//   useEffect(() => {
//     if (createError) console.error('Create error details:', createError);
//     if (updateError) console.error('Update error details:', updateError);
//   }, [createError, updateError]);

//   return (
//     <CrudLayout
//       nombreEntidad="Escuela"
//       items={processedSchools}
//       editandoId={editingId}
//       idAEliminar={idAEliminar}
//       isLoading={isLoadingList}
//       setEditandoId={setEditingId}
//       setIdAEliminar={setIdAEliminar}
//       onDelete={(id) => {
//         const validId = id?.toString();
//         if (validId) removeSchool(validId);
//         else toast.error('ID inválido para eliminación');
//         setIdAEliminar(null);
//       }}
//       getItemName={(school) => school.name || 'Escuela sin nombre'}
//       renderForm={() => (
//         <Card>
//           <CardContent className="p-6">
//             <FormLayout title={editingId ? 'Editar Escuela' : 'Registrar Escuela'} onSubmit={handleSubmit(onSubmit)}>
//               <FormField
//                 id="code"
//                 name="code"
//                 control={control}
//                 label="Código"
//                 placeholder="Ej: ESC001"
//                 required
//                 rules={{ required: 'El código es obligatorio' }}
//                 error={errors.code}
//               />
//               <FormField
//                 id="name"
//                 name="name"
//                 control={control}
//                 label="Nombre"
//                 placeholder="Ej: Escuela de Informática"
//                 required
//                 rules={{ required: 'El nombre es obligatorio' }}
//                 error={errors.name}
//               />
//               <FormTextarea
//                 id="description"
//                 name="description"
//                 control={control}
//                 label="Descripción"
//                 placeholder="Detalles de la escuela..."
//                 error={errors.description}
//               />
//               <Controller
//                 control={control}
//                 name="faculty.connect.id"
//                 rules={{ required: 'La facultad es obligatoria' }}
//                 render={({ field }) => (
//                   <FormSelect
//                     label="Facultad"
//                     value={field.value || ''}
//                     options={facultiesData.map((f) => ({ value: f.id, label: f.name }))}
//                     onChange={(value) => field.onChange(value)}
//                     placeholder={loadingFaculties ? 'Cargando facultades...' : 'Seleccione una facultad'}
//                     disabled={loadingFaculties}
//                     error={errors.faculty?.connect?.id as any}
//                   />
//                 )}
//               />
//               <Controller
//                 control={control}
//                 name="courses.connect"
//                 defaultValue={[]}
//                 render={({ field }) => (
//                   <FormSelectMultiple
//                     label="Cursos asignados"
//                     value={field.value || []}
//                     options={coursesData.map((c: any) => ({ id: c.id, name: c.name }))}
//                     onChange={(newValue) => field.onChange(newValue || [])}
//                     placeholder={loadingCourses ? 'Cargando cursos...' : 'Seleccione uno o más'}
//                     disabled={loadingCourses}
//                     error={errors.courses?.connect as any}
//                   />
//                 )}
//               />
//               <Controller
//                 control={control}
//                 name="career.connect" // Assuming 'career' is the field for careers
//                 defaultValue={[]}
//                 render={({ field }) => (
//                   <FormSelectMultiple
//                     label="Carreras asignadas"
//                     value={field.value || []}
//                     options={careersData.map((cr: any) => ({ id: cr.id, name: cr.name }))}
//                     onChange={(newValue) => field.onChange(newValue || [])}
//                     placeholder={loadingCareers ? 'Cargando carreras...' : 'Seleccione una o más'}
//                     disabled={loadingCareers}
//                     error={errors.career?.connect as any}
//                   />
//                 )}
//               />
//               <Controller
//                 name="status"
//                 control={control}
//                 defaultValue={Status.ACTIVE}
//                 render={({ field }) => (
//                   <FormSelect
//                     label="Estado"
//                     value={field.value}
//                     onChange={field.onChange}
//                     options={Object.values(Status).map(s => ({ value: s, label: s }))
//                     }
//                     placeholder="Seleccione un estado"
//                   />
//                 )}
//               />
//               <div className="flex justify-end gap-2 pt-6">
//                 {editingId && (
//                   <Button type="button" variant="outline" onClick={() => { setEditingId(null); reset(defaultValues); }}>
//                     Cancelar
//                   </Button>
//                 )}
//                 <Button type="submit" disabled={isCreating || isUpdating}>
//                   {isCreating || isUpdating ? 'Procesando...' : (editingId ? 'Actualizar' : 'Registrar')}
//                 </Button>
//               </div>
//             </FormLayout>
//           </CardContent>
//         </Card>
//       )}
//       renderItem={(school, isEditing, onEdit, onDelete) => (
//         <Card key={school.id} className={`${isEditing ? 'ring-2 ring-blue-500' : ''} overflow-hidden`}>
//           <CardContent className="p-4 space-y-3">
//             <div className="flex justify-between items-start">
//               <div>
//                 <h3 className="text-lg font-semibold">{school.name || 'Escuela sin nombre'}</h3>
//                 <p className="text-sm text-muted-foreground font-mono">Código: {school.code}</p>
//                 {school.faculty && (
//                   <p className="text-xs text-muted-foreground">Facultad: {school.faculty.name}</p>
//                 )}
//               </div>
//               {isEditing && (
//                 <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full shrink-0">Editando</span>
//               )}
//             </div>
//             {school.description && <p className="text-sm text-muted-foreground">{school.description}</p>}
//             <div className="space-y-1">
//               <div className="flex items-center gap-1 text-sm text-muted-foreground">
//                 <BookUser className="h-4 w-4 text-primary" />
//                 <span>Cursos:</span>
//                 {school.courses && school.courses.length > 0 ? (
//                   school.courses.map(c => <Badge key={c.id} variant="secondary">{c.name}</Badge>)
//                 ) : <Badge variant="outline">Ninguno</Badge>}
//               </div>
//               <div className="flex items-center gap-1 text-sm text-muted-foreground">
//                 <Award className="h-4 w-4 text-primary" />
//                 <span>Carreras:</span>
//                 {school.career && school.career.length > 0 ? (
//                   school.career.map(cr => <Badge key={cr.id} variant="secondary">{cr.name}</Badge>)
//                 ) : <Badge variant="outline">Ninguna</Badge>}
//               </div>
//             </div>
//             <div className="flex items-center justify-between pt-2 border-t mt-3">
//                 <Badge variant={school.status === Status.ACTIVE ? 'default' : 'destructive'}>{school.status}</Badge>
//                 <div className="flex gap-2">
//                     <Button size="sm" variant="outline" onClick={() => onEdit(school.id)}>Editar</Button>
//                     <Button
//                         size="sm"
//                         variant="destructive"
//                         onClick={() => onDelete(school.id)}
//                         disabled={isEditing || (school.courses && school.courses.length > 0) || (school.career && school.career.length > 0)}
//                     >
//                         Eliminar
//                     </Button>
//                 </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     />
//   )
// }
