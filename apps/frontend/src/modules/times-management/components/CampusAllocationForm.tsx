'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@una-gc/ui/components/alert'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Input } from '@una-gc/ui/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'

import { useAcademicCycle } from '@/shared/hooks/useAcademicCycle'
import { useCampus } from '@/shared/hooks/useCampus'
import { useListCareersFlat } from '@/modules/academic-management/academic-maintenance/hooks/useCareer'

import { useAnnualAllocationsStore } from '../store/useAnnualAllocationsStore'
import { useCampusAllocationsStore } from '../store/useCampusAllocationsStore'

interface CampusAllocationFormProps {
  onSuccess: () => Promise<void> | void
  onCancel: () => void
}

export default function CampusAllocationForm({ onSuccess, onCancel }: CampusAllocationFormProps) {
  const { data: campuses = [], isLoading: loadingCampuses } = useCampus()
  const { data: cycles = [], isLoading: loadingCycles } = useAcademicCycle()
  const { data: careers = [], isLoading: loadingCareers } = useListCareersFlat()

  const {
    activeAllocation,
    loading: loadingAnnualAllocation,
    fetchActive: fetchActiveAllocation
  } = useAnnualAllocationsStore()
  const { create, loading, error, clearError } = useCampusAllocationsStore()

  const [campusId, setCampusId] = useState('')
  const [cycleId, setCycleId] = useState('')
  const [careerId, setCareerId] = useState('')
  const [cohortYear, setCohortYear] = useState('')
  const [allocatedJourneyTime, setAllocatedJourneyTime] = useState('')
  const [additionalTime, setAdditionalTime] = useState('0')

  const cohortYearOptions = useMemo(() => {
    const baseYear = activeAllocation?.year || new Date().getFullYear()

    return [
      { value: String(baseYear), label: String(baseYear), description: 'Nuevo ingreso' },
      { value: String(baseYear - 1), label: String(baseYear - 1), description: 'Cohorte en avance' },
      { value: String(baseYear - 2), label: String(baseYear - 2), description: 'Cohorte con arrastre' },
      { value: String(baseYear - 3), label: String(baseYear - 3), description: 'Cohorte rezagado' }
    ]
  }, [activeAllocation?.year])

  useEffect(() => {
    if (!activeAllocation?.id) {
      fetchActiveAllocation()
    }
  }, [activeAllocation?.id, fetchActiveAllocation])

  useEffect(() => {
    clearError()
  }, [clearError])

  useEffect(() => {
    const firstOption = cohortYearOptions[0]
    if (!cohortYear && firstOption) {
      setCohortYear(firstOption.value)
    }
  }, [cohortYear, cohortYearOptions])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!activeAllocation?.id) {
      alert('No hay una asignacion anual activa para registrar asignaciones de campus.')
      return
    }

    if (!campusId || !cycleId || !careerId || !allocatedJourneyTime) {
      alert('Completa todos los campos requeridos.')
      return
    }

    const selectedCareer = careers.find((career) => career.id === careerId)

    const allocated = Number(allocatedJourneyTime)
    const additional = Number(additionalTime || '0')

    if (!Number.isFinite(allocated) || allocated <= 0) {
      alert('Las jornadas asignadas deben ser mayores a 0.')
      return
    }

    if (!Number.isFinite(additional) || additional < 0) {
      alert('Las jornadas adicionales no pueden ser negativas.')
      return
    }

    try {
      await create({
        annualAllocationId: activeAllocation.id,
        cycleId,
        campusId,
        allocatedJourneyTime: allocated,
        additionalTime: additional,
        status: 'DRAFT',
        description: selectedCareer ? `${selectedCareer.code ?? ''} - ${selectedCareer.name ?? ''}`.trim() : undefined
      })

      await onSuccess()
    } catch (submitError) {
      console.error('Error creating campus allocation:', submitError)
    }
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Nueva asignacion de campus</CardTitle>
        <CardDescription>Registra las jornadas requeridas por campus y ciclo academico.</CardDescription>
      </CardHeader>

      <CardContent className="px-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!activeAllocation?.id && !loadingAnnualAllocation && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Necesitas una asignacion anual activa para crear asignaciones de campus.</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Campus <span className="text-red-500">*</span>
            </label>
            <Select value={campusId} onValueChange={setCampusId} disabled={loadingCampuses || loading}>
              <SelectTrigger>
                <SelectValue placeholder={loadingCampuses ? 'Cargando campus...' : 'Selecciona un campus'} />
              </SelectTrigger>
              <SelectContent>
                {campuses.map((campus) => (
                  <SelectItem key={campus.id} value={campus.id}>
                    {campus.code} - {campus.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Carrera <span className="text-red-500">*</span>
            </label>
            <Select value={careerId} onValueChange={setCareerId} disabled={loadingCareers || loading}>
              <SelectTrigger>
                <SelectValue placeholder={loadingCareers ? 'Cargando carreras...' : 'Selecciona una carrera'} />
              </SelectTrigger>
              <SelectContent>
                {careers.map((career) => (
                  <SelectItem key={career.id} value={career.id}>
                    {career.code ? `${career.code} - ` : ''}{career.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Ciclo academico <span className="text-red-500">*</span>
            </label>
            <Select value={cycleId} onValueChange={setCycleId} disabled={loadingCycles || loading}>
              <SelectTrigger>
                <SelectValue placeholder={loadingCycles ? 'Cargando ciclos...' : 'Selecciona un ciclo academico'} />
              </SelectTrigger>
              <SelectContent>
                {cycles.map((cycle) => (
                  <SelectItem key={cycle.id} value={cycle.id}>
                    {cycle.code} - {cycle.name} ({cycle.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ano de ingreso del cohorte</label>
            <Select value={cohortYear} onValueChange={setCohortYear} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un ano" />
              </SelectTrigger>
              <SelectContent>
                {cohortYearOptions.map((cohort) => (
                  <SelectItem key={cohort.value} value={cohort.value}>
                    {cohort.label} - {cohort.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Selecciona el ano de ingreso y el sistema interpreta ese dato como el cohorte de trabajo para la demo.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Jornadas asignadas <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="0.25"
                step="0.25"
                value={allocatedJourneyTime}
                onChange={(event) => setAllocatedJourneyTime(event.target.value)}
                placeholder="1.25"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Jornadas adicionales</label>
              <Input
                type="number"
                min="0"
                step="0.25"
                value={additionalTime}
                onChange={(event) => setAdditionalTime(event.target.value)}
                placeholder="0"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || loadingAnnualAllocation || !activeAllocation?.id}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
