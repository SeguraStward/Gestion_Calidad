'use client'

import React, { useState } from 'react'
import { Calculator, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Card, CardContent } from '@una-gc/ui/components/card'
import type { JourneyConfig } from './JourneyConfigDisplay'

interface JourneyCalculatorProps {
  config: JourneyConfig | null
}

function calculateJourneyType(hours: number, cfg: JourneyConfig | null) {
  if (!cfg) return null

  if (hours >= cfg.quarterTimeMinHours && hours <= cfg.quarterTimeMaxHours) {
    return { type: '¼ Tiempo', value: cfg.quarterTimeValue, color: 'blue' }
  }

  if (hours >= cfg.halfTimeMinHours && hours <= cfg.halfTimeMaxHours) {
    return { type: '½ Tiempo', value: cfg.halfTimeValue, color: 'green' }
  }

  if (
    cfg.threeQuarterMinHours != null &&
    cfg.threeQuarterMaxHours != null &&
    cfg.threeQuarterTimeValue != null &&
    hours >= cfg.threeQuarterMinHours &&
    hours <= cfg.threeQuarterMaxHours
  ) {
    return { type: '¾ Tiempo', value: cfg.threeQuarterTimeValue, color: 'yellow' }
  }

  if (hours >= cfg.fullTimeMinHours) {
    return { type: 'Tiempo Completo', value: cfg.fullTimeValue, color: 'purple' }
  }

  return { type: 'No definido', value: 0, color: 'gray' }
}

export default function JourneyCalculator({ config }: JourneyCalculatorProps) {
  const [hours, setHours] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCalculate = () => {
    setError(null)
    setResult(null)

    if (!config) {
      setError('No hay configuración de jornada cargada.')
      return
    }

    const h = Number(hours)

    if (!hours || isNaN(h)) {
      setError('Por favor ingresa un número válido de horas.')
      return
    }

    if (h <= 0) {
      setError('Las horas deben ser mayores a 0.')
      return
    }

    const maxHours = config.maxDailyHours || 12
    if (h > maxHours) {
      setError(`El valor excede el máximo de ${maxHours} horas permitidas.`)
      return
    }

    const calculation = calculateJourneyType(h, config)
    setResult(calculation)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculate()
    }
  }

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
    gray: 'bg-gray-50 border-gray-200 text-gray-900'
  }

  return (
    <div className="space-y-6">
      {/* Calculator Input */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Número de horas..."
            min="0"
            step="0.5"
            className="text-lg"
          />
        </div>
        <Button onClick={handleCalculate} size="lg" className="sm:w-auto">
          <Calculator className="h-4 w-4 mr-2" />
          Calcular
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-900">Error en el cálculo</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Card */}
      {result && (
        <Card className={`border-2 ${colorClasses[result.color as keyof typeof colorClasses]}`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {hours} hora{Number(hours) !== 1 ? 's' : ''} corresponde a:
                </p>
                <p className="text-3xl font-bold mb-2">{result.type}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-medium">
                    Valor equivalente: <span className="text-lg font-bold">{result.value}</span>
                  </span>
                  {result.value === 1 ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Tiempo completo
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Tiempo parcial</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      {config && !result && !error && (
        <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          <p className="font-medium mb-2"> Rangos configurados:</p>
          <ul className="space-y-1 ml-4">
            <li>
              • ¼ Tiempo: {config.quarterTimeMinHours} - {config.quarterTimeMaxHours} horas
            </li>
            <li>
              • ½ Tiempo: {config.halfTimeMinHours} - {config.halfTimeMaxHours} horas
            </li>
            {config.threeQuarterMinHours && (
              <li>
                • ¾ Tiempo: {config.threeQuarterMinHours} - {config.threeQuarterMaxHours} horas
              </li>
            )}
            <li>• Tiempo Completo: Desde {config.fullTimeMinHours} horas</li>
            <li className="text-gray-500 mt-2">Máximo permitido: {config.maxDailyHours || 12} horas</li>
          </ul>
        </div>
      )}
    </div>
  )
}

export { calculateJourneyType }
