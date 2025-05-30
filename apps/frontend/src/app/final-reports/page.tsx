'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@una-gc/ui/components/button'
import { MoreHorizontal, FileDown, Edit, Trash2, PlusCircle, Loader2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@una-gc/ui/components/dropdown-menu'
import { DataTable } from '@/app/(components)/ui/data-table'
import Link from 'next/link'
import { toast } from 'sonner'

// 1. Import hooks and types
import { useFinalReports, useDeleteFinalReport } from '@/modules/final-reports/service/final-reports.service' // Adjusted path
import type { FullFinalReport, FinalReportStatusFE } from '@/modules/final-reports/types/final-reports.types' // Adjusted path

// Helper to map status to display properties
const getStatusDisplay = (statusValue: FinalReportStatusFE | undefined) => {
  const status = typeof statusValue === 'string' ? statusValue.toUpperCase() : undefined
  switch (status) {
    case 'APPROVED':
      return { text: 'Aprobado', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' }
    case 'REVIEW': // Assuming 'REVIEW' is a possible backend status
    case 'ENVIADO PARA REVISIÓN': // Legacy from mock
      return { text: 'En Revisión', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' }
    case 'OBSERVATIONS':
    case 'CON OBSERVACIONES': // Legacy from mock
      return { text: 'Con Observaciones', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' }
    case 'DRAFT':
    case 'BORRADOR': // Legacy from mock
      return { text: 'Borrador', className: 'bg-gray-200 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300' }
    case 'PENDING':
      return { text: 'Pendiente', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' }
    case 'EVALUATED':
      return { text: 'Evaluado', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' }
    default:
      return { text: statusValue || 'Desconocido', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400' }
  }
}

export default function FinalReportsPage() {
  const router = useRouter()

  // 2. Fetch data using useFinalReports
  // You can pass filter objects to useFinalReports if needed, e.g., useFinalReports({ page: 1, limit: 10 })
  const { data: paginatedData, isLoading, error, refetch } = useFinalReports()
  const deleteMutation = useDeleteFinalReport()

  // Extract the actual data array for the table
  const informesData: FullFinalReport[] = paginatedData?.data || []

  const handleEdit = (id: string) => {
    router.push(`/final-reports/edit/${id}`)
  }

  const handleDelete = async (id: string) => {
    // Optional: Add a confirmation dialog (e.g., using SweetAlert2 or a custom modal)
    // For now, directly calling the mutation
    try {
      await deleteMutation.mutateAsync(id)
      // Toast notifications for success/error are handled by the createGenericHooks config
      // refetch(); // TanStack Query often handles refetching via invalidation automatically
    } catch (err) {
      // Error already handled by the hook's toast, but you can log it or do other things
      console.error('Error deleting final report:', err)
    }
  }

  const handleDownloadPdf = (id: string) => {
    console.log('Descargar PDF del informe:', id)
    toast.info('Funcionalidad de descarga de PDF aún no implementada.')
  }

  // 3. Adapt columns definition
  const columns = useMemo<ColumnDef<FullFinalReport>[]>(
    () => [
      {
        accessorKey: 'academicLoad.nrc',
        header: 'NRC',
        size: 80,
        cell: ({ row }) => row.original.academicLoad?.nrc || 'N/A'
      },
      {
        accessorKey: 'academicLoad.course.code',
        header: 'Código Curso',
        size: 120,
        cell: ({ row }) => row.original.academicLoad?.course?.code || 'N/A'
      },
      {
        accessorKey: 'academicLoad.course.name',
        header: 'Nombre Curso',
        minSize: 200,
        cell: ({ row }) => row.original.academicLoad?.course?.name || 'N/A'
      },
      {
        accessorKey: 'academicLoad.academicCycle.name', // Assuming 'name' is the field for cycle description
        header: 'Ciclo',
        size: 150,
        cell: ({ row }) => row.original.academicLoad?.academicCycle?.name || 'N/A'
      },
      {
        accessorKey: 'createdAt', // Using the FinalReport's createdAt
        header: 'Fecha Creación',
        size: 120,
        cell: ({ row }) => (row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : 'N/A')
      },
      {
        accessorKey: 'statistics.totalStudents',
        header: 'Estudiantes',
        size: 100,
        cell: ({ row }) => row.original.statistics?.totalStudents ?? 'N/A'
      },
      {
        accessorKey: 'status',
        header: 'Estado Reporte',
        size: 150,
        cell: ({ row }) => {
          const statusDisplay = getStatusDisplay(row.original.status)
          return (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusDisplay.className}`}>
              {statusDisplay.text}
            </span>
          )
        }
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Acciones</div>,
        size: 100,
        cell: ({ row }) => (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menú</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit(row.original.id)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownloadPdf(row.original.id)
                  }}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Ver PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(row.original.id)
                  }}
                  className="text-red-600 hover:!text-red-600 hover:!bg-red-100 dark:hover:!bg-red-900/50"
                  disabled={deleteMutation.isPending && deleteMutation.variables === row.original.id}
                >
                  {deleteMutation.isPending && deleteMutation.variables === row.original.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deleteMutation.isPending, deleteMutation.variables, router] // router is stable from next/navigation
  )

  const newReportButton = (
    <Button asChild>
      <Link href="/final-reports/new">
        <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Informe Final
      </Link>
    </Button>
  )

  // 4. Handle loading and error states
  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">Error al cargar los informes: {error.message}</p>
        <Button onClick={() => refetch()}>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reintentar
        </Button>
      </div>
    )
  }

  // DataTable already handles the "No results" case internally if data is empty.
  // The isLoading prop is passed to DataTable to handle its own loading display.
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Informes Finales</h1>
      </div>

      <DataTable
        columns={columns}
        data={informesData}
        isLoading={isLoading} // Pass isLoading to DataTable
        searchPlaceholder="Buscar por NRC, curso, profesor..."
        newButton={newReportButton}
        initialPageSize={10}
        // onRowClick={(row) => router.push(`/final-reports/view/${row.original.id}`)} // Example
        // For server-side pagination, you'd manage pageIndex, pageSize state here
        // and pass them as filters to useFinalReports, then update DataTable props.
        // currentPage={paginatedData?.meta?.page}
        // totalPages={paginatedData?.meta?.totalPages}
        // onPageChange={(page) => { /* update filters and refetch */ }}
      />
    </div>
  )
}
