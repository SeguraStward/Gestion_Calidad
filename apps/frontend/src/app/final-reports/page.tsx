'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Button } from '@una-gc/ui/components/button'
import { MoreHorizontal, FileDown, Edit, Trash2, PlusCircle, Loader2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@una-gc/ui/components/dropdown-menu'
import { DataTable } from '@/app/(components)/ui/data-table'
import Link from 'next/link'
import { toast } from 'sonner'

import { useDeleteFinalReport, useFinalReportsByProfessor } from '@/modules/final-reports/service/final-reports.service'
import type { FullFinalReport, FinalReportStatusFE } from '@/modules/final-reports/types/final-reports.types'

// Helper to map status to display properties
const getStatusDisplayProperties = (statusValue: FinalReportStatusFE | undefined) => {
  const status = typeof statusValue === 'string' ? statusValue.toUpperCase() : undefined
  switch (status) {
    case 'PENDING':
      return { text: 'Pendiente', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' }
    case 'EVALUATED':
      return { text: 'Evaluado', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' }
    case 'ACTIVE':
      return { text: 'Activo', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' }
    default:
      return { text: statusValue || 'Desconocido', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400' }
  }
}

export default function FinalReportsPage() {
  const router = useRouter()

  // TODO: Replace with real professorId from auth/session/context
  const professorId = undefined // <-- Set this properly

  // Fetch final reports for the specific professor
  const {
    data: paginatedFinalReports,
    isLoading,
    error,
    refetch
  } = useFinalReportsByProfessor(
    professorId,
    { include: 'academicLoad,academicLoad.course,academicLoad.academicCycle,academicLoad.professor,academicLoad.group' },
    { enabled: !!professorId }
  )

  const finalReportsData: FullFinalReport[] = paginatedFinalReports?.data || []

  const deleteFinalReportMutation = useDeleteFinalReport()

  const handleEdit = (id: string) => {
    router.push(`/final-reports/edit/${id}`)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteFinalReportMutation.mutateAsync(id)
    } catch (err) {
      console.error('Error deleting final report:', err)
    }
  }

  const handleDownloadPdf = (id: string) => {
    console.log('Download PDF for report ID:', id)
    toast.info('Funcionalidad de descarga de PDF aún no implementada.')
  }

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
        accessorKey: 'academicLoad.academicCycle.name',
        header: 'Ciclo',
        size: 150,
        cell: ({ row }) => row.original.academicLoad?.academicCycle?.name || 'N/A'
      },
      {
        accessorKey: 'createdAt',
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
          const statusDisplay = getStatusDisplayProperties(row.original.status)
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
                  disabled={deleteFinalReportMutation.isPending && deleteFinalReportMutation.variables === row.original.id}
                >
                  {deleteFinalReportMutation.isPending && deleteFinalReportMutation.variables === row.original.id ? (
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
    [deleteFinalReportMutation.isPending, deleteFinalReportMutation.variables, router]
  )

  const newReportButton = (
    <Button asChild>
      <Link href="/final-reports/new">
        <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Informe Final
      </Link>
    </Button>
  )

  if (!professorId && !isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-orange-600 dark:text-orange-400 mb-4">
          ID de profesor no configurado. Por favor, configure un ID de profesor.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">Error al cargar los informes: {error.message}</p>
        <Button onClick={() => refetch()}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Informes Finales</h1>
      </div>

      <DataTable
        columns={columns}
        data={finalReportsData}
        isLoading={isLoading}
        searchPlaceholder="Buscar por NRC, curso..."
        newButton={newReportButton}
      />
    </div>
  )
}
