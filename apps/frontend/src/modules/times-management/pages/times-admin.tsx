'use client'

import { useEffect, useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@una-gc/ui/components'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@una-gc/ui/components/dialog'
import { Input } from '@una-gc/ui/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { ArrowLeft, ArrowRight, Banknote, BookOpen, Building2, Clock, Layers3, Plus, Scale, TrendingUp, Users } from 'lucide-react'
import { toast } from 'sonner'

import { Breadcrumbs } from '../components/Breadcrumbs'
import CampusAllocationForm from '../components/CampusAllocationForm'
import JourneyConfigDisplay, { type JourneyConfig } from '../components/JourneyConfigDisplay'
import ProfessorAssignments, { type ProfessorAssignmentRow } from '../components/ProfessorAssignments'
import RepitenciasManager from '../components/RepitenciasManager'
import { StatsGrid } from '../components/StatsCard'

import { useAnnualAllocationsStore } from '../store/useAnnualAllocationsStore'
import { useCampusAllocationsStore } from '../store/useCampusAllocationsStore'
import { useJourneyTimeConfigStore } from '../store/useJourneyTimeConfigStore'
import { useProfessorAssignmentsStore } from '../store/useProfessorAssignmentsStore'

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
  const [selectedDemandCourse, setSelectedDemandCourse] = useState<string | null>(null)
  const [selectedDemandCareer, setSelectedDemandCareer] = useState('Ingenieria en Sistemas')
  const [selectedDemandCycle, setSelectedDemandCycle] = useState('Ciclo I')
  const [selectedDemandYear, setSelectedDemandYear] = useState('2027')
  const [appliedDemandCareer, setAppliedDemandCareer] = useState('Ingenieria en Sistemas')
  const [appliedDemandCycle, setAppliedDemandCycle] = useState('Ciclo I')
  const [appliedDemandYear, setAppliedDemandYear] = useState('2027')
  const [manualDemandEntries, setManualDemandEntries] = useState<
    Array<{ id: string; courseId: string; courseLabel: string; cohort: string; type: string; students: number }>
  >([])
  const [manualDemandForm, setManualDemandForm] = useState({
    courseId: '',
    cohortYear: '',
    type: 'Rezagados del ano anterior',
    students: ''
  })

  const {
    activeAllocation,
    yearSummary,
    fetchActive: fetchActiveAnnualAllocation,
    fetchYearSummary
  } = useAnnualAllocationsStore()
  const { activeConfig, loading: loadingConfig, fetchActive, create: createConfig } = useJourneyTimeConfigStore()
  const { allocations, loading: loadingAllocations, fetchAll: fetchAllocations } = useCampusAllocationsStore()
  const {
    assignments,
    loading: loadingProfessors,
    fetchAll: fetchAssignments,
    create: createAssignment
  } = useProfessorAssignmentsStore()

  useEffect(() => {
    fetchActive()
    fetchAllocations()
    fetchAssignments()
    fetchActiveAnnualAllocation()
  }, [fetchActive, fetchAllocations, fetchAssignments, fetchActiveAnnualAllocation])

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
    raw[0] = Number((raw[0] + diff).toFixed(2))

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
    () => displayCareerCohorts.reduce((sum, row) => sum + row.journey, 0),
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

  const projectedDemandRows = useMemo(
    () => [
      {
        id: 'ing-1-2027',
        year: '2027',
        cycle: 'Ciclo I',
        course: 'Ingenieria I',
        code: 'ING-101',
        career: 'Ingenieria en Sistemas',
        campus: 'Sede Regional Brunca: PZ',
        suggestedGroups: 2,
        suggestedProfessors: 2,
        projectedJourney: 1.0,
        cohortContributions: [
          { cohort: 'Generacion 2027', type: 'Nuevo ingreso', students: 40 },
          { cohort: 'Generacion 2026', type: 'Rezagados del ano anterior', students: 20 },
          { cohort: 'Generacion 2025', type: 'Rezagados acumulados', students: 3 }
        ]
      },
      {
        id: 'ing-2-2027',
        year: '2027',
        cycle: 'Ciclo II',
        course: 'Ingenieria II',
        code: 'ING-102',
        career: 'Ingenieria en Sistemas',
        campus: 'Sede Regional Brunca: PZ',
        suggestedGroups: 2,
        suggestedProfessors: 2,
        projectedJourney: 1.0,
        cohortContributions: [
          { cohort: 'Generacion 2026', type: 'Aprobados que avanzan', students: 50 },
          { cohort: 'Generacion 2025', type: 'Rezagados de Ingenieria II', students: 3 }
        ]
      },
      {
        id: 'prog-1-2027',
        year: '2027',
        cycle: 'Ciclo II',
        course: 'Programacion I',
        code: 'ISI-201',
        career: 'Ingenieria en Sistemas',
        campus: 'Sede Regional Brunca: PZ',
        suggestedGroups: 2,
        suggestedProfessors: 2,
        projectedJourney: 1.0,
        cohortContributions: [
          { cohort: 'Generacion 2027', type: 'Cohorte base del ciclo', students: 35 },
          { cohort: 'Generacion 2026', type: 'Rezagados del ano anterior', students: 11 }
        ]
      },
      {
        id: 'conta-1-2027',
        year: '2027',
        cycle: 'Ciclo I',
        course: 'Contabilidad I',
        code: 'ADM-110',
        career: 'Administracion',
        campus: 'Sede Regional Brunca: Coto',
        suggestedGroups: 2,
        suggestedProfessors: 2,
        projectedJourney: 1.0,
        cohortContributions: [
          { cohort: 'Generacion 2027', type: 'Nuevo ingreso', students: 32 },
          { cohort: 'Generacion 2026', type: 'Rezagados del ano anterior', students: 14 }
        ]
      },
      {
        id: 'tur-1-2027',
        year: '2027',
        cycle: 'Ciclo II',
        course: 'Introduccion al Turismo',
        code: 'TUR-101',
        career: 'Turismo Sostenible',
        campus: 'Campus Omar Dengo',
        suggestedGroups: 1,
        suggestedProfessors: 1,
        projectedJourney: 0.5,
        cohortContributions: [
          { cohort: 'Generacion 2027', type: 'Nuevo ingreso', students: 28 },
          { cohort: 'Generacion 2026', type: 'Rezagados del ano anterior', students: 9 }
        ]
      },
      {
        id: 'bd-1-2027',
        year: '2027',
        cycle: 'Ciclo II',
        course: 'Bases de Datos',
        code: 'ISI-310',
        career: 'Ingenieria en Sistemas',
        campus: 'Sede Regional Brunca: PZ',
        suggestedGroups: 1,
        suggestedProfessors: 1,
        projectedJourney: 0.5,
        cohortContributions: [
          { cohort: 'Generacion 2026', type: 'Avance natural', students: 26 },
          { cohort: 'Generacion 2025', type: 'Rezagados del ano anterior', students: 11 }
        ]
      },
      {
        id: 'conta-2-2028',
        year: '2028',
        cycle: 'Ciclo II',
        course: 'Contabilidad II',
        code: 'ADM-120',
        career: 'Administracion',
        campus: 'Sede Regional Brunca: Coto',
        suggestedGroups: 2,
        suggestedProfessors: 2,
        projectedJourney: 1.0,
        cohortContributions: [
          { cohort: 'Generacion 2027', type: 'Aprobados que avanzan', students: 34 },
          { cohort: 'Generacion 2026', type: 'Rezagados acumulados', students: 6 }
        ]
      }
    ].map((row) => {
      const projectedStudents = row.cohortContributions.reduce((sum, item) => sum + item.students, 0)
      const newCohortStudents = row.cohortContributions
        .filter((item) => item.type === 'Nuevo ingreso' || item.type === 'Cohorte base del ciclo')
        .reduce((sum, item) => sum + item.students, 0)
      const retainedStudents = projectedStudents - newCohortStudents

      return {
        ...row,
        projectedStudents,
        newCohortStudents,
        retainedStudents
      }
    }),
    []
  )

  const demandCareerOptions = useMemo(
    () => Array.from(new Set(projectedDemandRows.map((row) => row.career))),
    [projectedDemandRows]
  )
  const demandCycleOptions = useMemo(
    () => Array.from(new Set(projectedDemandRows.map((row) => row.cycle))),
    [projectedDemandRows]
  )
  const demandYearOptions = useMemo(
    () => Array.from(new Set(projectedDemandRows.map((row) => row.year))).sort(),
    [projectedDemandRows]
  )
  const manualCohortYearOptions = useMemo(() => {
    const baseYear = Number(appliedDemandYear || new Date().getFullYear())
    return [baseYear, baseYear - 1, baseYear - 2, baseYear - 3].map((year) => String(year))
  }, [appliedDemandYear])

  const filteredDemandRows = useMemo(
    () =>
      projectedDemandRows.filter(
        (row) =>
          row.career === appliedDemandCareer &&
          row.cycle === appliedDemandCycle &&
          row.year === appliedDemandYear
      ),
    [projectedDemandRows, appliedDemandCareer, appliedDemandCycle, appliedDemandYear]
  )

  const demandSummary = useMemo(() => {
    const totalProjectedStudents = filteredDemandRows.reduce((sum, row) => sum + row.projectedStudents, 0)
    const totalSuggestedGroups = filteredDemandRows.reduce((sum, row) => sum + row.suggestedGroups, 0)
    const totalProjectedJourney = filteredDemandRows.reduce((sum, row) => sum + row.projectedJourney, 0)
    const pressuredCourses = filteredDemandRows.filter((row) => row.retainedStudents >= 10).length

    return {
      totalProjectedStudents,
      totalSuggestedGroups,
      totalProjectedJourney,
      pressuredCourses
    }
  }, [filteredDemandRows])

  const selectedProjectedCourse = useMemo(
    () => filteredDemandRows.find((row) => row.id === selectedDemandCourse) || null,
    [filteredDemandRows, selectedDemandCourse]
  )

  useEffect(() => {
    if (selectedDemandCourse && !filteredDemandRows.some((row) => row.id === selectedDemandCourse)) {
      setSelectedDemandCourse(null)
    }
  }, [filteredDemandRows, selectedDemandCourse])

  useEffect(() => {
    if (filteredDemandRows.length === 0) {
      setManualDemandForm((prev) => ({ ...prev, courseId: '', cohortYear: '' }))
      return
    }

    if (!filteredDemandRows.some((row) => row.id === manualDemandForm.courseId)) {
      setManualDemandForm((prev) => ({ ...prev, courseId: filteredDemandRows[0]?.id || '' }))
    }
  }, [filteredDemandRows, manualDemandForm.courseId])

  useEffect(() => {
    if (!manualDemandForm.cohortYear && manualCohortYearOptions.length > 0) {
      setManualDemandForm((prev) => ({ ...prev, cohortYear: manualCohortYearOptions[0] }))
    }
  }, [manualDemandForm.cohortYear, manualCohortYearOptions])

  const handleApplyDemandFilters = () => {
    setAppliedDemandCareer(selectedDemandCareer)
    setAppliedDemandCycle(selectedDemandCycle)
    setAppliedDemandYear(selectedDemandYear)
    setSelectedDemandCourse(null)
  }

  const handleAddManualDemandEntry = () => {
    if (!manualDemandForm.courseId || !manualDemandForm.cohortYear || !manualDemandForm.students) {
      toast.error('Completa curso, ano de cohorte y cantidad de estudiantes.')
      return
    }

    const students = Number(manualDemandForm.students)
    if (!Number.isFinite(students) || students <= 0) {
      toast.error('La cantidad de estudiantes debe ser mayor a 0.')
      return
    }

    const selectedCourse = filteredDemandRows.find((row) => row.id === manualDemandForm.courseId)
    if (!selectedCourse) {
      toast.error('Selecciona un curso valido del escenario cargado.')
      return
    }

    setManualDemandEntries((prev) => [
      {
        id: `${manualDemandForm.courseId}-${manualDemandForm.cohortYear}-${Date.now()}`,
        courseId: manualDemandForm.courseId,
        courseLabel: `${selectedCourse.code} - ${selectedCourse.course}`,
        cohort: `Generacion ${manualDemandForm.cohortYear}`,
        type: manualDemandForm.type,
        students
      },
      ...prev
    ])

    setManualDemandForm((prev) => ({
      ...prev,
      cohortYear: manualCohortYearOptions[0] || '',
      type: 'Rezagados del ano anterior',
      students: ''
    }))
    toast.success('Registro manual agregado para la reunion.')
  }

  const transformedConfig: JourneyConfig | null = activeConfig
    ? {
        ...activeConfig,
        status: activeConfig.status as 'ACTIVE' | 'INACTIVE' | 'DRAFT' | undefined
      }
    : null

  const handleUploadConfig = async (newConfig: JourneyConfig) => {
    try {
      const effectiveYear =
        typeof newConfig.effectiveYear === 'string' ? parseInt(newConfig.effectiveYear, 10) : newConfig.effectiveYear

      await createConfig({
        quarterTimeMinHours: newConfig.quarterTimeMinHours,
        quarterTimeMaxHours: newConfig.quarterTimeMaxHours,
        quarterTimeValue: newConfig.quarterTimeValue,
        halfTimeMinHours: newConfig.halfTimeMinHours,
        halfTimeMaxHours: newConfig.halfTimeMaxHours,
        halfTimeValue: newConfig.halfTimeValue,
        threeQuarterMinHours: newConfig.threeQuarterMinHours,
        threeQuarterMaxHours: newConfig.threeQuarterMaxHours,
        threeQuarterTimeValue: newConfig.threeQuarterTimeValue,
        fullTimeMinHours: newConfig.fullTimeMinHours,
        fullTimeValue: newConfig.fullTimeValue,
        maxDailyHours: newConfig.maxDailyHours,
        effectiveYear,
        status: 'ACTIVE'
      })
      toast.success('Configuracion cargada correctamente')
    } catch (error) {
      console.error('Error uploading config:', error)
      toast.error('Error al cargar la configuracion')
    }
  }

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

      await fetchAssignments()
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="allocations">Asignaciones</TabsTrigger>
          <TabsTrigger value="demand">Demanda</TabsTrigger>
          <TabsTrigger value="config">Configuracion</TabsTrigger>
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
                              {row.isMock ? (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                                  Demo
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm">{row.cycle}</td>
                          <td className="px-4 py-4 text-right text-sm font-semibold tabular-nums">
                            {row.journey.toFixed(2)}j
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
                              {row.isMock ? (
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

        <TabsContent value="demand" className="mt-6">
          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-5 p-5">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">Seleccion de escenario academico</h3>
                  <p className="text-sm text-muted-foreground">
                    Primero selecciona la carrera, el ciclo y el ano que quieres proyectar. Luego el sistema te muestra
                    los cursos esperados y el aporte de cada cohorte.
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr_0.8fr_auto]">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Carrera</label>
                    <Select value={selectedDemandCareer} onValueChange={setSelectedDemandCareer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una carrera" />
                      </SelectTrigger>
                      <SelectContent>
                        {demandCareerOptions.map((career) => (
                          <SelectItem key={career} value={career}>
                            {career}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ciclo</label>
                    <Select value={selectedDemandCycle} onValueChange={setSelectedDemandCycle}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un ciclo" />
                      </SelectTrigger>
                      <SelectContent>
                        {demandCycleOptions.map((cycle) => (
                          <SelectItem key={cycle} value={cycle}>
                            {cycle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ano proyectado</label>
                    <Select value={selectedDemandYear} onValueChange={setSelectedDemandYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un ano" />
                      </SelectTrigger>
                      <SelectContent>
                        {demandYearOptions.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button className="w-full lg:w-auto" onClick={handleApplyDemandFilters}>
                      Cargar cursos
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
                  <p className="text-muted-foreground">Escenario cargado</p>
                  <p className="font-semibold">
                    {appliedDemandCareer} - {appliedDemandCycle} - {appliedDemandYear}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-5 p-5">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">Registro manual de cohortes y rezagos</h3>
                  <p className="text-sm text-muted-foreground">
                    Este bloque es temporal. Permite cargar manualmente estudiantes esperados o rezagados mientras se
                    define si esos datos vendran desde otro sistema.
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_1fr_0.7fr_auto]">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Curso</label>
                    <Select
                      value={manualDemandForm.courseId}
                      onValueChange={(value) => setManualDemandForm((prev) => ({ ...prev, courseId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un curso" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredDemandRows.map((row) => (
                          <SelectItem key={row.id} value={row.id}>
                            {row.code} - {row.course}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ano de cohorte</label>
                    <Select
                      value={manualDemandForm.cohortYear}
                      onValueChange={(value) => setManualDemandForm((prev) => ({ ...prev, cohortYear: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un ano" />
                      </SelectTrigger>
                      <SelectContent>
                        {manualCohortYearOptions.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de aporte</label>
                    <Select
                      value={manualDemandForm.type}
                      onValueChange={(value) => setManualDemandForm((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nuevo ingreso">Nuevo ingreso</SelectItem>
                        <SelectItem value="Rezagados del ano anterior">Rezagados del ano anterior</SelectItem>
                        <SelectItem value="Rezagados acumulados">Rezagados acumulados</SelectItem>
                        <SelectItem value="Aprobados que avanzan">Aprobados que avanzan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estudiantes</label>
                    <Input
                      type="number"
                      min="1"
                      value={manualDemandForm.students}
                      onChange={(event) => setManualDemandForm((prev) => ({ ...prev, students: event.target.value }))}
                      placeholder="20"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button className="w-full lg:w-auto" onClick={handleAddManualDemandEntry}>
                      Agregar
                    </Button>
                  </div>
                </div>

                {manualDemandEntries.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full">
                      <thead className="bg-muted/60">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Curso</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Cohorte</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Tipo</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">Estudiantes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {manualDemandEntries.map((entry) => (
                          <tr key={entry.id} className="border-t">
                            <td className="px-4 py-4 text-sm font-medium">{entry.courseLabel}</td>
                            <td className="px-4 py-4 text-sm">{entry.cohort}</td>
                            <td className="px-4 py-4 text-sm text-muted-foreground">{entry.type}</td>
                            <td className="px-4 py-4 text-right text-sm font-semibold tabular-nums">{entry.students}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    Todavia no hay registros manuales para este escenario.
                  </div>
                )}
              </CardContent>
            </Card>

            <StatsGrid
              stats={[
                {
                  title: 'Estudiantes proyectados',
                  value: demandSummary.totalProjectedStudents,
                  icon: <Users className="h-4 w-4" />,
                  trend: 'up'
                },
                {
                  title: 'Cursos con presion',
                  value: demandSummary.pressuredCourses,
                  icon: <TrendingUp className="h-4 w-4" />,
                  trend: demandSummary.pressuredCourses > 0 ? 'up' : 'neutral'
                },
                {
                  title: 'Grupos sugeridos',
                  value: demandSummary.totalSuggestedGroups,
                  icon: <Layers3 className="h-4 w-4" />,
                  trend: 'neutral'
                },
                {
                  title: 'Impacto estimado',
                  value: `${demandSummary.totalProjectedJourney.toFixed(2)}j`,
                  icon: <BookOpen className="h-4 w-4" />,
                  trend: 'neutral'
                }
              ]}
            />

            {filteredDemandRows.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No hay cursos en el escenario de demo para la combinacion seleccionada.
                </CardContent>
              </Card>
            ) : selectedProjectedCourse ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {selectedProjectedCourse.campus} / {selectedProjectedCourse.career} / {selectedProjectedCourse.cycle}
                    </p>
                    <h3 className="text-2xl font-semibold tracking-tight">
                      {selectedProjectedCourse.code} - {selectedProjectedCourse.course}
                    </h3>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedDemandCourse(null)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al resumen
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Cohorte nuevo</p>
                      <p className="mt-2 text-2xl font-semibold">{selectedProjectedCourse.newCohortStudents}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Rezagados</p>
                      <p className="mt-2 text-2xl font-semibold">{selectedProjectedCourse.retainedStudents}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Proyeccion total</p>
                      <p className="mt-2 text-2xl font-semibold">{selectedProjectedCourse.projectedStudents}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Ano de apertura</p>
                      <p className="mt-2 text-2xl font-semibold">{selectedProjectedCourse.year}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <Card>
                    <CardContent className="p-5">
                      <p className="text-sm font-medium text-muted-foreground">Aporte por cohorte</p>
                      <div className="mt-4 overflow-x-auto rounded-lg border">
                        <table className="w-full">
                          <thead className="bg-muted/60">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold">Cohorte</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold">Origen</th>
                              <th className="px-4 py-3 text-right text-sm font-semibold">Estudiantes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedProjectedCourse.cohortContributions.map((item) => (
                              <tr key={`${selectedProjectedCourse.id}-${item.cohort}`} className="border-t">
                                <td className="px-4 py-4 text-sm font-medium">{item.cohort}</td>
                                <td className="px-4 py-4 text-sm text-muted-foreground">{item.type}</td>
                                <td className="px-4 py-4 text-right text-sm font-semibold tabular-nums">{item.students}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-5">
                      <p className="text-sm font-medium text-muted-foreground">Lectura para la reunion</p>
                      <div className="mt-4 space-y-3 text-sm">
                        <p>
                          Para abrir este curso en {selectedProjectedCourse.year}, primero se toma el cohorte nuevo del ciclo:{' '}
                          <span className="font-semibold">{selectedProjectedCourse.newCohortStudents}</span> estudiantes.
                        </p>
                        <p>
                          Luego se suman los rezagados de cohortes anteriores:{' '}
                          <span className="font-semibold">{selectedProjectedCourse.retainedStudents}</span> estudiantes que vuelven a demandar cupo.
                        </p>
                        <p>
                          La proyeccion total queda en <span className="font-semibold">{selectedProjectedCourse.projectedStudents}</span>{' '}
                          estudiantes, por lo que se recomienda abrir{' '}
                          <span className="font-semibold">{selectedProjectedCourse.suggestedGroups}</span> grupos.
                        </p>
                        <p>
                          Eso se traduce en <span className="font-semibold">{selectedProjectedCourse.suggestedProfessors}</span>{' '}
                          profesores y un impacto estimado de{' '}
                          <span className="font-semibold">{selectedProjectedCourse.projectedJourney.toFixed(2)} jornadas</span>.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Curso</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Carrera / ciclo</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Cohorte nuevo</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Rezagados</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Proyeccion</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Grupos</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Jornadas</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Detalle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDemandRows.map((row) => (
                        <tr key={row.id} className="border-t">
                          <td className="px-4 py-4 text-sm font-medium">
                            <div>
                              <p>{row.code}</p>
                              <p className="text-muted-foreground">{row.course}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <div>
                              <p>{row.career}</p>
                              <p className="text-muted-foreground">
                                {row.cycle} - {row.year}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right text-sm tabular-nums">{row.newCohortStudents}</td>
                          <td className="px-4 py-4 text-right text-sm font-semibold tabular-nums">{row.retainedStudents}</td>
                          <td className="px-4 py-4 text-right text-sm font-semibold tabular-nums">{row.projectedStudents}</td>
                          <td className="px-4 py-4 text-right text-sm tabular-nums">{row.suggestedGroups}</td>
                          <td className="px-4 py-4 text-right text-sm tabular-nums">{row.projectedJourney.toFixed(2)}j</td>
                          <td className="px-4 py-4 text-right">
                            <Button variant="outline" size="sm" onClick={() => setSelectedDemandCourse(row.id)}>
                              Ver detalle
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
                      <p className="text-sm text-muted-foreground">Lectura del tab</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Esta vista muestra cuantos estudiantes trae cada cohorte al curso y como esa suma termina definiendo grupos, profesores y jornadas.
                      </p>
                    </div>
                    <p className="text-3xl font-bold">{demandSummary.totalProjectedStudents}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="config" className="mt-6">
          <JourneyConfigDisplay
            config={transformedConfig}
            loading={loadingConfig}
            onUploadConfig={handleUploadConfig}
            canEdit={true}
          />
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
