'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Edit, Eye, FileText, Search, Filter } from 'lucide-react'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@una-gc/ui/components/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@una-gc/ui/components/table'
import { Badge } from '@una-gc/ui/components/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { useFinalReportsForAdmin, useUpdateFinalReport } from '@/modules/final-reports/service/final-reports.service'
import type { FinalReportStatusFE, FullFinalReport } from '@/modules/final-reports/types/final-reports.types'
import { pdf } from '@react-pdf/renderer'
import { FinalReportPDFDocument } from '@/modules/final-reports/components/final-report-pdf'
import { toast } from 'sonner'

const STATUS_LABELS: Record<FinalReportStatusFE, string> = {
  PENDING: 'Pendiente',
  EVALUATED: 'Evaluado',
  DRAFT: 'Borrador',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  ACTIVE: 'Activo'
}

const STATUS_VARIANTS: Record<FinalReportStatusFE, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'secondary',
  EVALUATED: 'default',
  DRAFT: 'outline',
  APPROVED: 'default',
  REJECTED: 'destructive',
  ACTIVE: 'default'
}

export default function AdminFinalReportsPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<FinalReportStatusFE | 'ALL'>('ALL')
  const [professorFilter, setProfessorFilter] = useState('all')

  // Filtros para la query
  const filters = useMemo(() => {
    const f: any = { page, limit }
    if (statusFilter !== 'ALL') {
      f.status = statusFilter
    }
    if (searchTerm) {
      f.search = searchTerm
    }
    if (professorFilter && professorFilter !== 'all') {
      f.professorId = professorFilter
    }
    // Use comma-separated string format for include
    f.include = 'professor,academicLoad,academicLoad.course,academicLoad.academicCycle,academicLoad.campus'

    console.log('🔍 Admin Filters:', f)
    return f
  }, [page, limit, statusFilter, searchTerm, professorFilter])

  const { data, isLoading, refetch } = useFinalReportsForAdmin(filters)
  const updateMutation = useUpdateFinalReport()

  // Extract unique professors for filter
  const professors = useMemo(() => {
    if (!data?.data) return []
    const uniqueProfessors = new Map()
    data.data.forEach((report) => {
      if (report.professor) {
        uniqueProfessors.set(report.professor.id, report.professor)
      }
    })
    return Array.from(uniqueProfessors.values())
  }, [data])

  const handleStatusChange = async (reportId: string, newStatus: FinalReportStatusFE) => {
    try {
      await updateMutation.mutateAsync({
        id: reportId,
        data: { status: newStatus }
      })
      toast.success('Estado actualizado correctamente')
      refetch()
    } catch (error) {
      toast.error('Error al actualizar el estado')
      console.error('Error updating status:', error)
    }
  }

  const handleDownloadPDF = async (report: FullFinalReport) => {
    try {
      toast.info('Generando PDF...')
      const doc = <FinalReportPDFDocument report={report} />
      const asPdf = pdf(doc)
      const blob = await asPdf.toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Informe_Final_${report.academicLoad?.nrc || report.id}.pdf`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('PDF descargado exitosamente')
    } catch (error) {
      toast.error('Error al generar el PDF')
      console.error('Error generating PDF:', error)
    }
  }

  const handleViewDetails = (reportId: string) => {
    router.push(`/final-reports/${reportId}`)
  }

  const handleEdit = (reportId: string) => {
    // Pass returnTo parameter to indicate this is from admin view
    const editUrl = `/final-reports/edit/${reportId}?returnTo=admin`
    console.log('🔗 Admin page - Navigating to:', editUrl)
    router.push(editUrl)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administración de Informes Finales</h1>
          <p className="text-muted-foreground">
            Gestiona todos los informes finales del sistema
          </p>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtra los informes por estado, profesor o búsqueda general
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por NRC, curso, profesor..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchTerm(e.target.value)
                  setPage(1) // Reset to first page on search
                }}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value: string) => {
                setStatusFilter(value as FinalReportStatusFE | 'ALL')
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="EVALUATED">Evaluado</SelectItem>
              </SelectContent>
            </Select>

            {/* Professor Filter */}
            <Select
              value={professorFilter}
              onValueChange={(value: string) => {
                setProfessorFilter(value)
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por profesor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los profesores</SelectItem>
                {professors.map((prof) => (
                  <SelectItem key={prof.id} value={prof.id}>
                    {prof.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informes Finales
          </CardTitle>
          <CardDescription>
            {data?.meta.total || 0} informes encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !data?.data || data.data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron informes finales
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NRC</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Profesor</TableHead>
                      <TableHead>Ciclo Académico</TableHead>
                      <TableHead>Campus</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">
                          {report.academicLoad?.nrc || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {report.academicLoad?.course?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {report.academicLoad?.course?.code || ''}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {report.professor?.fullName || 'N/A'}
                            </div>
                            {/* Email field might not exist in professor type */}
                          </div>
                        </TableCell>
                        <TableCell>
                          {report.academicLoad?.academicCycle?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {report.academicLoad?.campus?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={report.status}
                            onValueChange={(value: string) =>
                              handleStatusChange(report.id, value as FinalReportStatusFE)
                            }
                          >
                            <SelectTrigger className="w-[130px]">
                              <Badge variant={STATUS_VARIANTS[report.status]}>
                                {STATUS_LABELS[report.status]}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PENDING">Pendiente</SelectItem>
                              <SelectItem value="EVALUATED">Evaluado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(report.id)}
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(report.id)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownloadPDF(report)}
                              title="Descargar PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data.meta.totalPages && data.meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Página {data.meta.page} de {data.meta.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= (data.meta.totalPages || 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
