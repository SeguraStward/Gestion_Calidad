'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Plus, RefreshCw } from 'lucide-react'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@una-gc/ui/components/dialog'
import { Input } from '@una-gc/ui/components/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@una-gc/ui/components'

import { userApiService } from '@/lib/api/modules/user/user-api.service'

import { Breadcrumbs } from '../components/Breadcrumbs'
import ExternalProviderForm from '../components/ExternalProviderForm'
import ExternalProvidersTable from '../components/ExternalProvidersTable'
import InstitutionalProjectForm from '../components/InstitutionalProjectForm'
import InstitutionalProjectsTable from '../components/InstitutionalProjectsTable'
import { StatsGrid } from '../components/StatsCard'

import { useAnnualAllocationsStore } from '../store/useAnnualAllocationsStore'
import { useCampusAllocationsStore } from '../store/useCampusAllocationsStore'
import { useExternalProvidersStore } from '../store/useExternalProvidersStore'
import { useInstitutionalProjectsStore } from '../store/useInstitutionalProjectsStore'

import type { CreateExternalProviderDto, ExternalProvider } from '../services/external-providers.service'
import type { CreateInstitutionalProjectDto, InstitutionalProject } from '../services/institutional-projects.service'

export default function TimesExtensionsPage() {
  const {
    activeAllocation,
    loading: allocationLoading,
    error: allocationError,
    fetchActive: fetchActiveAllocation,
    create: createAnnualAllocation,
    update: updateAnnualAllocation,
    clearError: clearAllocationError
  } = useAnnualAllocationsStore()

  const {
    providers,
    selectedProvider,
    loading: providersLoading,
    error: providersError,
    fetchProviders,
    createProvider,
    updateProvider,
    deleteProvider,
    selectProvider,
    clearError: clearProviderError
  } = useExternalProvidersStore()

  const {
    projects,
    selectedProject,
    loading: projectsLoading,
    error: projectsError,
    fetchProjects,
    fetchProjectsWithAvailableTime,
    createProject,
    updateProject,
    deleteProject,
    selectProject,
    clearError: clearProjectError
  } = useInstitutionalProjectsStore()

  const { allocations: campusAllocations, fetchAll: fetchCampusAllocations } = useCampusAllocationsStore()

  const [directors, setDirectors] = useState<Array<{ id: string; name?: string; email?: string }>>([])
  const [activeTab, setActiveTab] = useState('providers')
  const [annualDialogOpen, setAnnualDialogOpen] = useState(false)
  const [providerDialogOpen, setProviderDialogOpen] = useState(false)
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [annualYear, setAnnualYear] = useState(new Date().getFullYear())
  const [annualTotalTime, setAnnualTotalTime] = useState('')

  const calculatedTotalProvidedTime = useMemo(
    () => providers.reduce((sum, provider) => sum + (provider.providedJourneyTime || 0), 0),
    [providers]
  )

  const calculatedTotalRequiredTime = useMemo(
    () => projects.reduce((sum, project) => sum + (project.requiredJourneyTime || 0), 0),
    [projects]
  )

  const calculatedTotalAssignedTime = useMemo(
    () => projects.reduce((sum, project) => sum + (project.assignedJourneyTime || 0), 0),
    [projects]
  )

  const projectCampusAllocations = useMemo(
    () =>
      campusAllocations
        .filter((allocation): allocation is typeof allocation & { id: string } => Boolean(allocation.id))
        .map((allocation) => ({
          id: allocation.id,
          campusName: allocation.campusName || allocation.campusId,
          cycleName: allocation.cycleName || allocation.academicCycleId,
          careerName: allocation.careerName
        })),
    [campusAllocations]
  )

  useEffect(() => {
    fetchActiveAllocation()
    fetchProviders()
    fetchProjects()
    fetchProjectsWithAvailableTime()
    fetchCampusAllocations()

    ;(async () => {
      try {
        const res = await userApiService.getUsersByRoleNameAndStatus('DIRECTOR', 'ACTIVE', 1, 100)
        const items = res?.data || []
        setDirectors(
          items.map((user) => ({
            id: user.id,
            name: user.fullName,
            email: user.email
          }))
        )
      } catch (err) {
        console.error('Error fetching directors:', err)
        setDirectors([])
      }
    })()
  }, [fetchActiveAllocation, fetchProviders, fetchProjects, fetchProjectsWithAvailableTime, fetchCampusAllocations])

  const openAnnualDialog = () => {
    setAnnualYear(activeAllocation?.year ?? new Date().getFullYear())
    setAnnualTotalTime(activeAllocation ? String(activeAllocation.totalJourneyTime) : '')
    clearAllocationError()
    setAnnualDialogOpen(true)
  }

  const handleSubmitAnnualAllocation = async () => {
    if (!annualYear || !annualTotalTime) {
      alert('Completa el ano y el total de jornadas.')
      return
    }

    const totalJourneyTime = Number(annualTotalTime)
    if (!Number.isFinite(totalJourneyTime) || totalJourneyTime <= 0) {
      alert('El total de jornadas debe ser un numero valido mayor a 0.')
      return
    }

    try {
      if (activeAllocation?.id) {
        await updateAnnualAllocation(activeAllocation.id, {
          year: annualYear,
          totalJourneyTime
        })
      } else {
        await createAnnualAllocation({
          year: annualYear,
          totalJourneyTime,
          status: 'ACTIVE'
        })
      }

      await fetchActiveAllocation()
      setAnnualDialogOpen(false)
    } catch (error) {
      console.error('Error saving annual allocation:', error)
    }
  }

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
      alert('No hay una asignacion anual activa. Crea una primero.')
      return
    }

    try {
      const payload = {
        ...data,
        annualAllocationId: data.annualAllocationId || activeAllocation.id
      }

      if (isEditing && selectedProvider?.id) {
        await updateProvider(selectedProvider.id, payload)
      } else {
        await createProvider(payload)
      }

      await fetchProviders()
      setProviderDialogOpen(false)
      selectProvider(null)
    } catch (error: any) {
      console.error('Error submitting provider:', error)
      alert(`Error al guardar el proveedor: ${error?.message || 'Error desconocido'}`)
    }
  }

  const handleDeleteProvider = async (id: string) => {
    await deleteProvider(id)
  }

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
    if (!activeAllocation?.id) {
      alert('No hay una asignacion anual activa. Crea una primero.')
      return
    }

    if (!data.campusAllocationId) {
      alert('Debes seleccionar una asignacion de campus.')
      return
    }

    if (!data.directorId) {
      alert('Debes seleccionar un director.')
      return
    }

    try {
      const payload = {
        ...data,
        assignedJourneyTime: data.assignedJourneyTime || 0
      }

      if (isEditing && selectedProject?.id) {
        await updateProject(selectedProject.id, payload)
      } else {
        await createProject(payload)
      }

      await fetchProjects()
      await fetchProjectsWithAvailableTime()
      setProjectDialogOpen(false)
      selectProject(null)
    } catch (error) {
      console.error('Error submitting project:', error)
      alert('Error al guardar el proyecto. Revisa los datos e intenta nuevamente.')
    }
  }

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id)
  }

  return (
    <div className="container mx-auto min-h-full space-y-6 p-6">
      <Breadcrumbs
        items={[
          { label: 'Gestion de Tiempos', href: '/times-management' },
          { label: 'Capacidad Externa y Proyectos' }
        ]}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Capacidad Externa y Proyectos</h1>
          <p className="mt-2 text-muted-foreground">
            Administra la asignacion anual, los apoyos externos y los proyectos institucionales.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {activeAllocation ? (
            <>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Asignacion anual activa</p>
                <p className="text-lg font-semibold">
                  Ano {activeAllocation.year} - {activeAllocation.totalJourneyTime} jornadas
                </p>
              </div>
              <Button variant="outline" onClick={openAnnualDialog} disabled={allocationLoading}>
                Editar
              </Button>
            </>
          ) : (
            <Button size="lg" onClick={openAnnualDialog} disabled={allocationLoading}>
              <Plus className="mr-2 h-4 w-4" />
              Crear asignacion anual
            </Button>
          )}
        </div>
      </div>

      {allocationError && (
        <div className="flex items-center justify-between rounded bg-red-100 p-3 text-red-800">
          <span>{allocationError}</span>
          <Button variant="ghost" size="sm" onClick={clearAllocationError}>
            Cerrar
          </Button>
        </div>
      )}

      {!activeAllocation && !allocationLoading && (
        <div className="rounded border-l-4 border-yellow-400 bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">No hay una asignacion anual activa</h3>
              <p className="mt-2 text-sm text-yellow-700">
                Para registrar proveedores externos y proyectos institucionales, primero debes crear una asignacion
                anual activa.
              </p>
            </div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="providers">Proveedores externos</TabsTrigger>
          <TabsTrigger value="projects">Proyectos institucionales</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Proveedores externos</CardTitle>
                  <CardDescription>
                    Convenios, universidades y apoyos externos que aportan jornadas adicionales.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => fetchProviders()} disabled={providersLoading}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Actualizar
                  </Button>
                  <Button size="sm" onClick={handleCreateProvider}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo proveedor
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {providersError && (
                <div className="mb-4 flex items-center justify-between rounded bg-red-100 p-3 text-red-800">
                  <span>{providersError}</span>
                  <Button variant="ghost" size="sm" onClick={clearProviderError}>
                    Cerrar
                  </Button>
                </div>
              )}

              <div className="mb-6">
                <StatsGrid
                  stats={[
                    {
                      title: 'Proveedores registrados',
                      value: providers.length,
                      description: 'Total del periodo',
                      icon: <Plus className="h-4 w-4" />,
                      trend: 'neutral'
                    },
                    {
                      title: 'Jornadas externas',
                      value: `${calculatedTotalProvidedTime}j`,
                      description: 'Capacidad disponible',
                      icon: <RefreshCw className="h-4 w-4" />,
                      trend: calculatedTotalProvidedTime > 0 ? 'up' : 'neutral',
                      trendValue: calculatedTotalProvidedTime > 0 ? 'Con aporte disponible' : 'Sin aporte registrado'
                    },
                    {
                      title: 'Convenios activos',
                      value: providers.filter((provider) => provider.status === 'ACTIVE').length,
                      description: 'Vigentes',
                      icon: <Plus className="h-4 w-4" />,
                      trend: 'up'
                    },
                    {
                      title: 'Promedio por proveedor',
                      value: providers.length > 0 ? `${Math.round(calculatedTotalProvidedTime / providers.length)}j` : '0j',
                      description: 'Capacidad media',
                      icon: <RefreshCw className="h-4 w-4" />
                    }
                  ]}
                />
              </div>

              <ExternalProvidersTable
                providers={providers}
                loading={providersLoading}
                onEdit={handleEditProvider}
                onDelete={handleDeleteProvider}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Proyectos institucionales</CardTitle>
                  <CardDescription>
                    Iniciativas que consumen jornadas dentro de la capacidad disponible del periodo.
                  </CardDescription>
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
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Actualizar
                  </Button>
                  <Button size="sm" onClick={handleCreateProject}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo proyecto
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {projectsError && (
                <div className="mb-4 flex items-center justify-between rounded bg-red-100 p-3 text-red-800">
                  <span>{projectsError}</span>
                  <Button variant="ghost" size="sm" onClick={clearProjectError}>
                    Cerrar
                  </Button>
                </div>
              )}

              <div className="mb-6">
                <StatsGrid
                  stats={[
                    {
                      title: 'Proyectos registrados',
                      value: projects.length,
                      description: 'Total del periodo',
                      icon: <Plus className="h-4 w-4" />,
                      trend: 'neutral'
                    },
                    {
                      title: 'Proyectos activos',
                      value: projects.filter((project) => project.projectStatus === 'ACTIVE').length,
                      description: 'En ejecucion',
                      icon: <RefreshCw className="h-4 w-4" />,
                      trend: 'up'
                    },
                    {
                      title: 'Jornadas requeridas',
                      value: `${calculatedTotalRequiredTime}j`,
                      description: 'Necesidad total',
                      icon: <Plus className="h-4 w-4" />,
                      trend: 'neutral'
                    },
                    {
                      title: 'Jornadas asignadas',
                      value: `${calculatedTotalAssignedTime}j`,
                      description: `Cobertura: ${calculatedTotalRequiredTime > 0 ? Math.round((calculatedTotalAssignedTime / calculatedTotalRequiredTime) * 100) : 0}%`,
                      icon: <RefreshCw className="h-4 w-4" />,
                      trend:
                        calculatedTotalAssignedTime >= calculatedTotalRequiredTime
                          ? 'up'
                          : calculatedTotalAssignedTime > 0
                            ? 'neutral'
                            : 'down',
                      trendValue:
                        calculatedTotalAssignedTime >= calculatedTotalRequiredTime
                          ? 'Cobertura completa'
                          : calculatedTotalAssignedTime > 0
                            ? `Pendiente ${calculatedTotalRequiredTime - calculatedTotalAssignedTime}j`
                            : 'Sin asignacion'
                    }
                  ]}
                />
              </div>

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

      <Dialog open={annualDialogOpen} onOpenChange={setAnnualDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{activeAllocation ? 'Editar asignacion anual' : 'Crear asignacion anual'}</DialogTitle>
            <DialogDescription>
              {activeAllocation
                ? 'Actualiza el ano y el total de jornadas de la asignacion activa.'
                : 'Define el ano y el total de jornadas para crear una nueva asignacion anual.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Ano</label>
              <Input
                type="number"
                value={annualYear}
                onChange={(event) => setAnnualYear(Number(event.target.value))}
                min="2020"
                max="2100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Total de jornadas</label>
              <Input
                type="number"
                value={annualTotalTime}
                onChange={(event) => setAnnualTotalTime(event.target.value)}
                min="1"
                step="0.5"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAnnualDialogOpen(false)} disabled={allocationLoading}>
                Cancelar
              </Button>
              <Button onClick={handleSubmitAnnualAllocation} disabled={allocationLoading}>
                {allocationLoading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={providerDialogOpen} onOpenChange={setProviderDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar proveedor externo' : 'Nuevo proveedor externo'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Actualiza la informacion del proveedor externo.'
                : 'Registra un nuevo proveedor externo de jornadas.'}
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

      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar proyecto institucional' : 'Nuevo proyecto institucional'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Actualiza la informacion del proyecto institucional.'
                : 'Registra un nuevo proyecto que requiere jornadas de trabajo.'}
            </DialogDescription>
          </DialogHeader>
          <InstitutionalProjectForm
            project={selectedProject}
            campusAllocations={projectCampusAllocations}
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
