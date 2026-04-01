const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

export interface Cohort {
  id?: string
  careerId: string
  year: number
  group: string
  initialStudents: number
  status?: 'ACTIVE' | 'INACTIVE'
  createdAt?: string
  updatedAt?: string
}

export interface CreateCohortDto {
  careerId: string
  year: number
  group: string
  initialStudents: number
  status?: 'ACTIVE' | 'INACTIVE'
}babel

export interface UpdateCohortDto extends Partial<CreateCohortDto> {}

export interface CohortAlert {
  courseId: string
  courseName: string
  courseCode: string
  rezagadosProyectados: number
  recomendaAbrirGrupo: boolean
}

export const CohortsService = {
  async getAll(): Promise<Cohort[]> {
    try {
      const res = await fetch(`${API_URL}/cohorts`, { cache: 'no-store', credentials: 'include' })
      if (!res.ok) return []
      const json = await res.json()
      return Array.isArray(json) ? json : json.data || []
    } catch {
      return []
    }
  },

  async getByCareer(careerId: string): Promise<Cohort[]> {
    try {
      const res = await fetch(`${API_URL}/cohorts/by-career/${careerId}`, { cache: 'no-store', credentials: 'include' })
      if (!res.ok) return []
      const json = await res.json()
      return Array.isArray(json) ? json : json.data || []
    } catch {
      return []
    }
  },

  async getById(id: string): Promise<Cohort | null> {
    try {
      const res = await fetch(`${API_URL}/cohorts/${id}`, { cache: 'no-store', credentials: 'include' })
      if (!res.ok) return null
      const json = await res.json()
      return json?.data || json
    } catch {
      return null
    }
  },

  async create(data: CreateCohortDto): Promise<Cohort | null> {
    const res = await fetch(`${API_URL}/cohorts`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `Error al crear cohorte: ${res.status}`)
    }
    const json = await res.json()
    return json?.data || json
  },

  async update(id: string, data: UpdateCohortDto): Promise<Cohort | null> {
    const res = await fetch(`${API_URL}/cohorts/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `Error al actualizar cohorte: ${res.status}`)
    }
    const json = await res.json()
    return json?.data || json
  },

  async delete(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/cohorts/${id}`, { method: 'DELETE', credentials: 'include' })
      return res.ok
    } catch {
      return false
    }
  },

  async getAlerts(campusId: string): Promise<CohortAlert[]> {
    try {
      const res = await fetch(`${API_URL}/course-reports/alerts/${campusId}`, { cache: 'no-store', credentials: 'include' })
      if (!res.ok) return []
      const json = await res.json()
      return Array.isArray(json) ? json : json.data || []
    } catch {
      return []
    }
  }
}
