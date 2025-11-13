'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@una-gc/ui/components'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components'
import { Button } from '@una-gc/ui/components/button'
import { Plus, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@una-gc/ui/components/dialog'

// Components
import ExternalProvidersTable from '../components/ExternalProvidersTable'
import ExternalProviderForm from '../components/ExternalProviderForm'
import InstitutionalProjectsTable from '../components/InstitutionalProjectsTable'
import InstitutionalProjectForm from '../components/InstitutionalProjectForm'
import { StatsGrid } from '../components/StatsCard'
import { Breadcrumbs } from '../components/Breadcrumbs'

// Stores
import { useExternalProvidersStore } from '../store/useExternalProvidersStore'
import { useInstitutionalProjectsStore } from '../store/useInstitutionalProjectsStore'

// Types
import type { ExternalProvider, CreateExternalProviderDto } from '../services/external-providers.service'
import type { InstitutionalProject, CreateInstitutionalProjectDto } from '../services/institutional-projects.service'

export default function TimesExtensionsPage() {
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
  //  📋 Local UI State
  // ============================================================
  const [activeTab, setActiveTab] = useState('providers')
  const [providerDialogOpen, setProviderDialogOpen] = useState(false)
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Mock data for testing (replace with real data later)
  const MOCK_ANNUAL_ALLOCATION_ID = 'mock-annual-2025'
  const MOCK_CAMPUS_ALLOCATION_ID = 'mock-campus-brunca'
  const MOCK_DIRECTOR_ID = 'mock-director-001'

  // ============================================================
  //  🚀 Initial Data Load
  // ============================================================
  useEffect(() => {
    fetchProviders()
    fetchProjects()
    fetchProjectsWithAvailableTime()
  }, [fetchProviders, fetchProjects, fetchProjectsWithAvailableTime])

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
    try {
      // Ensure annualAllocationId is set
      const payload = {
        ...data,
        annualAllocationId: data.annualAllocationId || MOCK_ANNUAL_ALLOCATION_ID
      }

      if (isEditing && selectedProvider?.id) {
        await updateProvider(selectedProvider.id, payload)
      } else {
        await createProvider(payload)
      }
      setProviderDialogOpen(false)
      selectProvider(null)
    } catch (error) {
      console.error('Error submitting provider:', error)
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
    try {
      // Ensure required IDs are set
      const payload = {
        ...data,
        campusAllocationId: data.campusAllocationId || MOCK_CAMPUS_ALLOCATION_ID,
        directorId: data.directorId || MOCK_DIRECTOR_ID,
        assignedJourneyTime: data.assignedJourneyTime || 0
      }

      if (isEditing && selectedProject?.id) {
        await updateProject(selectedProject.id, payload)
      } else {
        await createProject(payload)
      }
      setProjectDialogOpen(false)
      selectProject(null)
    } catch (error) {
      console.error('Error submitting project:', error)
    }
  }

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id)
  }

  // ============================================================
  //  🎨 Render
  // ============================================================
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Gestión de Tiempos', href: '/times-management' }, { label: 'Proveedores y Proyectos' }]} />

      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Tiempo de Jornada</h1>
          <p className="text-gray-600 mt-2">Administración de proveedores externos y proyectos institucionales</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="providers">Proveedores Externos</TabsTrigger>
          <TabsTrigger value="projects">Proyectos Institucionales</TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/*  TAB 1: PROVEEDORES EXTERNOS */}
        {/* ============================================================ */}
        <TabsContent value="providers" className="space-y-4">
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
                      value: `${totalProvidedTime}h`,
                      description: 'Tiempo de jornada disponible',
                      icon: <RefreshCw className="h-4 w-4" />,
                      trend: 'up',
                      trendValue: 'Disponible para asignación'
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
                      value: providers.length > 0 ? `${Math.round(totalProvidedTime / providers.length)}h` : '0h',
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
        <TabsContent value="projects" className="space-y-4">
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
                      value: `${projects.reduce((sum, p) => sum + p.requiredJourneyTime, 0)}h`,
                      description: 'Tiempo total necesario',
                      icon: <Plus className="h-4 w-4" />,
                      trend: 'neutral'
                    },
                    {
                      title: 'Horas Asignadas',
                      value: `${projects.reduce((sum, p) => sum + p.assignedJourneyTime, 0)}h`,
                      description: `Capacidad: ${projects.reduce((sum, p) => sum + p.requiredJourneyTime, 0) > 0 ? Math.round((projects.reduce((sum, p) => sum + p.assignedJourneyTime, 0) / projects.reduce((sum, p) => sum + p.requiredJourneyTime, 0)) * 100) : 0}%`,
                      icon: <RefreshCw className="h-4 w-4" />,
                      trend:
                        projects.reduce((sum, p) => sum + p.assignedJourneyTime, 0) >=
                        projects.reduce((sum, p) => sum + p.requiredJourneyTime, 0)
                          ? 'up'
                          : 'down',
                      trendValue:
                        projects.reduce((sum, p) => sum + p.assignedJourneyTime, 0) >=
                        projects.reduce((sum, p) => sum + p.requiredJourneyTime, 0)
                          ? 'Completo'
                          : 'Requiere más asignaciones'
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
            annualAllocationId={MOCK_ANNUAL_ALLOCATION_ID}
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
            campusAllocationId={MOCK_CAMPUS_ALLOCATION_ID}
            directorId={MOCK_DIRECTOR_ID}
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
