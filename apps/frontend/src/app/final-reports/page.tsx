'use client'

import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@una-gc/ui/components/button'
import { MoreHorizontal, FileDown, Edit, Trash2, PlusCircle, Loader2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@una-gc/ui/components/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@una-gc/ui/components/tabs'
import { ClipboardList, CheckCircle2 } from 'lucide-react'
import { DataTable } from '@/app/(components)/ui/data-table'
import { useAcademicLoadsByProfessor } from '@/modules/academic-loads/service/academic-loads.service'
import Link from 'next/link'
import { toast } from 'sonner'
import { pdf } from '@react-pdf/renderer'
import { useDebounce } from '@/shared/hooks/use-debounce'

// Cambio de import: usar session store en lugar del dev store
import { useSessionStore } from '@/modules/auth/sessionStore'
import { useDeleteFinalReport, useFinalReportsByProfessor } from '@/modules/final-reports/service/final-reports.service'
import type { FullFinalReport, FinalReportStatusFE } from '@/modules/final-reports/types/final-reports.types'
import { FinalReportPDFDocument } from '@/modules/final-reports/components/final-report-pdf'

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

  // Usar session store en lugar del dev store
  const { user, isAuthenticated } = useSessionStore()
  const professorId = user?.id

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(12)
  const [searchQuery, setSearchQuery] = useState('')
  const [isGeneratingPdfId, setIsGeneratingPdfId] = useState<string | null>(null)

  // Debounce del lado del servidor para la búsqueda. `useDebounce` devuelve el
  // valor directo (no un array): destructurarlo tomaba solo el primer carácter,
  // por eso la búsqueda parecía no funcionar.
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Resetear la página a 1 cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery])

  // Fetch final reports with pagination and search
  const {
    data: paginatedFinalReports,
    isLoading,
    error,
    refetch
  } = useFinalReportsByProfessor(
    professorId,
    {
      include:
        'academicLoad,academicLoad.course,academicLoad.academicCycle,academicLoad.professor,academicLoad.group,academicLoad.campus',
      page: currentPage,
      limit: pageSize,
      ...(debouncedSearchQuery && { search: debouncedSearchQuery })
    },
    { enabled: !!professorId && isAuthenticated() }
  )

  const finalReportsData = paginatedFinalReports?.data || []

  const totalItems = paginatedFinalReports?.meta?.total || 0
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  // Pending reports: the professor's academic loads that do NOT have a final
  // report yet, so they can see which ones they still need to complete.
  const { data: allLoadsData } = useAcademicLoadsByProfessor(
    professorId,
    { include: 'course,academicCycle,group', limit: 1000 },
    { enabled: !!professorId && isAuthenticated() }
  )
  const { data: allReportsData } = useFinalReportsByProfessor(
    professorId,
    { limit: 1000, include: 'academicLoad' },
    { enabled: !!professorId && isAuthenticated() }
  )
  const reportedLoadIds = useMemo(
    () =>
      new Set(
        (allReportsData?.data ?? [])
          // Match by either the scalar FK or the loaded relation id — the API
          // doesn't always serialize the scalar `academicLoadId`.
          .map((r) => r.academicLoadId ?? (r as any).academicLoad?.id)
          .filter(Boolean)
      ),
    [allReportsData]
  )
  const pendingLoads = useMemo(
    () => (allLoadsData?.data ?? []).filter((l) => !reportedLoadIds.has(l.id)),
    [allLoadsData, reportedLoadIds]
  )

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage)
  }, [])

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const deleteFinalReportMutation = useDeleteFinalReport()

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/final-reports/edit/${id}`)
    },
    [router]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteFinalReportMutation.mutateAsync(id)
      } catch (err) {
        console.error('Error deleting final report:', err)
      }
    },
    [deleteFinalReportMutation]
  )

  const handleDownloadPdf = async (report: FullFinalReport) => {
    if (!report) {
      toast.error('No se encontró el informe para generar el PDF.')
      return
    }
    try {
      const blob = await pdf(<FinalReportPDFDocument report={report} />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const fileName = `InformeFinal-${report.academicLoad?.nrc || report.id}.pdf`
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`PDF "${fileName}" descargado.`)
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError)
      toast.error('Error al generar el PDF. Revise la consola para más detalles.')
    } finally {
      setIsGeneratingPdfId(null)
    }
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
        cell: ({ row }) => {
          const report = row.original
          const isCurrentPdfGenerating = isGeneratingPdfId === report.id
          const isDeleting = deleteFinalReportMutation.isPending && deleteFinalReportMutation.variables === report.id

          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0" disabled={isCurrentPdfGenerating || isDeleting}>
                    {isCurrentPdfGenerating || isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MoreHorizontal className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(report.id)
                    }}
                    disabled={isCurrentPdfGenerating || isDeleting}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownloadPdf(report)
                    }}
                    disabled={isCurrentPdfGenerating || isDeleting}
                  >
                    {isCurrentPdfGenerating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileDown className="mr-2 h-4 w-4" />
                    )}
                    Ver PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(report.id)
                    }}
                    className="text-red-600 hover:!text-red-600 hover:!bg-red-100 dark:hover:!bg-red-900/50"
                    disabled={isDeleting || isCurrentPdfGenerating}
                  >
                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        }
      }
    ],
    [deleteFinalReportMutation.isPending, deleteFinalReportMutation.variables, isGeneratingPdfId, handleDelete, handleEdit]
  )

  const newReportButton = (
    <Button asChild>
      <Link href="/final-reports/new">
        <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Informe Final
      </Link>
    </Button>
  )

  // Verificar autenticación
  if (!isAuthenticated() && !isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-orange-600 dark:text-orange-400 mb-4">Debes estar autenticado para ver los informes finales.</p>
        <Button asChild>
          <Link href="/auth/login">Iniciar Sesión</Link>
        </Button>
      </div>
    )
  }

  if (!professorId && !isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-orange-600 dark:text-orange-400 mb-4">
          No se pudo obtener la información del profesor. Por favor, inicie sesión nuevamente.
        </p>
        <Button asChild>
          <Link href="/auth/login">Iniciar Sesión</Link>
        </Button>
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
        <div>
          <h1 className="text-3xl font-bold">Gestión de Informes Finales</h1>
          <p className="text-muted-foreground mt-2">Bienvenido, {user?.fullName}</p>
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Pendientes de realizar ({pendingLoads.length})
          </TabsTrigger>
          <TabsTrigger value="done" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Realizados ({totalItems})
          </TabsTrigger>
        </TabsList>

        {/* Pending: academic loads without a final report yet */}
        <TabsContent value="pending" className="mt-4">
          <p className="text-sm text-muted-foreground mb-3">
            Cursos asignados a su carga académica que aún no tienen informe final.
          </p>
          {pendingLoads.length === 0 ? (
            <div className="rounded-lg border p-8 text-center text-muted-foreground">
              No tiene cursos pendientes de informe. ¡Está al día!
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pendingLoads.map((load) => (
                <div key={load.id} className="rounded-lg border p-4 flex flex-col gap-3">
                  <div>
                    <div className="font-semibold">NRC {load.nrc}</div>
                    <div className="text-sm text-muted-foreground">
                      {load.course?.code ? `${load.course.code} - ` : ''}
                      {load.course?.name || 'Curso'}
                    </div>
                    {load.academicCycle?.name && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {load.academicCycle.name}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="mt-auto w-full"
                    onClick={() => router.push('/final-reports/new')}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Crear informe
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Done: reports already submitted */}
        <TabsContent value="done" className="mt-4">
          <DataTable
            columns={columns}
            data={finalReportsData}
            isLoading={isLoading}
            searchPlaceholder="Buscar por NRC, curso, nombre..."
            newButton={newReportButton}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            // Nuevas props para filtrado del lado del servidor
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            serverSideFiltering={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
