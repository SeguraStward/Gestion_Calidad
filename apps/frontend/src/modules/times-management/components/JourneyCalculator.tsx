'use client'

import React, { useState } from 'react'
import { AlertCircle, Calculator, CheckCircle } from 'lucide-react'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { Input } from '@una-gc/ui/components/input'

import type { JourneyConfig } from './JourneyConfigDisplay'

interface JourneyCalculatorProps {
  config: JourneyConfig | null
}

function calculateJourneyType(hours: number, cfg: JourneyConfig | null) {
  if (!cfg) return null

  if (hours >= cfg.quarterTimeMinHours && hours <= cfg.quarterTimeMaxHours) {
    return { type: 'Cuarto de tiempo', value: cfg.quarterTimeValue, color: 'blue' }
  }

  if (hours >= cfg.halfTimeMinHours && hours <= cfg.halfTimeMaxHours) {
    return { type: 'Medio tiempo', value: cfg.halfTimeValue, color: 'green' }
  }

  if (
    cfg.threeQuarterMinHours != null &&
    cfg.threeQuarterMaxHours != null &&
    cfg.threeQuarterTimeValue != null &&
    hours >= cfg.threeQuarterMinHours &&
    hours <= cfg.threeQuarterMaxHours
  ) {
    return { type: 'Tres cuartos de tiempo', value: cfg.threeQuarterTimeValue, color: 'yellow' }
  }

  if (hours >= cfg.fullTimeMinHours) {
    return { type: 'Tiempo completo', value: cfg.fullTimeValue, color: 'purple' }
  }

  return { type: 'Fuera de rango', value: 0, color: 'gray' }
}

export default function JourneyCalculator({ config }: JourneyCalculatorProps) {
  const [hours, setHours] = useState('')
  const [result, setResult] = useState<{ type: string; value: number; color: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    setResult(null)

    if (!config) {
      setError('No hay una configuracion de jornada activa.')
      return
    }

    const h = Number(hours)

    if (!hours || Number.isNaN(h)) {
      setError('Ingresa una cantidad valida de horas.')
      return
    }

    if (h <= 0) {
      setError('Las horas deben ser mayores a 0.')
      return
    }

    const maxHours = config.maxDailyHours || 12
    if (h > maxHours) {
      setError(`El valor excede el maximo permitido de ${maxHours} horas.`)
      return
    }

    setResult(calculateJourneyType(h, config))
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleCalculate()
    }
  }

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    purple: 'bg-violet-50 border-violet-200 text-violet-900',
    gray: 'bg-gray-50 border-gray-200 text-gray-900'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            type="number"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Cantidad de horas"
            min="0"
            step="0.5"
            className="text-lg"
          />
        </div>
        <Button onClick={handleCalculate} size="lg" className="sm:w-auto">
          <Calculator className="mr-2 h-4 w-4" />
          Convertir
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <p className="font-medium text-red-900">No se pudo realizar la conversion</p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className={`border-2 ${colorClasses[result.color as keyof typeof colorClasses]}`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-8 w-8 flex-shrink-0 text-green-600" />
              <div className="flex-1">
                <p className="mb-2 text-sm font-medium text-gray-700">
                  {hours} hora{Number(hours) !== 1 ? 's' : ''} corresponde a:
                </p>
                <p className="mb-2 text-3xl font-bold">{result.type}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-medium">
                    Fraccion equivalente: <span className="text-lg font-bold">{result.value}</span>
                  </span>
                  {result.value === 1 ? (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Tiempo completo
                    </span>
                  ) : (
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      Tiempo parcial
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {config && !result && !error && (
        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          <p className="mb-2 font-medium">Rangos activos</p>
          <ul className="ml-4 space-y-1">
            <li>Cuarto de tiempo: {config.quarterTimeMinHours} - {config.quarterTimeMaxHours} horas</li>
            <li>Medio tiempo: {config.halfTimeMinHours} - {config.halfTimeMaxHours} horas</li>
            {config.threeQuarterMinHours && config.threeQuarterMaxHours ? (
              <li>
                Tres cuartos de tiempo: {config.threeQuarterMinHours} - {config.threeQuarterMaxHours} horas
              </li>
            ) : null}
            <li>Tiempo completo: desde {config.fullTimeMinHours} horas</li>
            <li className="mt-2 text-gray-500">Maximo permitido: {config.maxDailyHours || 12} horas</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export { calculateJourneyType }
