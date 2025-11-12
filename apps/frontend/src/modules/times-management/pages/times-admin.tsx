'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@una-gc/ui/components'
import { Clock } from 'lucide-react'
import { Breadcrumbs } from '../components/Breadcrumbs'
import CampusAllocationsTable from '../components/CampusAllocationsTable'
import JourneyConfigDisplay, { type JourneyConfig } from '../components/JourneyConfigDisplay'
import JourneyCalculator from '../components/JourneyCalculator'
import ProfessorAssignments, { type ProfessorAssignment } from '../components/ProfessorAssignments'
import RepitenciasManager, { type RepitenciaRecord } from '../components/RepitenciasManager'
import { useJourneyTimeConfigStore } from '../store/useJourneyTimeConfigStore'
import { useCampusAllocationsStore } from '../store/useCampusAllocationsStore'
import { useProfessorAssignmentsStore } from '../store/useProfessorAssignmentsStore'

// Mock data for repitencias - TODO: Create backend module
const mockRepitencias: RepitenciaRecord[] = [
  {
    id: '1',
    carrera: 'Ingeniería en Sistemas',
    curso: 'IS-401',
    sede: 'Brunca',
    horas: 3,
    date: '2025-01-15'
  }
]

export default function TimesAdminPage() {
  // Zustand stores
  const { activeConfig, loading: loadingConfig, fetchActive, create: createConfig } = useJourneyTimeConfigStore()

  const { allocations, loading: loadingAllocations, fetchAll: fetchAllocations } = useCampusAllocationsStore()

  const {
    assignments,
    loading: loadingProfessors,
    fetchAll: fetchAssignments,
    create: createAssignment
  } = useProfessorAssignmentsStore()

  // State for repitencias (local until backend is ready)
  const [repitencias, setRepitencias] = useState(mockRepitencias)
  const [loadingRepitencias] = useState(false)

  // Load data on mount
  useEffect(() => {
    fetchActive()
    fetchAllocations()
    fetchAssignments()
  }, [fetchActive, fetchAllocations, fetchAssignments])

  // Transform allocations for component
  const transformedAllocations = allocations.map((a) => ({
    campus: a.campusName || 'Sin nombre',
    cycle: a.cycleName || 'Sin ciclo',
    career: a.careerName || 'Sin carrera',
    totalHours: a.totalAllocatedTime,
    status: a.status === 'ACTIVE' ? 'Activo' : a.status === 'PLANNED' ? 'Planeado' : 'Inactivo'
  }))

  // Transform assignments for component
  const transformedAssignments: ProfessorAssignment[] = assignments.map((a) => ({
    id: a.id || '',
    professorName: a.professorName || 'Sin nombre',
    professorId: a.professorIdentification || a.professorId,
    career: a.careerName || 'Sin carrera',
    campus: a.campusName || 'Sin campus',
    assignedHours: a.assignedJourneyTime,
    journeyType: a.journeyType || 'No definido',
    status: a.status === 'ACTIVE' ? 'active' : a.status === 'PENDING' ? 'pending' : 'inactive'
  }))

  // Transform config for component
  const transformedConfig: JourneyConfig | null = activeConfig
    ? {
        ...activeConfig,
        status: activeConfig.status as 'ACTIVE' | 'INACTIVE' | 'DRAFT' | undefined
      }
    : null

  // Handlers
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
      alert('Configuración cargada correctamente')
    } catch (error) {
      console.error('Error uploading config:', error)
      alert('Error al cargar la configuración')
    }
  }

  const handleAssignProfessor = async (assignment: Omit<ProfessorAssignment, 'id' | 'status'>) => {
    try {
      // TODO: Get proper campusAllocationId from form
      const campusAllocationId = allocations[0]?.id || ''

      await createAssignment({
        professorId: assignment.professorId,
        campusAllocationId,
        assignedJourneyTime: assignment.assignedHours,
        journeyType: assignment.journeyType,
        status: 'ACTIVE'
      })
      alert('Asignación registrada correctamente')
    } catch (error) {
      console.error('Error assigning professor:', error)
      alert('Error al registrar la asignación')
    }
  }

  const handleAddRepitencia = (record: Omit<RepitenciaRecord, 'id' | 'date'>) => {
    console.log('Adding repitencia:', record)
    const newRecord: RepitenciaRecord = {
      ...record,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0] || ''
    }
    setRepitencias([...repitencias, newRecord])
    // TODO: Connect to backend API
    alert('Repitencia registrada correctamente')
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Tiempos de Jornada', href: '/times-management' },
          { label: 'Administración', href: '/times-management/admin' }
        ]}
      />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Clock className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Tiempos de Jornada</h1>
          <p className="text-muted-foreground">
            Módulo administrativo para visualizar, calcular y gestionar configuraciones de jornada académica.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="allocations" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="allocations">Asignaciones</TabsTrigger>
          <TabsTrigger value="config">Configuración</TabsTrigger>
          <TabsTrigger value="calculation">Cálculo</TabsTrigger>
          <TabsTrigger value="professor">Profesores</TabsTrigger>
          <TabsTrigger value="repitencias">Repitencias</TabsTrigger>
        </TabsList>

        {/* TAB 1: Campus Allocations */}
        <TabsContent value="allocations" className="mt-6">
          <CampusAllocationsTable allocations={transformedAllocations} loading={loadingAllocations} />
        </TabsContent>

        {/* TAB 2: Configuration */}
        <TabsContent value="config" className="mt-6">
          <JourneyConfigDisplay
            config={transformedConfig}
            loading={loadingConfig}
            onUploadConfig={handleUploadConfig}
            canEdit={true} // TODO: Check user permissions
          />
        </TabsContent>

        {/* TAB 3: Calculator */}
        <TabsContent value="calculation" className="mt-6">
          <JourneyCalculator config={transformedConfig} />
        </TabsContent>

        {/* TAB 4: Professor Assignments */}
        <TabsContent value="professor" className="mt-6">
          <ProfessorAssignments
            assignments={transformedAssignments}
            loading={loadingProfessors}
            onAssign={handleAssignProfessor}
          />
        </TabsContent>

        {/* TAB 5: Repitencias */}
        <TabsContent value="repitencias" className="mt-6">
          <RepitenciasManager records={repitencias} loading={loadingRepitencias} onAdd={handleAddRepitencia} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
