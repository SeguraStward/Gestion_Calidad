// ============================================================
//   useInstitutionalProjectsStore
//  Store Zustand para gestión de proyectos institucionales
// ============================================================

import { create } from 'zustand'
import {
  InstitutionalProjectsService,
  InstitutionalProject,
  CreateInstitutionalProjectDto,
  UpdateInstitutionalProjectDto,
  ProjectWithAvailableTime
} from '../services/institutional-projects.service'

interface InstitutionalProjectsStore {
  //  Estado
  projects: InstitutionalProject[]
  projectsWithAvailableTime: ProjectWithAvailableTime[]
  selectedProject: InstitutionalProject | null
  loading: boolean
  error: string | null

  //  Estadísticas
  totalAssignedTime: number

  //  Acciones - Lectura
  fetchProjects: () => Promise<void>
  fetchProjectById: (id: string) => Promise<void>
  fetchProjectsByCampusAllocation: (campusAllocationId: string) => Promise<void>
  fetchProjectsByDirector: (directorId: string) => Promise<void>
  fetchProjectsWithAvailableTime: () => Promise<void>
  fetchTotalAssignedTime: (campusAllocationId: string) => Promise<void>

  //  Acciones - Escritura
  createProject: (data: CreateInstitutionalProjectDto) => Promise<InstitutionalProject | null>
  updateProject: (id: string, data: UpdateInstitutionalProjectDto) => Promise<boolean>
  deleteProject: (id: string) => Promise<boolean>

  //  Acciones - UI
  selectProject: (project: InstitutionalProject | null) => void
  clearError: () => void
  reset: () => void
}

const initialState = {
  projects: [],
  projectsWithAvailableTime: [],
  selectedProject: null,
  loading: false,
  error: null,
  totalAssignedTime: 0
}

export const useInstitutionalProjectsStore = create<InstitutionalProjectsStore>((set, get) => ({
  ...initialState,

  // ============================================================
  //   Lectura de Datos
  // ============================================================

  fetchProjects: async () => {
    set({ loading: true, error: null })
    try {
      const projects = await InstitutionalProjectsService.getAll()
      set({ projects, loading: false })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar proyectos'
      set({ error: errorMsg, loading: false })
      console.error(' Error en fetchProjects:', err)
    }
  },

  fetchProjectById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const project = await InstitutionalProjectsService.getById(id)
      if (project) {
        set({ selectedProject: project, loading: false })
      } else {
        set({ error: 'Proyecto no encontrado', loading: false })
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar proyecto'
      set({ error: errorMsg, loading: false })
      console.error(' Error en fetchProjectById:', err)
    }
  },

  fetchProjectsByCampusAllocation: async (campusAllocationId: string) => {
    set({ loading: true, error: null })
    try {
      const projects = await InstitutionalProjectsService.getByCampusAllocation(campusAllocationId)
      set({ projects, loading: false })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar proyectos por campus'
      set({ error: errorMsg, loading: false })
      console.error(' Error en fetchProjectsByCampusAllocation:', err)
    }
  },

  fetchProjectsByDirector: async (directorId: string) => {
    set({ loading: true, error: null })
    try {
      const projects = await InstitutionalProjectsService.getByDirector(directorId)
      set({ projects, loading: false })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar proyectos por director'
      set({ error: errorMsg, loading: false })
      console.error(' Error en fetchProjectsByDirector:', err)
    }
  },

  fetchProjectsWithAvailableTime: async () => {
    set({ loading: true, error: null })
    try {
      const projects = await InstitutionalProjectsService.getWithAvailableTime()
      set({ projectsWithAvailableTime: projects, loading: false })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar proyectos con tiempo disponible'
      set({ error: errorMsg, loading: false })
      console.error(' Error en fetchProjectsWithAvailableTime:', err)
    }
  },

  fetchTotalAssignedTime: async (campusAllocationId: string) => {
    try {
      const total = await InstitutionalProjectsService.getTotalAssignedTime(campusAllocationId)
      set({ totalAssignedTime: total })
    } catch (err) {
      console.error(' Error en fetchTotalAssignedTime:', err)
    }
  },

  // ============================================================
  //   Escritura de Datos
  // ============================================================

  createProject: async (data: CreateInstitutionalProjectDto) => {
    set({ loading: true, error: null })
    try {
      const newProject = await InstitutionalProjectsService.create(data)
      if (newProject) {
        const { projects } = get()
        set({
          projects: [...projects, newProject],
          selectedProject: newProject,
          loading: false
        })
        return newProject
      }
      set({ loading: false })
      return null
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear proyecto'
      set({ error: errorMsg, loading: false })
      console.error(' Error en createProject:', err)
      throw err
    }
  },

  updateProject: async (id: string, data: UpdateInstitutionalProjectDto) => {
    set({ loading: true, error: null })
    try {
      const updated = await InstitutionalProjectsService.update(id, data)
      if (updated) {
        const { projects, selectedProject } = get()
        set({
          projects: projects.map((p) => (p.id === id ? updated : p)),
          selectedProject: selectedProject?.id === id ? updated : selectedProject,
          loading: false
        })
        return true
      }
      set({ loading: false })
      return false
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar proyecto'
      set({ error: errorMsg, loading: false })
      console.error(' Error en updateProject:', err)
      throw err
    }
  },

  deleteProject: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const success = await InstitutionalProjectsService.delete(id)
      if (success) {
        const { projects, selectedProject } = get()
        set({
          projects: projects.filter((p) => p.id !== id),
          selectedProject: selectedProject?.id === id ? null : selectedProject,
          loading: false
        })
        return true
      }
      set({ loading: false })
      return false
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar proyecto'
      set({ error: errorMsg, loading: false })
      console.error(' Error en deleteProject:', err)
      return false
    }
  },

  // ============================================================
  //   Control de UI
  // ============================================================

  selectProject: (project: InstitutionalProject | null) => {
    set({ selectedProject: project })
  },

  clearError: () => {
    set({ error: null })
  },

  reset: () => {
    set(initialState)
  }
}))

