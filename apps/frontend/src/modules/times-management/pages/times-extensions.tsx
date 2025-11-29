'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@una-gc/ui/components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components'
import { Button } from '@una-gc/ui/components/button'
import { Plus, RefreshCw, AlertTriangle } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import { useUserService } from '@/lib/api/modules/user/hooks/use-user-service'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@una-gc/ui/components/dialog'

// Components
import ExternalProvidersTable from '../components/ExternalProvidersTable'
import ExternalProviderForm from '../components/ExternalProviderForm'
import InstitutionalProjectsTable from '../components/InstitutionalProjectsTable'
import InstitutionalProjectForm from '../components/InstitutionalProjectForm'
import AnnualAllocationQuickCreate from '../components/AnnualAllocationQuickCreate'
import { StatsGrid } from '../components/StatsCard'
import { Breadcrumbs } from '../components/Breadcrumbs'

// Stores
import { useExternalProvidersStore } from '../store/useExternalProvidersStore'
import { useInstitutionalProjectsStore } from '../store/useInstitutionalProjectsStore'
import { useAnnualAllocationsStore } from '../store/useAnnualAllocationsStore'
import { useCampusAllocationsStore } from '../store/useCampusAllocationsStore'

// Types
import type { ExternalProvider, CreateExternalProviderDto } from '../services/external-providers.service'
import type { InstitutionalProject, CreateInstitutionalProjectDto } from '../services/institutional-projects.service'

