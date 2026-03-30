'use client'

import React from 'react'
import { Settings } from 'lucide-react'
import { EmptyState } from './EmptyState'

export interface JourneyConfig {
  id?: string
  quarterTimeMinHours: number
  quarterTimeMaxHours: number
  quarterTimeValue: number
  halfTimeMinHours: number
  halfTimeMaxHours: number
  halfTimeValue: number
  fullTimeMinHours: number
  fullTimeValue: number
  threeQuarterMinHours?: number
  threeQuarterMaxHours?: number
  threeQuarterTimeValue?: number
  maxDailyHours?: number
  effectiveYear?: number | string
  status?: string
}

interface JourneyConfigDisplayProps {
  config: JourneyConfig | null
  loading?: boolean
  onUploadConfig?: (config: JourneyConfig) => void
  canEdit?: boolean
}

export default function JourneyConfigDisplay({ config, loading }: JourneyConfigDisplayProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-600">Cargando configuracion...</span>
      </div>
    )
  }

  if (!config) {
    return (
      <EmptyState
        icon={<Settings className="h-16 w-16" />}
        title="No hay configuracion de jornada activa"
        description="La configuracion define los rangos de horas por tipo de jornada. Crea o activa una configuracion para continuar."
      />
    )
  }

  const statusLabel = config.status || 'Sin definir'
  const statusColor = config.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-600'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">1/4 Tiempo</p>
          <p className="text-2xl font-bold">{config.quarterTimeMinHours} - {config.quarterTimeMaxHours}h</p>
          <p className="text-xs text-muted-foreground mt-1">Valor: {config.quarterTimeValue}</p>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">1/2 Tiempo</p>
          <p className="text-2xl font-bold">{config.halfTimeMinHours} - {config.halfTimeMaxHours}h</p>
          <p className="text-xs text-muted-foreground mt-1">Valor: {config.halfTimeValue}</p>
        </div>

        {config.threeQuarterMinHours && config.threeQuarterMaxHours && (
          <div className="p-4 border rounded-lg bg-card">
            <p className="text-sm font-medium text-muted-foreground mb-1">3/4 Tiempo</p>
            <p className="text-2xl font-bold">{config.threeQuarterMinHours} - {config.threeQuarterMaxHours}h</p>
            <p className="text-xs text-muted-foreground mt-1">Valor: {config.threeQuarterTimeValue}</p>
          </div>
        )}

        <div className="p-4 border rounded-lg bg-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Tiempo Completo</p>
          <p className="text-2xl font-bold">Desde {config.fullTimeMinHours}h</p>
          <p className="text-xs text-muted-foreground mt-1">Valor: {config.fullTimeValue}</p>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Maximo Diario</p>
          <p className="text-2xl font-bold">{config.maxDailyHours || 12}h</p>
          <p className="text-xs text-muted-foreground mt-1">Limite por dia</p>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <p className="text-sm font-medium text-muted-foreground mb-1">Año de Vigencia</p>
          <p className="text-2xl font-bold">{config.effectiveYear || '-'}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Estado: <span className={`font-semibold ${statusColor}`}>{statusLabel}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
