'use client'

import React from 'react'
import { Building2, Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import { Button } from '@una-gc/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@una-gc/ui/components/dropdown-menu'

import type { ExternalProvider } from '../services/external-providers.service'
import { EmptyState } from './EmptyState'

interface ExternalProvidersTableProps {
  providers: ExternalProvider[]
  onEdit?: (provider: ExternalProvider) => void
  onDelete?: (id: string) => void
  onView?: (provider: ExternalProvider) => void
  loading?: boolean
}

const PROVIDER_TYPE_LABELS: Record<string, string> = {
  UNIVERSITY: 'Universidad',
  AGREEMENT: 'Convenio',
  EXCHANGE: 'Intercambio',
  OTHER: 'Otro'
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  PENDING: 'Pendiente',
  COMPLETED: 'Completado'
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-blue-100 text-blue-800'
}

export default function ExternalProvidersTable({ providers, onEdit, onDelete, onView, loading }: ExternalProvidersTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-600">Cargando proveedores...</span>
      </div>
    )
  }

  if (!providers || providers.length === 0) {
    return (
      <EmptyState
        icon={<Building2 className="h-16 w-16" />}
        title="No hay proveedores externos registrados"
        description="Los proveedores externos aportan tiempo de jornada adicional. Crea el primer proveedor para comenzar."
      />
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Nombre</th>
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Tipo</th>
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Horas Provistas</th>
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Contacto</th>
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Estado</th>
            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((provider) => (
            <tr key={provider.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">
                <div>
                  <p className="font-medium">{provider.name}</p>
                  {provider.description && <p className="text-sm text-gray-500 mt-1">{provider.description}</p>}
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-muted text-foreground">
                  {PROVIDER_TYPE_LABELS[provider.providerType] || provider.providerType}
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <span className="font-semibold text-lg">{provider.providedJourneyTime}h</span>
                {provider.isFixedTime && <span className="ml-2 text-xs text-gray-500">(Fijo)</span>}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {provider.contactPerson && <p className="text-sm font-medium">{provider.contactPerson}</p>}
                {provider.contactEmail && <p className="text-xs text-gray-600">{provider.contactEmail}</p>}
                {provider.contactPhone && <p className="text-xs text-gray-600">{provider.contactPhone}</p>}
                {!provider.contactPerson && !provider.contactEmail && !provider.contactPhone && (
                  <span className="text-gray-400 text-sm">Sin contacto</span>
                )}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${STATUS_COLORS[provider.status || 'ACTIVE']}`}>
                  {STATUS_LABELS[provider.status || 'ACTIVE']}
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {onView && (
                      <DropdownMenuItem onClick={() => onView(provider)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(provider)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => {
                          if (confirm(`Estas seguro de eliminar el proveedor "${provider.name}"?`)) {
                            onDelete(provider.id!)
                          }
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
