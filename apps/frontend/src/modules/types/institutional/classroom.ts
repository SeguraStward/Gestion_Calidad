export type Classroom = {
  id: string
  nombre: string
  descripcion?: string
  capacidad: number
  // Si vas a relacionarla con otras entidades:
  // escuelaId?: string
  // campusId?: string
}
