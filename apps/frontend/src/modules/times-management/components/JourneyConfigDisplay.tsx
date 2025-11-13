'use client'

import React from 'react'
import { Settings, Upload } from 'lucide-react'
import { EmptyState } from './EmptyState'
import { Button } from '@una-gc/ui/components/button'

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

export default function JourneyConfigDisplay({ config, loading, onUploadConfig, canEdit = false }: JourneyConfigDisplayProps) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const newConfig = JSON.parse(ev.target?.result as string)
        onUploadConfig?.(newConfig)
      } catch {
        alert('❌ Archivo JSON inválido. Por favor verifica el formato.')
      }
    }
    reader.readAsText(file)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-600">Cargando configuración...</span>
      </div>
    )
  }

  if (!config) {
    return (
      <EmptyState
        icon={<Settings className="h-16 w-16" />}
        title="No hay configuración de jornada activa"
        description="La configuración define los rangos de horas por tipo de jornada. Carga un archivo de configuración para comenzar."
        action={
          canEdit && onUploadConfig
            ? {
                label: 'Cargar Configuración',
                onClick: () => document.getElementById('config-upload')?.click()
              }
            : undefined
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Configuration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-sm font-medium text-gray-700 mb-1">¼ Tiempo</p>
          <p className="text-2xl font-bold text-blue-700">
            {config.quarterTimeMinHours} - {config.quarterTimeMaxHours}h
          </p>
          <p className="text-xs text-gray-600 mt-1">Valor: {config.quarterTimeValue}</p>
        </div>

        <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-sm font-medium text-gray-700 mb-1">½ Tiempo</p>
          <p className="text-2xl font-bold text-green-700">
            {config.halfTimeMinHours} - {config.halfTimeMaxHours}h
          </p>
          <p className="text-xs text-gray-600 mt-1">Valor: {config.halfTimeValue}</p>
        </div>

        {config.threeQuarterMinHours && config.threeQuarterMaxHours && (
          <div className="p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
            <p className="text-sm font-medium text-gray-700 mb-1">¾ Tiempo</p>
            <p className="text-2xl font-bold text-yellow-700">
              {config.threeQuarterMinHours} - {config.threeQuarterMaxHours}h
            </p>
            <p className="text-xs text-gray-600 mt-1">Valor: {config.threeQuarterTimeValue}</p>
          </div>
        )}

        <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <p className="text-sm font-medium text-gray-700 mb-1">Tiempo Completo</p>
          <p className="text-2xl font-bold text-purple-700">Desde {config.fullTimeMinHours}h</p>
          <p className="text-xs text-gray-600 mt-1">Valor: {config.fullTimeValue}</p>
        </div>

        <div className="p-4 border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-1">Máximo Diario</p>
          <p className="text-2xl font-bold text-gray-700">{config.maxDailyHours || 12}h</p>
          <p className="text-xs text-gray-600 mt-1">Límite por día</p>
        </div>

        <div className="p-4 border rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100">
          <p className="text-sm font-medium text-gray-700 mb-1">Año de Vigencia</p>
          <p className="text-2xl font-bold text-indigo-700">{config.effectiveYear || '—'}</p>
          <p className="text-xs text-gray-600 mt-1">
            Estado:{' '}
            <span className={`font-semibold ${config.status === 'Activo' ? 'text-green-600' : 'text-gray-600'}`}>
              {config.status || 'Sin definir'}
            </span>
          </p>
        </div>
      </div>

      {/* Upload Section (Admin only) */}
      {canEdit && onUploadConfig && (
        <div className="border-t pt-6">
          <div className="flex items-start gap-4">
            <Upload className="h-5 w-5 text-gray-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Actualizar Configuración</h3>
              <p className="text-sm text-gray-600 mb-3">
                Solo administradores pueden cargar una nueva configuración de jornada. Asegúrate de que el archivo JSON tenga el
                formato correcto.
              </p>
              <input id="config-upload" type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              <Button variant="outline" size="sm" onClick={() => document.getElementById('config-upload')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Seleccionar archivo JSON
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
