'use client'

import { useEffect, useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@una-gc/ui/components'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@una-gc/ui/components/dialog'
import { Input } from '@una-gc/ui/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { AlertTriangle, ArrowLeft, ArrowRight, Banknote, BookOpen, Building2, Clock, Plus, Scale, Users } from 'lucide-react'
import { toast } from 'sonner'

import { Breadcrumbs } from '../components/Breadcrumbs'
import CampusAllocationForm from '../components/CampusAllocationForm'
import ProfessorAssignments, { type ProfessorAssignmentRow } from '../components/ProfessorAssignments'
import RepitenciasManager from '../components/RepitenciasManager'
import { StatsGrid } from '../components/StatsCard'

import { useAnnualAllocationsStore } from '../store/useAnnualAllocationsStore'
import { useCampusAllocationsStore } from '../store/useCampusAllocationsStore'
import { useCohortsStore } from '../store/useCohortsStore'
import { useProfessorAssignmentsStore } from '../store/useProfessorAssignmentsStore'
import { useListCareersFlat } from '../../academic-management/academic-maintenance/hooks/useCareer'

export default function TimesAdminPage() {
  const assignmentTypeLabels: Record<string, string> = {
    FULL: 'Tiempo completo',
    HALF: 'Medio tiempo',
    QUARTER: 'Cuarto de tiempo',
    THREE_QUARTER: 'Tres cuartos de tiempo'
  }

  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false)
  const [selectedCampus, setSelectedCampus] = useState<string | null>(null)
  const [selectedCareer, setSelectedCareer] = useState<{ campus: string; career: string } | null>(null)

  const [cohortDialogOpen, setCohortDialogOpen] = useState(false)
  const [cohortForm, setCohortForm] = useState({ careerId: '', year: '2026', group: 'A', initialStudents: '' })

  const {
    activeAllocation,
    yearSummary,
    fetchActive: fetchActiveAnnualAllocation,
    fetchYearSummary
  } = useAnnualAllocationsStore()
  const { cohorts, alerts, loading: loadingCohorts, fetchAll: fetchCohorts, create: createCohort } = useCohortsStore()
  const { data: careers = [] } = useListCareersFlat()
  const { allocations, loading: loadingAllocations, fetchAll: fetchAllocations } = useCampusAllocationsStore()
  const {
    assignments,
    loading: loadingProfessors,
    fetchAll: fetchAssignments,
    create: createAssignment
  } = useProfessorAssignmentsStore()

  useEffect(() => {
    fetchAllocations()
    fetchAssignments()
    fetchActiveAnnualAllocation()
    fetchCohorts()
  }, [fetchAllocations, fetchAssignments, fetchActiveAnnualAllocation, fetchCohorts])

  useEffect(() => {
    if (activeAllocation?.year) {
      fetchYearSummary(activeAllocation.year)
    }
  }, [activeAllocation?.year, fetchYearSummary])

  const transformedAllocations = allocations.map((allocation) => ({
    id: allocation.id,
    campus: allocation.campusName || 'Sin nombre',
    cycle: allocation.cycleName || 'Sin ciclo',
    career: allocation.careerName || allocation.description || 'Sin referencia',
    totalHours: allocation.totalAllocatedTime,
    status:
      allocation.status === 'ACTIVE'
        ? 'Activo'
        : allocation.status === 'APPROVED'
          ? 'Aprobado'
          : allocation.status === 'CLOSED'
            ? 'Cerrado'
            : 'Borrador'
  }))

  const campusSummary = useMemo(() => {
    const grouped = new Map<string, { campus: string; total: number; careers: Set<string>; cycles: Set<string> }>()

    transformedAllocations.forEach((item) => {
      const key = item.campus
      const existing = grouped.get(key) || {
        campus: item.campus,
        total: 0,
        careers: new Set<string>(),
        cycles: new Set<string>()
      }

      existing.total += item.totalHours
      existing.careers.add(item.career)
      existing.cycles.add(item.cycle)
      grouped.set(key, existing)
    })

    return Array.from(grouped.values()).sort((a, b) => b.total - a.total)
  }, [transformedAllocations])

  const selectedCampusCareers = useMemo(() => {
    if (!selectedCampus) return { cycleNames: [], rows: [] as Array<{ career: string; byCycle: Record<string, number>; total: number }> }

    const campusRows = transformedAllocations.filter((item) => item.campus === selectedCampus)
    const cycleNames = Array.from(new Set(campusRows.map((item) => item.cycle).filter(Boolean)))
    const grouped = new Map<string, { career: string; byCycle: Record<string, number>; total: number }>()

    campusRows.forEach((item) => {
      const existing = grouped.get(item.career) || {
        career: item.career,
        byCycle: {},
        total: 0
      }

      existing.byCycle[item.cycle] = (existing.byCycle[item.cycle] || 0) + item.totalHours
      existing.total += item.totalHours
      grouped.set(item.career, existing)
    })

    return {
      cycleNames,
      rows: Array.from(grouped.values()).sort((a, b) => b.total - a.total)
    }
  }, [selectedCampus, transformedAllocations])

  const displayCampusCareers = useMemo(() => {
    const cycleNames =
      selectedCampusCareers.cycleNames.length > 0 ? selectedCampusCareers.cycleNames : ['Ciclo I', 'Ciclo II']

    if (selectedCampusCareers.rows.length >= 4) {
      return { cycleNames, rows: selectedCampusCareers.rows }
    }

    const templateCareers = [
      { career: 'Ingenieria en Sistemas', values: [3.0, 2.5] },
      { career: 'Turismo Sostenible', values: [2.5, 2.0] },
      { career: 'Administracion', values: [1.75, 1.75] },
      { career: 'Contaduria', values: [1.25, 1.5] }
    ]

    const usedNames = new Set(selectedCampusCareers.rows.map((row) => row.career))
    const mockRows = templateCareers
      .filter((row) => !usedNames.has(row.career))
      .map((row) => {
        const byCycle = cycleNames.reduce<Record<string, number>>((acc, cycle, index) => {
          acc[cycle] = row.values[index] ?? row.values[row.values.length - 1] ?? 0
          return acc
        }, {})

        return {
          career: row.career,
          byCycle,
          total: Object.values(byCycle).reduce((sum, value) => sum + value, 0),
          isMock: true
        }
      })

    const realRows = selectedCampusCareers.rows.map((row) => ({ ...row, isMock: false }))

    return {
      cycleNames,
      rows: [...realRows, ...mockRows].slice(0, 4)
    }
  }, [selectedCampusCareers])

  const selectedCareerCohorts = useMemo(() => {
    if (!selectedCareer) return [] as Array<{ cohort: string; cycle: string; journey: number }>

    const careerRow = selectedCampusCareers.rows.find((row) => row.career === selectedCareer.career)
    const total = careerRow?.total || 0
    const cycleLabels = selectedCampusCareers.cycleNames.length > 0 ? selectedCampusCareers.cycleNames : ['Ciclo I', 'Ciclo II']
    const baseDistribution = [0.35, 0.3, 0.2, 0.15]
    const raw = baseDistribution.map((ratio) => Number((total * ratio).toFixed(2)))
    const diff = Number((total - raw.reduce((sum, value) => sum + value, 0)).toFixed(2))
    raw[0] = Number(((raw[0] ?? 0) + diff).toFixed(2))

    return [
      { cohort: 'Generacion 2022', cycle: cycleLabels[0] || 'Ciclo I', journey: raw[0] },
      { cohort: 'Generacion 2023', cycle: cycleLabels[1] || cycleLabels[0] || 'Ciclo II', journey: raw[1] },
      { cohort: 'Generacion 2024', cycle: cycleLabels[0] || 'Ciclo I', journey: raw[2] },
      { cohort: 'Repitencia', cycle: '-', journey: raw[3] }
    ]
  }, [selectedCareer, selectedCampusCareers])

  const displayCareerCohorts = useMemo(() => {
    if (!selectedCareer) return [] as Array<{ cohort: string; cycle: string; journey: number; isMock?: boolean }>

    if (selectedCareerCohorts.length >= 5) {
      return selectedCareerCohorts.map((row) => ({ ...row, isMock: false }))
    }

    const cycleLabels = displayCampusCareers.cycleNames.length > 0 ? displayCampusCareers.cycleNames : ['Ciclo I', 'Ciclo II']
    const mockRows = [
      { cohort: 'Generacion 2021', cycle: cycleLabels[1] || cycleLabels[0] || 'Ciclo II', journey: 0.75, isMock: true },
      { cohort: 'Generacion 2022', cycle: cycleLabels[0] || 'Ciclo I', journey: 1.25, isMock: true },
      { cohort: 'Generacion 2023', cycle: cycleLabels[1] || cycleLabels[0] || 'Ciclo II', journey: 1.25, isMock: true },
      { cohort: 'Generacion 2024', cycle: cycleLabels[0] || 'Ciclo I', journey: 0.5, isMock: true },
      { cohort: 'Repitencia', cycle: '-', journey: 0.25, isMock: true }
    ]

    const realRows = selectedCareerCohorts.map((row) => ({ ...row, isMock: false }))
    const usedNames = new Set(realRows.map((row) => row.cohort))
    const merged = [...realRows, ...mockRows.filter((row) => !usedNames.has(row.cohort))]

    return merged.slice(0, 5)
  }, [displayCampusCareers.cycleNames, selectedCareer, selectedCareerCohorts])

  const totalAssignedJourney = useMemo(
    () => transformedAllocations.reduce((sum, item) => sum + item.totalHours, 0),
    [transformedAllocations]
  )

  const availableJourneyTime = yearSummary?.totalJourneyTime ?? activeAllocation?.totalJourneyTime ?? 0
  const externalJourneyTime = yearSummary?.totalFromExternalProviders ?? 0
  const remainingJourneyTime = availableJourneyTime + externalJourneyTime - totalAssignedJourney
  const selectedCampusTotal = useMemo(
    () => displayCampusCareers.rows.reduce((sum, row) => sum + row.total, 0),
    [displayCampusCareers.rows]
  )
  const selectedCareerTotal = useMemo(
    () => displayCareerCohorts.reduce((sum, row) => sum + (row.journey ?? 0), 0),
    [displayCareerCohorts]
  )

  const transformedAssignments: ProfessorAssignmentRow[] = assignments.map((assignment) => ({
    id: assignment.id || '',
    professorName: assignment.professorName || 'Sin nombre',
    professorId: assignment.professorIdentification || assignment.professorId,
    career: assignment.careerName || 'Sin carrera',
    campus: assignment.campusName || 'Sin campus',
    assignedHours: assignment.calculatedJourneyTime ?? 0,
    assignmentType: assignmentTypeLabels[assignment.assignmentType || ''] || assignment.assignmentType || 'No definido',
    status: assignment.status === 'ACTIVE' ? 'active' : assignment.status === 'PENDING' ? 'pending' : 'inactive'
  }))


  const handleAssignProfessor = async (assignment: Record<string, any>) => {
    try {
      if (!assignment.professorId || !assignment.academicCycleId || !assignment.campusId || !assignment.assignmentType) {
        toast.error('Faltan datos requeridos en el formulario')
        return
      }

      const matchedAllocation =
        allocations.find(
          (allocation) =>
            allocation.campusId === assignment.campusId && allocation.academicCycleId === assignment.academicCycleId
        ) || allocations.find((allocation) => allocation.campusId === assignment.campusId)

      await createAssignment({
        professorId: assignment.professorId,
        academicCycleId: assignment.academicCycleId,
        campusId: assignment.campusId,
        curricularMeshCourseId: assignment.curricularMeshCourseId,
        assignmentType: assignment.assignmentType,
        campusAllocationId: matchedAllocation?.id,
        notes: assignment.notes
      })

      await Promise.all([
        fetchAssignments(),
        fetchAllocations(),
        activeAllocation?.year ? fetchYearSummary(activeAllocation.year) : Promise.resolve()
      ])
      toast.success('Asignacion registrada correctamente')
    } catch (error) {
      console.error('Error assigning professor:', error)
      toast.error('Error al registrar la asignacion')
    }
  }

  return (
    <div className="container mx-auto space-y-8 py-8">
      <Breadcrumbs items={[{ label: 'Tiempos de Jornada', href: '/times-management' }, { label: 'Administracion' }]} />

      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-3">
          <Clock className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion de Tiempos de Jornada</h1>
          <p className="text-muted-foreground">
            Vista operativa para distribuir jornadas, revisar consumo por campus y controlar el saldo anual.
          </p>
        </div>
      </div>

      <Tabs defaultValue="allocations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="allocations">Asignaciones</TabsTrigger>
          <TabsTrigger value="cohorts">Cohortes</TabsTrigger>
          <TabsTrigger value="professor">Profesores</TabsTrigger>
          <TabsTrigger value="repitencias">Repitencias</TabsTrigger>
        </TabsList>

        <TabsContent value="allocations" className="mt-6">
          <div className="space-y-4">
            <StatsGrid
              stats={[
                {
                  title: 'Jornadas disponibles',
                  value: `${availableJourneyTime.toFixed(2)}j`,
                  icon: <Clock className="h-4 w-4" />,
                  trend: 'neutral'
                },
                {
                  title: 'Jornadas asignadas',
                  value: `${totalAssignedJourney.toFixed(2)}j`,
                  icon: <Building2 className="h-4 w-4" />,
                  trend: totalAssignedJourney > 0 ? 'up' : 'neutral'
                },
                {
                  title: 'Aportes externos',
                  value: `${externalJourneyTime.toFixed(2)}j`,
                  icon: <Banknote className="h-4 w-4" />,
                  trend: externalJourneyTime > 0 ? 'up' : 'neutral'
                },
                {
                  title: 'Saldo disponible',
                  value: `${remainingJourneyTime.toFixed(2)}j`,
                  icon: <Scale className="h-4 w-4" />,
                  trend: remainingJourneyTime >= 0 ? 'up' : 'down'
                }
              ]}
            />

            <div className="flex justify-end">
              <Button onClick={() => setAllocationDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva asignacion
              </Button>
            </div>

            {loadingAllocations ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                <span className="ml-3 text-sm text-muted-foreground">Cargando resumen de campus...</span>
              </div>
            ) : campusSummary.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Todavia no hay asignaciones de campus registradas.
                </CardContent>
              </Card>
            ) : selectedCareer ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {selectedCareer.campus} / {selectedCareer.career}
                    </p>
                    <h3 className="text-2xl font-semibold tracking-tight">Detalle por cohorte</h3>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedCareer(null)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a carreras
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Carrera</p>
                      <p className="mt-2 text-lg font-semibold">{selectedCareer.career}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Cohortes</p>
                      <p className="mt-2 text-2xl font-semibold">{displayCareerCohorts.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Total carrera</p>
                      <p className="mt-2 text-2xl font-semibold">{selectedCareerTotal.toFixed(2)}j</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="overflow-x-auto rounded-xl border bg-background">
                  <table className="w-full">
                    <thead className="bg-muted/60">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Cohorte</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Ciclo</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Jornadas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayCareerCohorts.map((row) => (
                        <tr
                          key={row.cohort}
                          className={`border-t transition-colors hover:bg-muted/30 ${
                            row.cohort === 'Repitencia' ? 'bg-amber-50/60' : ''
                          }`}
                        >
                          <td className="px-4 py-4 text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <span>{row.cohort}</span>
                              {(row as any).isMock ? (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                                  Demo
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm">{row.cycle}</td>
                          <td className="px-4 py-4 text-right text-sm font-semibold tabular-nums">
                            {(row.journey ?? 0).toFixed(2)}j
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : selectedCampus ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Campus seleccionado</p>
                    <h3 className="text-2xl font-semibold tracking-tight">{selectedCampus}</h3>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCampus(null)
                      setSelectedCareer(null)
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a campus
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Campus</p>
                      <p className="mt-2 text-lg font-semibold">{selectedCampus}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Carreras</p>
                      <p className="mt-2 text-2xl font-semibold">{displayCampusCareers.rows.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Total campus</p>
                      <p className="mt-2 text-2xl font-semibold">{selectedCampusTotal.toFixed(2)}j</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="overflow-x-auto rounded-xl border bg-background">
                  <table className="w-full">
                    <thead className="bg-muted/60">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Carrera</th>
                        {displayCampusCareers.cycleNames.map((cycle) => (
                          <th key={cycle} className="px-4 py-3 text-right text-sm font-semibold">
                            {cycle}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-right text-sm font-semibold">Total anual</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Cohortes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayCampusCareers.rows.map((row) => (
                        <tr key={row.career} className="border-t transition-colors hover:bg-muted/30">
                          <td className="px-4 py-4 text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <span>{row.career}</span>
                              {(row as any).isMock ? (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                                  Demo
                                </span>
                              ) : null}
                            </div>
                          </td>
                          {displayCampusCareers.cycleNames.map((cycle) => (
                            <td key={cycle} className="px-4 py-4 text-right text-sm tabular-nums">
                              {(row.byCycle[cycle] || 0).toFixed(2)}j
                            </td>
                          ))}
                          <td className="px-4 py-4 text-right text-sm font-semibold tabular-nums">
                            {row.total.toFixed(2)}j
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCareer({ campus: selectedCampus, career: row.career })}
                            >
                              Ver cohortes
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Campus</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Carreras registradas</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Ciclos visibles</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Total del campus</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Detalle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campusSummary.map((row) => (
                        <tr key={row.campus} className="border-t">
                          <td className="px-4 py-4 text-sm font-medium">{row.campus}</td>
                          <td className="px-4 py-4 text-sm">{row.careers.size}</td>
                          <td className="px-4 py-4 text-sm">{Array.from(row.cycles).join(', ') || 'Sin ciclos'}</td>
                          <td className="px-4 py-4 text-sm font-semibold">{row.total.toFixed(2)}j</td>
                          <td className="px-4 py-4 text-right">
                            <Button variant="outline" size="sm" onClick={() => setSelectedCampus(row.campus)}>
                              Ver carreras
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Card>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total general asignado</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Suma consolidada de las jornadas ya registradas en el modulo
                      </p>
                    </div>
                    <p className="text-3xl font-bold">{totalAssignedJourney.toFixed(2)}j</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="cohorts" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Cohortes</h2>
                <p className="text-sm text-muted-foreground">
                  Generaciones de estudiantes por carrera y año. Permite proyectar rezagados y alertas de apertura.
                </p>
              </div>
              <Button onClick={() => setCohortDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo cohorte
              </Button>
            </div>

            {/* Alertas: cursos con 20+ rezagados */}
            {alerts.length > 0 && (
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  Cursos con 20 o más rezagados proyectados
                </h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {alerts.map((alert) => (
                    <Card key={alert.courseId} className="border-amber-200 bg-amber-50/60">
                      <CardContent className="p-4">
                        <p className="text-xs font-mono text-muted-foreground">{alert.courseCode}</p>
                        <p className="mt-1 font-semibold">{alert.courseName || alert.courseId}</p>
                        <p className="mt-1 text-sm text-amber-800">
                          {alert.rezagadosProyectados} rezagados proyectados
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Considere abrir un grupo de repitencia
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de cohortes */}
            {loadingCohorts ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                <span className="ml-3 text-sm text-muted-foreground">Cargando cohortes...</span>
              </div>
            ) : cohorts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                  <p className="text-muted-foreground">No hay cohortes registrados.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Crea el primero con el botón "Nuevo cohorte".
                  </p>
                </CardContent>
              </Card>
            ) : (
              (() => {
                // Agrupar por careerId + año
                const grouped = new Map<string, typeof cohorts>()
                cohorts.forEach((c) => {
                  const key = `${c.careerId}-${c.year}`
                  const existing = grouped.get(key) || []
                  existing.push(c)
                  grouped.set(key, existing)
                })

                return (
                  <div className="space-y-4">
                    {Array.from(grouped.entries()).map(([key, rows]) => {
                      if (!rows[0]) return null
                      const first = rows[0]
                      return (
                        <Card key={key}>
                          <CardContent className="p-4">
                            <div className="mb-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-semibold text-muted-foreground">
                                  Carrera ID: {first.careerId}
                                </span>
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                  {first.year}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">{rows.length} grupo(s)</span>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              {rows.map((cohort) => (
                                <div
                                  key={cohort.id}
                                  className="rounded-lg border bg-muted/30 p-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Grupo {cohort.group}</span>
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                                        cohort.status === 'ACTIVE'
                                          ? 'bg-green-100 text-green-700'
                                          : 'bg-muted text-muted-foreground'
                                      }`}
                                    >
                                      {cohort.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-2xl font-bold">{cohort.initialStudents}</p>
                                  <p className="text-xs text-muted-foreground">estudiantes iniciales</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )
              })()
            )}
          </div>
        </TabsContent>

        <TabsContent value="professor" className="mt-6">
          <ProfessorAssignments
            assignments={transformedAssignments}
            loading={loadingProfessors}
            onAssign={handleAssignProfessor}
          />
        </TabsContent>

        <TabsContent value="repitencias" className="mt-6">
          <RepitenciasManager campusAllocationId={allocations[0]?.id} />
        </TabsContent>
      </Tabs>

      {/* Dialog nuevo cohorte */}
      <Dialog open={cohortDialogOpen} onOpenChange={setCohortDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo cohorte</DialogTitle>
            <DialogDescription>
              Registra una generación de estudiantes por carrera, año y grupo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Carrera</label>
              <Select
                value={cohortForm.careerId}
                onValueChange={(v) => setCohortForm((prev) => ({ ...prev, careerId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una carrera..." />
                </SelectTrigger>
                <SelectContent>
                  {careers.map((career) => (
                    <SelectItem key={career.id} value={career.id}>
                      {career.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Año</label>
                <Input
                  type="number"
                  placeholder="2024"
                  value={cohortForm.year}
                  onChange={(e) => setCohortForm((prev) => ({ ...prev, year: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Grupo</label>
                <Select
                  value={cohortForm.group}
                  onValueChange={(v) => setCohortForm((prev) => ({ ...prev, group: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Estudiantes iniciales</label>
              <Input
                type="number"
                placeholder="40"
                value={cohortForm.initialStudents}
                onChange={(e) => setCohortForm((prev) => ({ ...prev, initialStudents: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCohortDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  if (!cohortForm.careerId || !cohortForm.year || !cohortForm.initialStudents) {
                    toast.error('Completa todos los campos requeridos')
                    return
                  }
                  try {
                    await createCohort({
                      careerId: cohortForm.careerId,
                      year: Number(cohortForm.year),
                      group: cohortForm.group,
                      initialStudents: Number(cohortForm.initialStudents)
                    })
                    toast.success('Cohorte creado correctamente')
                    setCohortDialogOpen(false)
                    setCohortForm({ careerId: '', year: String(new Date().getFullYear()), group: 'A', initialStudents: '' })
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : 'Error al crear cohorte')
                  }
                }}
              >
                Crear cohorte
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={allocationDialogOpen} onOpenChange={setAllocationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva asignacion de campus</DialogTitle>
            <DialogDescription>Define cuantas jornadas necesita cada carrera por campus y ciclo.</DialogDescription>
          </DialogHeader>

          <CampusAllocationForm
            onCancel={() => setAllocationDialogOpen(false)}
            onSuccess={async () => {
              await fetchAllocations()
              setAllocationDialogOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
