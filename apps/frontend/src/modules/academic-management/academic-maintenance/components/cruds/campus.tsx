// // Campus CRUD datatable and form using form-adapter
// 'use client'

// import { useMemo, useState } from 'react'
// import { ColumnDef } from '@tanstack/react-table'
// import { CrudModuleBase, ColumnUtilities } from '@/app/(components)/crud/crud-module-base'
// import { CrudFormAdapter } from '@/app/(components)/crud/crud-form-adapter'
// import {
//   useCreateCampus,
//   useUpdateCampus,
//   useRemoveCampus,
//   useOneCampus,
//   useListCampusesPaginated
// } from '@/modules/academic-management/academic-maintenance/hooks/institutional/useCampus'
// import { useListRegionalCenters } from '@/modules/academic-management/academic-maintenance/hooks/institutional/useRegionalCenter'
// import { CampusWithRelations, CreateCampusInput } from '@/modules/academic-management/academic-maintenance/types/institutional/campus'
// import { Status } from '@una-gc/database/prisma/generated/client'
// import { UseFormReturn } from 'react-hook-form'
// import {
//   Badge,
//   Button
// } from '@una-gc/ui/components'
// import {
//   Loader2,
//   Hash,
//   Building2,
//   Globe,
//   MoreHorizontal,
//   Pencil,
//   Trash2,
//   CheckCircle2,
//   XCircle
// } from 'lucide-react'
// import { AlertMessage } from '@/app/(components)/ui/alert-message'

// // Status options for select
// const STATUS_OPTIONS = [
//   {
//     id: Status.ACTIVE,
//     name: 'Activo',
//     icon: <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />,
//     description: 'El campus está operativo y visible en el sistema'
//   },
//   {
//     id: Status.INACTIVE,
//     name: 'Inactivo',
//     icon: <XCircle className="h-4 w-4 text-red-500 mr-2" />,
//     description: 'El campus no está operativo y permanecerá oculto'
//   }
// ]

// interface CampusItem extends CampusWithRelations {}
// type UpdateCampusInput = Partial<CreateCampusInput>

// export default function CampusCrud() {
//   const [deleteId, setDeleteId] = useState<string | null>(null)
//   const deleteMutation = useRemoveCampus()

//   // Regional centers for select
//   const { data: regionalCenters, isLoading: isLoadingRegionalCenters } = useListRegionalCenters()