export default function TimesExtensionsPage() {
  // ============================================================
  //  🗄️ Store State - Annual Allocation
  // ============================================================
  const { activeAllocation, loading: allocationLoading, fetchActive: fetchActiveAllocation } = useAnnualAllocationsStore()

  // ============================================================
  //  🗄️ Store State - External Providers
  // ============================================================
  const {
    providers,
    selectedProvider,
    loading: providersLoading,
    error: providersError,
    totalProvidedTime,
    fetchProviders,
    createProvider,
    updateProvider,
    deleteProvider,
    selectProvider,
    clearError: clearProviderError
  } = useExternalProvidersStore()

  // ============================================================
  //  🗄️ Store State - Institutional Projects
  // ============================================================
  const {
    projects,
    projectsWithAvailableTime,
    selectedProject,
    loading: projectsLoading,
    error: projectsError,
    totalAssignedTime,
    fetchProjects,
    fetchProjectsWithAvailableTime,
    createProject,
    updateProject,
    deleteProject,
    selectProject,
    clearError: clearProjectError
  } = useInstitutionalProjectsStore()

  // ============================================================
  //  🗄️ Store State - Campus Allocations
  // ============================================================
  const { allocations: campusAllocations, fetchAll: fetchCampusAllocations } = useCampusAllocationsStore()

  // ============================================================
  //  🧑‍💼 Directors list (from users service)
  // ============================================================
  const { getUsers } = useUserService()
  const [directors, setDirectors] = useState<Array<{ id: string; name?: string; email?: string }>>([])

  // ============================================================
  //  📋 Local UI State
  // ============================================================
  const [activeTab, setActiveTab] = useState('providers')
  const [providerDialogOpen, setProviderDialogOpen] = useState(false)
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // ============================================================
  //  📊 Calculated Stats
  // ============================================================

  const calculatedTotalProvidedTime = useMemo(() => {
    return providers.reduce((sum, p) => sum + (p.providedJourneyTime || 0), 0)
  }, [providers])

  const calculatedTotalRequiredTime = useMemo(() => {
    return projects.reduce((sum, p) => sum + (p.requiredJourneyTime || 0), 0)
  }, [projects])

  const calculatedTotalAssignedTime = useMemo(() => {
    return projects.reduce((sum, p) => sum + (p.assignedJourneyTime || 0), 0)
  }, [projects])

  // ============================================================
  //  🚀 Initial Data Load
  // ============================================================
  useEffect(() => {
    fetchActiveAllocation()
    fetchProviders()
    fetchProjects()
    fetchProjectsWithAvailableTime()
    fetchCampusAllocations()

    // Fetch directors (users with role DIRECTOR). If role name differs adjust accordingly.
    ;(async () => {
      try {
        const res = await getUsers({ roleName: 'DIRECTOR', status: 'ACTIVE', page: 1, limit: 100 })
        const items = res?.data || []
        setDirectors(items.map((u: any) => ({ id: u.id, name: u.name, email: u.email })))
      } catch (err) {
        console.error('Error fetching directors:', err)
        setDirectors([])
      }
    })()
  }, [fetchActiveAllocation, fetchProviders, fetchProjects, fetchProjectsWithAvailableTime])

  // ============================================================
  //  🔹 External Providers Handlers
  // ============================================================
  const handleCreateProvider = () => {
    selectProvider(null)
    setIsEditing(false)
    setProviderDialogOpen(true)
  }

  const handleEditProvider = (provider: ExternalProvider) => {
    selectProvider(provider)
    setIsEditing(true)
    setProviderDialogOpen(true)
  }

  const handleSubmitProvider = async (data: CreateExternalProviderDto) => {
    if (!activeAllocation?.id) {
      alert('No hay una asignación anual activa. Por favor crea una primero.')
      return
    }

    try {
      console.log('🟦 Frontend - Active Allocation:', activeAllocation)
      console.log('🟦 Frontend - Form Data:', data)

      // Use real annualAllocationId from active allocation
      const payload = {
        ...data,
        annualAllocationId: data.annualAllocationId || activeAllocation.id
      }

      console.log('🟦 Frontend - Final Payload:', payload)

      if (isEditing && selectedProvider?.id) {
        await updateProvider(selectedProvider.id, payload)
      } else {
        console.log('🟦 Frontend - Calling createProvider...')
        const result = await createProvider(payload)
        console.log('✅ Frontend - Created successfully:', result)
      }
      setProviderDialogOpen(false)
      selectProvider(null)
    } catch (error: any) {
      console.error('❌ Frontend - Error submitting provider:', error)
      alert('Error al crear el proveedor: ' + (error?.message || 'Error desconocido'))
    }
  }

  const handleDeleteProvider = async (id: string) => {
    await deleteProvider(id)
  }

  // ============================================================
  //  🔹 Institutional Projects Handlers
  // ============================================================
  const handleCreateProject = () => {
    selectProject(null)
    setIsEditing(false)
    setProjectDialogOpen(true)
  }

  const handleEditProject = (project: InstitutionalProject) => {
    selectProject(project)
    setIsEditing(true)
    setProjectDialogOpen(true)
  }

  const handleSubmitProject = async (data: CreateInstitutionalProjectDto) => {
    console.log('🟦 Frontend - Submitting project...', data)

    if (!activeAllocation?.id) {
      alert('No hay una asignación anual activa. Por favor crea una primero.')
      return
    }

    // ⚠️ TODO: Agregar selectores reales para campus y director en el formulario
    // Por ahora, pedimos al usuario que proporcione IDs válidos
    if (!data.campusAllocationId || data.campusAllocationId === 'temp-campus-allocation-id') {
      alert('⚠️ Falta campusAllocationId válido. Por favor selecciona una asignación de campus.')
      return
    }

    if (!data.directorId || data.directorId === 'temp-director-id') {
      alert('⚠️ Falta directorId válido. Por favor selecciona un director.')
      return
    }

    try {
      const payload = {
        ...data,
        assignedJourneyTime: data.assignedJourneyTime || 0
      }

      console.log('🟦 Frontend - Final payload:', payload)

      if (isEditing && selectedProject?.id) {
        await updateProject(selectedProject.id, payload)
      } else {
        await createProject(payload)
      }
      setProjectDialogOpen(false)
      selectProject(null)
    } catch (error) {
      console.error('❌ Frontend - Error submitting project:', error)
      alert('Error al crear el proyecto. Revisa que los IDs sean válidos.')
    }
  }

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id)
  }

  // ============================================================
  //  🎨 Render
  // ============================================================
  return (
    <div className="container mx-auto p-6 space-y-6 min-h-full">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Gestión de Tiempos', href: '/times-management' }, { label: 'Proveedores y Proyectos' }]} />

      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Tiempo de Jornada</h1>
          <p className="text-gray-600 mt-2">Administración de proveedores externos y proyectos institucionales</p>
        </div>
      </div>

      {/* Annual Allocation Quick Create - Show if no active allocation */}
      {!activeAllocation && !allocationLoading && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">No hay asignación anual activa</h3>
              <p className="mt-2 text-sm text-yellow-700">
                Para crear proveedores externos y proyectos institucionales, primero necesitas una asignación anual activa.
              </p>
            </div>
          </div>
        </div>
      )}

      <AnnualAllocationQuickCreate
        onSuccess={(allocationId) => {
          console.log('✅ Asignación anual creada con ID:', allocationId)
          fetchActiveAllocation()
        }}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="providers">Proveedores Externos</TabsTrigger>
          <TabsTrigger value="projects">Proyectos Institucionales</TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/*  TAB 1: PROVEEDORES EXTERNOS */}
        {/* ============================================================ */}
        <TabsContent value="providers" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Proveedores Externos</CardTitle>
                  <CardDescription>Universidades, convenios y acuerdos que proveen horas de jornada adicionales</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => fetchProviders()} disabled={providersLoading}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                  <Button size="sm" onClick={handleCreateProvider}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Proveedor
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Error Message */}
              {providersError && (
                <div className="mb-4 p-3 bg-red-100 text-red-800 rounded flex justify-between items-center">
                  <span>{providersError}</span>
                  <Button variant="ghost" size="sm" onClick={clearProviderError}>
                    Cerrar
                  </Button>
                </div>
              )}

              {/* Stats */}
              <div className="mb-6">
                <StatsGrid
                  stats={[
                    {
                      title: 'Total Proveedores',
                      value: providers.length,
                      description: 'Proveedores registrados',
                      icon: <Plus className="h-4 w-4" />,
                      trend: 'neutral'
                    },
                    {
                      title: 'Horas Totales Provistas',
                      value: `${calculatedTotalProvidedTime}h`,
                      description: 'Tiempo de jornada disponible',
                      icon: <RefreshCw className="h-4 w-4" />,
                      trend: calculatedTotalProvidedTime > 0 ? 'up' : 'neutral',
                      trendValue: calculatedTotalProvidedTime > 0 ? 'Disponible para asignación' : 'Sin horas provistas'
                    },
                    {
                      title: 'Proveedores Activos',
                      value: providers.filter((p) => p.status === 'ACTIVE').length,
                      description: 'Convenios en vigor',
                      icon: <Plus className="h-4 w-4" />,
                      trend: 'up'
                    },
                    {
                      title: 'Promedio por Proveedor',
                      value: providers.length > 0 ? `${Math.round(calculatedTotalProvidedTime / providers.length)}h` : '0h',
                      description: 'Horas promedio',
                      icon: <RefreshCw className="h-4 w-4" />
                    }
                  ]}
                />
              </div>

              {/* Table */}
              <ExternalProvidersTable
                providers={providers}
                loading={providersLoading}
                onEdit={handleEditProvider}
                onDelete={handleDeleteProvider}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB 2: PROYECTOS INSTITUCIONALES */}
        {/* ============================================================ */}
        <TabsContent value="projects" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Proyectos Institucionales</CardTitle>
                  <CardDescription>Proyectos que requieren asignación de tiempo de jornada de profesores</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      fetchProjects()
                      fetchProjectsWithAvailableTime()
                    }}
                    disabled={projectsLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                  <Button size="sm" onClick={handleCreateProject}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Proyecto
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Error Message */}
              {projectsError && (
                <div className="mb-4 p-3 bg-red-100 text-red-800 rounded flex justify-between items-center">
                  <span>{projectsError}</span>
                  <Button variant="ghost" size="sm" onClick={clearProjectError}>
                    Cerrar
                  </Button>
                </div>
              )}

              {/* Stats */}
              <div className="mb-6">
                <StatsGrid
                  stats={[
                    {
                      title: 'Total Proyectos',
                      value: projects.length,
                      description: 'Proyectos registrados',
                      icon: <Plus className="h-4 w-4" />,
                      trend: 'neutral'
                    },
                    {
                      title: 'Proyectos Activos',
                      value: projects.filter((p) => p.projectStatus === 'ACTIVE').length,
                      description: 'En ejecución',
                      icon: <RefreshCw className="h-4 w-4" />,
                      trend: 'up'
                    },
                    {
                      title: 'Horas Requeridas',
                      value: `${calculatedTotalRequiredTime}h`,
                      description: 'Tiempo total necesario',
                      icon: <Plus className="h-4 w-4" />,
                      trend: 'neutral'
                    },
                    {
                      title: 'Horas Asignadas',
                      value: `${calculatedTotalAssignedTime}h`,
                      description: `Capacidad: ${calculatedTotalRequiredTime > 0 ? Math.round((calculatedTotalAssignedTime / calculatedTotalRequiredTime) * 100) : 0}%`,
                      icon: <RefreshCw className="h-4 w-4" />,
                      trend:
                        calculatedTotalAssignedTime >= calculatedTotalRequiredTime
                          ? 'up'
                          : calculatedTotalAssignedTime > 0
                            ? 'neutral'
                            : 'down',
                      trendValue:
                        calculatedTotalAssignedTime >= calculatedTotalRequiredTime
                          ? 'Completo'
                          : calculatedTotalAssignedTime > 0
                            ? `Falta ${calculatedTotalRequiredTime - calculatedTotalAssignedTime}h`
                            : 'Sin asignaciones'
                    }
                  ]}
                />
              </div>

              {/* Table */}
              <InstitutionalProjectsTable
                projects={projects}
                loading={projectsLoading}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ============================================================ */}
      {/*  DIALOGS */}
      {/* ============================================================ */}

      {/* External Provider Dialog */}
      <Dialog open={providerDialogOpen} onOpenChange={setProviderDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Proveedor Externo' : 'Nuevo Proveedor Externo'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica la información del proveedor externo'
                : 'Crea un nuevo proveedor externo de horas de jornada'}
            </DialogDescription>
          </DialogHeader>
          <ExternalProviderForm
            provider={selectedProvider}
            annualAllocationId={activeAllocation?.id}
            onSubmit={handleSubmitProvider}
            onCancel={() => {
              setProviderDialogOpen(false)
              selectProvider(null)
            }}
            loading={providersLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Institutional Project Dialog */}
      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Proyecto Institucional' : 'Nuevo Proyecto Institucional'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica la información del proyecto institucional'
                : 'Crea un nuevo proyecto institucional que requiere tiempo de jornada'}
            </DialogDescription>
          </DialogHeader>
          <InstitutionalProjectForm
            project={selectedProject}
            campusAllocations={campusAllocations}
            directors={directors}
            onSubmit={handleSubmitProject}
            onCancel={() => {
              setProjectDialogOpen(false)
              selectProject(null)
            }}
            loading={projectsLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
