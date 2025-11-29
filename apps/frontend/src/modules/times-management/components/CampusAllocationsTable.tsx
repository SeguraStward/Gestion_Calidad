'use client'

import React from 'react'
import { Building2 } from 'lucide-react'
import { EmptyState } from './EmptyState'

export interface CampusAllocation {
  id?: string
  campus: string
  cycle: string
  career: string
  totalHours: number
  status: string
}

interface CampusAllocationsTableProps {
  allocations: CampusAllocation[]
  loading?: boolean
}

const STATUS_COLORS: Record<string, string> = {
  Activo: 'bg-green-100 text-green-800',
  Planeado: 'bg-yellow-100 text-yellow-800',
  Inactivo: 'bg-gray-100 text-gray-800',
  Completado: 'bg-blue-100 text-blue-800'
}

export default function CampusAllocationsTable({ allocations, loading }: CampusAllocationsTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-600">Cargando asignaciones...</span>
      </div>
    )
  }

  if (!allocations || allocations.length === 0) {
    return (
      <EmptyState
        icon={<Building2 className="h-16 w-16" />}
        title="No hay asignaciones de campus registradas"
        description="Las asignaciones de campus distribuyen las horas de jornada por sede y ciclo académico. Configura la primera asignación para comenzar."
      />
    )
  }

  // Calcular totales por campus
  const totalBrunca = allocations.filter((a) => a.campus.includes('Brunca')).reduce((sum, a) => sum + a.totalHours, 0)

  const totalCoto = allocations.filter((a) => a.campus.includes('Coto')).reduce((sum, a) => sum + a.totalHours, 0)

  const totalGeneral = allocations.reduce((sum, a) => sum + a.totalHours, 0)

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Campus</th>
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Ciclo</th>
              <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Horas Totales</th>
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((allocation, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">{allocation.campus}</td>
                <td className="border border-gray-300 px-4 py-2">{allocation.cycle}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <span className="font-semibold text-lg">{allocation.totalHours}h</span>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                      STATUS_COLORS[allocation.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {allocation.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Card - Solo mostrar total general */}
      <div className="pt-4 border-t">
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Total General Asignado</p>
              <p className="text-xs text-green-600 mt-1">Suma de todas las asignaciones de campus</p>
            </div>
            <p className="text-3xl font-bold text-green-800">{totalGeneral}h</p>
          </div>
        </div>
      </div>
    </div>
  )
}