//   // Table columns
//   const renderColumns = useMemo(() => (
//     (utils: ColumnUtilities<CampusItem>): ColumnDef<CampusItem>[] => [
//       {
//         accessorKey: 'code',
//         header: 'Código',
//         size: 100,
//         cell: ({ row }) => (
//           <div className="flex items-center">
//             <Hash className="h-4 w-4 text-primary mr-2" />
//             <span>{row.original.code}</span>
//           </div>
//         )
//       },
//       {
//         accessorKey: 'name',
//         header: 'Nombre',
//         size: 200,
//         cell: ({ row }) => (
//           <div className="flex items-center">
//             <Building2 className="h-4 w-4 text-primary mr-2" />
//             <span className="font-medium">{row.original.name}</span>
//           </div>
//         )
//       },
//       {
//         accessorKey: 'description',
//         header: 'Descripción',
//         size: 250,
//         cell: ({ row }) => (
//           <div className="truncate max-w-xs">{row.original.description}</div>
//         )
//       },
//       {
//         accessorKey: 'regionalCenter.name',
//         header: 'Sede Regional',
//         size: 180,
//         cell: ({ row }) => (
//           <div className="flex items-center">
//             <Globe className="h-4 w-4 text-primary mr-2" />
//             <span>{row.original.regionalCenter?.name || '-'}</span>
//           </div>
//         )
//       },
//       {
//         accessorKey: 'status',
//         header: 'Estado',
//         size: 100,
//         cell: ({ row }) => {
//           const status = row.original.status
//           let badgeClasses = ''
//           let statusText = ''
//           if (status === Status.ACTIVE) {
//             badgeClasses = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
//             statusText = 'Activo'
//           } else {
//             badgeClasses = 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-800'
//             statusText = 'Inactivo'
//           }
//           return (
//             <Badge variant="outline" className={badgeClasses}>{statusText}</Badge>
//           )
//         }
//       },
//       {
//         id: 'actions',
//         header: () => <div className="text-right">Acciones</div>,
//         size: 80,
//         cell: ({ row }) => (
//           <div className="text-right flex gap-1 justify-end">
//             <Button
//               variant="ghost"
//               className="h-8 w-8 p-0"
//               onClick={() => utils.onEdit(row.original.id)}
//               title="Editar"
//             >
//               <Pencil className="h-4 w-4" />
//             </Button>
//             <AlertMessage
//               title="¿Desea eliminar el campus?"
//               description={`Esta acción no se puede deshacer. ¿Eliminar "${row.original.name}"?`}
//               variant="danger"
//               confirmText="Eliminar"
//               cancelText="Cancelar"
//               onConfirm={() => {
//                 setDeleteId(row.original.id)
//                 deleteMutation.mutate(row.original.id, {
//                   onSuccess: () => setDeleteId(null),
//                   onError: () => setDeleteId(null)
//                 })
//               }}
//               trigger={
//                 <Button
//                   variant="ghost"
//                   className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50"
//                   title="Eliminar"
//                   disabled={deleteMutation.isPending && deleteId === row.original.id}
//                 >
//                   {deleteMutation.isPending && deleteId === row.original.id ? (
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                   ) : (
//                     <Trash2 className="h-4 w-4" />
//                   )}
//                 </Button>
//               }
//             />
//           </div>
//         )
//       }
//     ]
//   ), [deleteId, deleteMutation])

//   // Form sections for create/edit
//   const renderForm = useMemo(() => {
//     return ({ control, errors, editingItem, isUpdate, handleSubmitForm, handleCancel, isProcessing }: any) => {
//       return (
//         <CrudFormAdapter
//           control={control}
//           errors={errors}
//           editingItem={editingItem}
//           isUpdate={isUpdate}
//           isProcessing={isProcessing}
//           handleSubmitForm={handleSubmitForm}
//           handleCancel={handleCancel}
//           title={isUpdate ? 'Editar Campus' : 'Crear Nuevo Campus'}
//           description={isUpdate ? 'Actualice los datos del campus' : 'Complete los datos para registrar un nuevo campus'}
//           sections={() => [{
//             title: 'Datos del Campus',
//             description: 'Información principal del campus',
//             fields: [
//               {
//                 type: 'text',
//                 name: 'code',
//                 label: 'Código',
//                 required: true,
//                 placeholder: 'Ej: CAMP-001',
//                 helperText: 'Código único del campus',
//                 disabled: isUpdate
//               },
//               {
//                 type: 'text',
//                 name: 'name',
//                 label: 'Nombre',
//                 required: true,
//                 placeholder: 'Ej: Campus Central',
//                 helperText: 'Nombre completo del campus'
//               },
//               {
//                 type: 'text',
//                 name: 'description',
//                 label: 'Descripción',
//                 required: true,
//                 placeholder: 'Descripción del campus',
//                 helperText: 'Breve descripción del campus'
//               },
//               {
//                 type: 'select',
//                 name: 'regionalCenter',
//                 label: 'Sede Regional',
//                 required: true,
//                 options: (regionalCenters || []).map(rc => ({ id: rc.id, name: rc.name })),
//                 isLoading: isLoadingRegionalCenters,
//                 placeholder: isLoadingRegionalCenters ? 'Cargando sedes...' : 'Seleccionar sede regional',
//                 helperText: 'Seleccione la sede regional a la que pertenece este campus',
//                 // Adapter expects value to be { connect: { id } }
//                 renderOption: (option: any) => <span>{option.name}</span>
//               },
//               {
//                 type: 'select',
//                 name: 'status',
//                 label: 'Estado',
//                 required: true,
//                 options: STATUS_OPTIONS,
//                 helperText: 'Estado actual del campus',
//                 renderOption: (option: any) => (
//                   <div className="flex items-center">{option.icon}<span>{option.name}</span></div>
//                 )
//               }
//             ]
//           }]}
//         />
//       )
//     }
//   }, [regionalCenters, isLoadingRegionalCenters])

//   const crudConfig = useMemo(() => ({
//     entityName: 'Campus',
//     entityNamePlural: 'Campus',
//     searchPlaceholder: 'Buscar por código, nombre o sede...',
//     usePaginatedQuery: useListCampusesPaginated,
//     useCreateMutation: useCreateCampus,
//     useUpdateMutation: useUpdateCampus,
//     useDeleteMutation: useRemoveCampus,
//     useOneQuery: (id: string, options?: any) => useOneCampus(id, undefined, options),
//     defaultFormValues: {
//       code: '',
//       name: '',
//       description: '',
//       regionalCenter: { connect: { id: '' } },
//       status: Status.ACTIVE
//     } as unknown as CreateCampusInput,
//     renderForm,
//     renderColumns,
//     processItemForEditing: (item: CampusItem) => ({
//       code: item.code || '',
//       name: item.name || '',
//       description: item.description || '',
//       regionalCenter: item.regionalCenter ? { connect: { id: item.regionalCenter.id } } : undefined,
//       status: item.status || Status.ACTIVE
//     }),
//     preDeleteCheck: (item: CampusItem) => {
//       // Si tiene aulas asociadas, advertir
//       if (item.classrooms && item.classrooms.length > 0) {
//         return 'No se puede eliminar un campus con aulas asociadas.'
//       }
//       return null
//     }
//   }), [renderForm, renderColumns])

//   // Obtener la fila seleccionada para eliminar
//   // (opcional, para mostrar nombre en el modal)
//   // const selectedRow = (campuses || []).find((item: CampusItem) => item.id === deleteId)

//   return (
//     <>
//       <CrudModuleBase {...crudConfig} />
//       <AlertMessage
//         open={!!deleteId}
//         onOpenChange={(open: boolean) => !open && setDeleteId(null)}
//         title="¿Desea eliminar el campus?"
//         description={deleteId ? 'Esta acción no se puede deshacer.' : ''}
//         variant="danger"
//         confirmText="Eliminar"
//         cancelText="Cancelar"
//         onConfirm={() => {
//           if (deleteId) {
//             deleteMutation.mutate(deleteId, {
//               onSuccess: () => setDeleteId(null),
//               onError: () => setDeleteId(null)
//             })
//           }
//         }}
//       />
//     </>
//   )
// }

// CampusCrud.displayName = 'CampusCrud'
