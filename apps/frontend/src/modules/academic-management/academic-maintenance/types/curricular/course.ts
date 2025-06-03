export type Course = {
  id: string
  nombre: string
  codigo: string
  descripcion?: string
  creditos: number
  nivel: string
  horasContacto: number
  programaId: string // This will need to be updated to schoolId and careerId later
}
