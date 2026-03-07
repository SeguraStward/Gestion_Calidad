'use client'

import { useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@una-gc/ui/components'
import { Clock } from 'lucide-react'

import { Breadcrumbs } from '../components/Breadcrumbs'
import CampusAllocationsTable from '../components/CampusAllocationsTable'
import JourneyConfigDisplay, { type JourneyConfig } from '../components/JourneyConfigDisplay'
import JourneyCalculator from '../components/JourneyCalculator'
import ProfessorAssignments, { type ProfessorAssignmentRow } from '../components/ProfessorAssignments'
import RepitenciasManager from '../components/RepitenciasManager'

import { useJourneyTimeConfigStore } from '../store/useJourneyTimeConfigStore'
import { useCampusAllocationsStore } from '../store/useCampusAllocationsStore'
import { useProfessorAssignmentsStore } from '../store/useProfessorAssignmentsStore'

export default function TimesAdminPage() {
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
  }, [fetchActive, fetchAllocations, fetchAssignments])

  const transformedAllocations = allocations.map((allocation) => ({
    campus: allocation.campusName || 'Sin nombre',
    cycle: allocation.cycleName || 'Sin ciclo',
    career: allocation.careerName || 'Sin carrera',
    totalHours: allocation.totalAllocatedTime,
    status: allocation.status === 'ACTIVE' ? 'Activo' : allocation.status === 'PLANNED' ? 'Planeado' : 'Inactivo'
  }))

  const transformedAssignments: ProfessorAssignmentRow[] = assignments.map((assignment) => ({
    id: assignment.id || '',
    professorName: assignment.professorName || 'Sin nombre',
    professorId: assignment.professorIdentification || assignment.professorId,
    career: assignment.careerName || 'Sin carrera',
    campus: assignment.campusName || 'Sin campus',
    assignedHours: assignment.calculatedJourneyTime ?? 0,
    assignmentType: assignment.assignmentType || 'No definido',
    status: assignment.status === 'ACTIVE' ? 'active' : assignment.status === 'PENDING' ? 'pending' : 'inactive'
  }))

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
      alert('Configuracion cargada correctamente')
    } catch (error) {
      console.error('Error uploading config:', error)
      alert('Error al cargar la configuracion')
    }
  }

  const handleAssignProfessor = async (assignment: Record<string, any>) => {
    try {
      console.log('📤 Datos recibidos del formulario:', assignment)

      // Validar que tengamos los datos necesarios
      if (!assignment.professorId || !assignment.academicCycleId || !assignment.campusId || !assignment.assignmentType) {
        alert('⚠️ Faltan datos requeridos en el formulario')
        console.error('Datos faltantes:', assignment)
        return
      }

      await createAssignment({
        professorId: assignment.professorId,
        academicCycleId: assignment.academicCycleId,
        campusId: assignment.campusId,
        curricularMeshCourseId: assignment.curricularMeshCourseId,
        assignmentType: assignment.assignmentType,
        notes: assignment.notes
      })

      // 🔄 Refrescar las asignaciones para mostrar datos actualizados
      await fetchAssignments()

      alert('✅ Asignación registrada correctamente')
    } catch (error) {
      console.error('❌ Error assigning professor:', error)
      alert('Error al registrar la asignación')
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Tiempos de Jornada', href: '/times-management' },
          { label: 'Administracion', href: '/times-management/admin' }
        ]}
      />

      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Clock className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion de Tiempos de Jornada</h1>
          <p className="text-muted-foreground">
            Modulo administrativo para visualizar, calcular y gestionar configuraciones de jornada academica.
          </p>
        </div>
      </div>

      <Tabs defaultValue="allocations" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="allocations">Asignaciones</TabsTrigger>
          <TabsTrigger value="config">Configuracion</TabsTrigger>
          <TabsTrigger value="calculation">Calculo</TabsTrigger>
          <TabsTrigger value="professor">Profesores</TabsTrigger>
          <TabsTrigger value="repitencias">Repitencias</TabsTrigger>
        </TabsList>

        <TabsContent value="allocations" className="mt-6">
          <CampusAllocationsTable allocations={transformedAllocations} loading={loadingAllocations} />
        </TabsContent>

        <TabsContent value="config" className="mt-6">
          <JourneyConfigDisplay
            config={transformedConfig}
            loading={loadingConfig}
            onUploadConfig={handleUploadConfig}
            canEdit={true}
          />
        </TabsContent>

        <TabsContent value="calculation" className="mt-6">
          <JourneyCalculator config={transformedConfig} />
        </TabsContent>

        <TabsContent value="professor" className="mt-6">
          <ProfessorAssignments
            assignments={transformedAssignments}
            loading={loadingProfessors}
            onAssign={handleAssignProfessor}
          />
        </TabsContent>

        <TabsContent value="repitencias" className="mt-6">
          <RepitenciasManager campusAllocationId={allocations[0]?.id || '69155d8217ff77f3c7c2ddf1'} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
