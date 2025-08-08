'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { FileDown, Edit, Trash2, Eye, MoreHorizontal, Loader2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@una-gc/ui/components/dropdown-menu'
import { Button } from '@una-gc/ui/components/button'
import { Badge } from '@una-gc/ui/components/badge'
import { DataTable } from '@/app/(components)/ui/data-table'
import { EvidenceType } from '../types/evidence.types'
import { useEvidences, useDeleteEvidence } from '../service/evidence.service'
import { criteriaMock } from '../mocks/criteria'
import { careersMock } from '../mocks/careers'

// Helper for converting bytes to readable format
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Helper to get status display properties
const getStatusDisplayProperties = (status: string) => {
  switch (status) {
    case 'PENDING':
      return { text: 'Pendiente', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' }
    case 'APPROVED':
      return { text: 'Aprobado', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' }
    case 'REJECTED':
      return { text: 'Rechazado', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' }
    case 'ACTIVE':
      return { text: 'Activo', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' }
    default:
      return { text: status, className: 'bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400' }
  }
}

export function EvidenceTable() {
  const router = useRouter()
  const { data: evidences, isLoading, refetch } = useEvidences()
  const deleteEvidenceMutation = useDeleteEvidence()
  const [isGeneratingPdfId, setIsGeneratingPdfId] = useState<string | null>(null)

  const handleView = (id: string) => {
    router.push(`/evidence-management/view/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/evidence-management/edit/${id}`)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteEvidenceMutation.mutateAsync(id)
      refetch()
    } catch (error) {
      console.error('Error deleting evidence:', error)
    }
  }

  const handleDownload = async (evidence: EvidenceType) => {
    setIsGeneratingPdfId(evidence.id)

    // Simulate download delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Open the Google Drive link in a new tab
    window.open(evidence.driveFileLink, '_blank')

    setIsGeneratingPdfId(null)
  }

  const columns: ColumnDef<EvidenceType>[] = [
    {
      accessorKey: 'documentCode',
      header: 'Código',
      size: 100,
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.documentCode}
        </div>
      )
    },
    {
      accessorKey: 'documentType',
      header: 'Tipo',
      size: 120,
      cell: ({ row }) => {
        const typeMap: Record<string, string> = {
          'NORMATIVA': 'Normativa',
          'INFORME': 'Informe',
          'ACTA': 'Acta',
          'PLAN': 'Plan',
          'CONVENIO': 'Convenio',
          'OTRO': 'Otro'
        }
        return <Badge>{typeMap[row.original.documentType] || row.original.documentType}</Badge>
      }
    },
    {
      accessorKey: 'description',
      header: 'Descripción',
      cell: ({ row }) => (
        <div className="max-w-[250px] truncate" title={row.original.description || ''}>
          {row.original.description || 'Sin descripción'}
        </div>
      )
    },
    {
      accessorKey: 'fileType',
      header: 'Formato',
      size: 80,
      cell: ({ row }) => {
        const fileType = row.original.fileType
        const extension = fileType.split('/').pop()?.toUpperCase() || fileType
        return <Badge variant="outline">{extension}</Badge>
      }
    },
    {
      accessorKey: 'careers',
      header: 'Carreras',
      size: 200,
      cell: ({ row }) => {
        const careerNames = row.original.careerIds.map(id => {
          const career = careersMock.find(c => c.id === id)
          return career?.name || id
        })

        return (
          <div className="max-w-[200px] truncate" title={careerNames.join(', ')}>
            {careerNames.join(', ')}
          </div>
        )
      }
    },
    {
      accessorKey: 'evidencePromptLinks',
      header: 'Evidencias Cubiertas',
      size: 100,
      cell: ({ row }) => {
        const count = row.original.evidencePromptLinks?.length ?? 0
        return (
          <div className="text-center">
            <Badge variant="secondary">{count}</Badge>
          </div>
        )
      }
    },
    {
      accessorKey: 'fileSize',
      header: 'Tamaño',
      size: 80,
      cell: ({ row }) => formatFileSize(row.original.fileSize)
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      size: 100,
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
        const evidence = row.original
        const isCurrentPdfGenerating = isGeneratingPdfId === evidence.id
        const isDeleting = deleteEvidenceMutation.isPending && deleteEvidenceMutation.variables === evidence.id

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
                <DropdownMenuItem onClick={() => handleView(evidence.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEdit(evidence.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload(evidence)}>
                  {isCurrentPdfGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="mr-2 h-4 w-4" />
                  )}
                  Descargar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(evidence.id)}
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
  ]

  return (
    <DataTable
      columns={columns}
      data={evidences || []}
      isLoading={isLoading}
      searchPlaceholder="Buscar por título, año, criterio..."

    />
  )
}